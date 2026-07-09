"""Unit tests for lead notification routing and dispatch (mocked DB + email)."""
import asyncio
from unittest.mock import AsyncMock, patch

import pytest

from core.config import settings
from domain.models import NotificationRecipient, NotificationScenario
from services import notification_service


@pytest.fixture(autouse=True)
def enable_email(monkeypatch):
    monkeypatch.setattr(settings, "EMAIL_ENABLED", True)
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key")
    monkeypatch.setattr(settings, "NOTIFY_EMAIL", "admin@grosvenorvistas.com")


def _scenario(key: str, *, enabled: bool = True, fallback: str | None = None) -> NotificationScenario:
    return NotificationScenario(
        _id="s1",
        key=key,
        label=key.replace("_", " ").title(),
        enabled=enabled,
        fallback_email=fallback,
    )


def _recipient(email: str, scenarios: list[str], *, active: bool = True) -> NotificationRecipient:
    return NotificationRecipient(
        _id="r1",
        name="Broker",
        email=email,
        label="Broker",
        active=active,
        scenarios=scenarios,
    )


def test_resolve_scenario_key_maps_brochure_download():
    lead = {"lead_type": "download_brochure"}
    assert notification_service.resolve_scenario_key(lead) == "brochure_download"


def test_resolve_scenario_key_defaults_to_general_lead():
    lead = {"lead_type": "unknown_type"}
    assert notification_service.resolve_scenario_key(lead) == "general_lead"


def test_resolve_recipient_emails_uses_assigned_recipients():
    async def run():
        with patch(
            "services.notification_service.notification_settings_service.get_scenario",
            new=AsyncMock(return_value=_scenario("contact_form")),
        ), patch(
            "services.notification_service.notification_settings_service.list_recipients",
            new=AsyncMock(return_value=[
                _recipient("broker@example.com", ["contact_form"]),
                _recipient("other@example.com", ["brochure_download"]),
            ]),
        ):
            return await notification_service.resolve_recipient_emails("contact_form")

    emails, resolution = asyncio.run(run())
    assert emails == ["broker@example.com"]
    assert resolution == "assigned_recipients"


def test_resolve_recipient_emails_falls_back_to_admin_email():
    async def run():
        with patch(
            "services.notification_service.notification_settings_service.get_scenario",
            new=AsyncMock(return_value=_scenario("contact_form")),
        ), patch(
            "services.notification_service.notification_settings_service.list_recipients",
            new=AsyncMock(return_value=[]),
        ):
            return await notification_service.resolve_recipient_emails("contact_form")

    emails, resolution = asyncio.run(run())
    assert emails == ["admin@grosvenorvistas.com"]
    assert resolution == "fallback_admin_email"


def test_resolve_recipient_emails_uses_scenario_fallback_first():
    async def run():
        with patch(
            "services.notification_service.notification_settings_service.get_scenario",
            new=AsyncMock(return_value=_scenario("contact_form", fallback="scenario-fallback@example.com")),
        ), patch(
            "services.notification_service.notification_settings_service.list_recipients",
            new=AsyncMock(return_value=[]),
        ):
            return await notification_service.resolve_recipient_emails("contact_form")

    emails, resolution = asyncio.run(run())
    assert emails == ["scenario-fallback@example.com"]
    assert resolution == "fallback_admin_email"


def test_resolve_recipient_emails_skips_disabled_scenario():
    async def run():
        with patch(
            "services.notification_service.notification_settings_service.get_scenario",
            new=AsyncMock(return_value=_scenario("contact_form", enabled=False)),
        ):
            return await notification_service.resolve_recipient_emails("contact_form")

    emails, resolution = asyncio.run(run())
    assert emails == []
    assert resolution == "scenario_disabled"


def test_notify_lead_recipients_sends_and_logs():
    lead = {
        "_id": "lead123",
        "lead_type": "download_brochure",
        "first_name": "Jane",
        "last_name": "Buyer",
        "email": "jane@example.com",
    }

    async def run():
        mock_insert = AsyncMock()
        with patch(
            "services.notification_service.notification_settings_service.get_scenario",
            new=AsyncMock(return_value=_scenario("brochure_download")),
        ), patch(
            "services.notification_service.resolve_recipient_emails",
            new=AsyncMock(return_value=(["broker@example.com"], "assigned_recipients")),
        ), patch(
            "services.notification_service.email_service.send_scenario_lead_notification",
            return_value=True,
        ) as mock_send, patch("services.notification_service.db") as mock_db:
            mock_db.__getitem__.return_value.insert_one = mock_insert
            await notification_service.notify_lead_recipients(lead)
            return mock_send, mock_insert

    mock_send, mock_insert = asyncio.run(run())
    mock_send.assert_called_once_with(
        lead=lead,
        scenario_label="Brochure Download",
        to_email="broker@example.com",
    )
    mock_insert.assert_called_once()
    assert mock_insert.call_args.args[0]["status"] == "sent"
    assert mock_insert.call_args.args[0]["scenario"] == "brochure_download"


def test_notify_lead_recipients_logs_skip_when_disabled():
    lead = {"_id": "lead123", "lead_type": "general_contact"}

    async def run():
        mock_insert = AsyncMock()
        with patch(
            "services.notification_service.notification_settings_service.get_scenario",
            new=AsyncMock(return_value=_scenario("contact_form", enabled=False)),
        ), patch(
            "services.notification_service.resolve_recipient_emails",
            new=AsyncMock(return_value=([], "scenario_disabled")),
        ), patch("services.notification_service.db") as mock_db:
            mock_db.__getitem__.return_value.insert_one = mock_insert
            await notification_service.notify_lead_recipients(lead)
            return mock_insert

    mock_insert = asyncio.run(run())
    mock_insert.assert_called_once()
    assert mock_insert.call_args.args[0]["status"] == "skipped"


def test_notify_lead_recipients_does_not_raise_on_send_failure():
    lead = {"_id": "lead123", "lead_type": "general_contact"}

    async def run():
        mock_insert = AsyncMock()
        with patch(
            "services.notification_service.notification_settings_service.get_scenario",
            new=AsyncMock(return_value=_scenario("contact_form")),
        ), patch(
            "services.notification_service.resolve_recipient_emails",
            new=AsyncMock(return_value=(["broker@example.com"], "assigned_recipients")),
        ), patch(
            "services.notification_service.email_service.send_scenario_lead_notification",
            side_effect=RuntimeError("network down"),
        ), patch("services.notification_service.db") as mock_db:
            mock_db.__getitem__.return_value.insert_one = mock_insert
            await notification_service.notify_lead_recipients(lead)
            return mock_insert

    mock_insert = asyncio.run(run())
    assert mock_insert.call_args.args[0]["status"] == "failed"

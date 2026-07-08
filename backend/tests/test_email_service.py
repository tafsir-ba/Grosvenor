"""Unit tests for Resend email integration (mocked — no live API calls)."""
from unittest.mock import MagicMock, patch

import pytest

from core.config import settings
from services import email_service


@pytest.fixture(autouse=True)
def enable_email(monkeypatch):
    monkeypatch.setattr(settings, "EMAIL_ENABLED", True)
    monkeypatch.setattr(settings, "RESEND_API_KEY", "re_test_key")
    monkeypatch.setattr(settings, "EMAIL_FROM", "Grosvenor Vistas <info@grosvenorvistas.com>")
    monkeypatch.setattr(settings, "NOTIFY_EMAIL", "staff@grosvenorvistas.com")


SAMPLE_LEAD = {
    "first_name": "Jane",
    "last_name": "Buyer",
    "email": "jane@example.com",
    "phone": "+18761112222",
    "message": "Interested in a residence.",
    "lead_type": "general_contact",
    "project": "Grosvenor Vistas",
    "source_page": "/contact",
}


@patch("services.email_service.requests.post")
def test_notify_staff_calls_resend(mock_post):
    mock_post.return_value = MagicMock(status_code=200, content=b'{"id":"1"}')
    mock_post.return_value.raise_for_status = MagicMock()

    assert email_service.notify_staff_new_lead(SAMPLE_LEAD) is True

    mock_post.assert_called_once()
    call_kwargs = mock_post.call_args.kwargs
    assert call_kwargs["json"]["to"] == ["staff@grosvenorvistas.com"]
    assert call_kwargs["json"]["reply_to"] == "jane@example.com"
    assert "Jane Buyer" in call_kwargs["json"]["subject"]
    assert call_kwargs["headers"]["Authorization"] == "Bearer re_test_key"


@patch("services.email_service.requests.post")
def test_confirmation_sent_to_visitor(mock_post):
    mock_post.return_value = MagicMock(status_code=200, content=b'{"id":"1"}')
    mock_post.return_value.raise_for_status = MagicMock()

    assert email_service.send_lead_confirmation(SAMPLE_LEAD) is True

    mock_post.assert_called_once()
    assert mock_post.call_args.kwargs["json"]["to"] == ["jane@example.com"]
    assert "Thank you" in mock_post.call_args.kwargs["json"]["html"]


@patch("services.email_service.requests.post")
def test_send_failure_does_not_raise(mock_post):
    mock_post.side_effect = RuntimeError("network down")

    assert email_service.notify_staff_new_lead(SAMPLE_LEAD) is False
    assert email_service.send_lead_confirmation(SAMPLE_LEAD) is False


def test_disabled_when_no_api_key(monkeypatch):
    monkeypatch.setattr(settings, "EMAIL_ENABLED", False)
    monkeypatch.setattr(settings, "RESEND_API_KEY", "")

    with patch("services.email_service.requests.post") as mock_post:
        assert email_service.notify_staff_new_lead(SAMPLE_LEAD) is False
        mock_post.assert_not_called()


@patch("services.email_service.requests.post")
def test_send_residence_to_buyer(mock_post, tmp_path):
    mock_post.return_value = MagicMock(status_code=200, content=b'{"id":"1"}')
    mock_post.return_value.raise_for_status = MagicMock()

    plan = tmp_path / "A101.pdf"
    plan.write_bytes(b"%PDF-1.4 test")

    unit = {
        "unit_number": "A101",
        "building": "Block A — Heliconia",
        "status": "available",
        "total_surface": 1200,
        "balcony_surface": 150,
        "price": 450000,
        "currency": "USD",
    }

    assert email_service.send_residence_to_buyer(
        to="buyer@example.com",
        unit=unit,
        note="Looking forward to your visit.",
        residence_type="Vista 2 Bed",
        bedrooms=2,
        bathrooms=2,
        floorplans_dir=tmp_path,
    ) is True

    payload = mock_post.call_args.kwargs["json"]
    assert payload["to"] == ["buyer@example.com"]
    assert payload["cc"] == ["staff@grosvenorvistas.com"]
    assert payload["attachments"][0]["filename"].endswith(".pdf")
    assert "Looking forward" in payload["html"]

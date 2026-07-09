"""Centralized lead notification dispatch — scenario routing, logging, fallback."""
import logging
from typing import List, Optional

from core.config import settings
from core.db import db
from domain.base import utc_now_iso
from domain.notification_scenarios import LEAD_TYPE_SCENARIO_MAP, LeadNotificationScenario
from services import email_service, notification_settings_service

logger = logging.getLogger(__name__)

LOGS_COL = "notification_logs"


def resolve_scenario_key(lead: dict) -> str:
    lead_type = lead.get("lead_type") or ""
    return LEAD_TYPE_SCENARIO_MAP.get(
        lead_type,
        LeadNotificationScenario.GENERAL_LEAD.value,
    )


async def resolve_recipient_emails(scenario_key: str) -> tuple[List[str], str]:
    """Return (emails, resolution_note) for logging."""
    scenario = await notification_settings_service.get_scenario(scenario_key)
    if scenario and not scenario.enabled:
        return [], "scenario_disabled"

    recipients = await notification_settings_service.list_recipients()
    emails = sorted({
        r.email.lower()
        for r in recipients
        if r.active and scenario_key in (r.scenarios or [])
    })

    if emails:
        return emails, "assigned_recipients"

    fallback = None
    if scenario and scenario.fallback_email:
        fallback = scenario.fallback_email
    elif settings.NOTIFY_EMAIL:
        fallback = settings.NOTIFY_EMAIL

    if fallback:
        return [fallback.lower()], "fallback_admin_email"

    return [], "no_recipients_configured"


async def _log_notification(
    *,
    lead_id: str,
    scenario: str,
    recipients: List[str],
    status: str,
    error_message: Optional[str] = None,
) -> None:
    await db[LOGS_COL].insert_one({
        "lead_id": lead_id,
        "scenario": scenario,
        "recipients": recipients,
        "status": status,
        "error_message": error_message,
        "created_at": utc_now_iso(),
    })


async def notify_lead_recipients(lead: dict) -> None:
    """Send scenario-based staff notifications without blocking lead capture."""
    try:
        await _notify_lead_recipients(lead)
    except Exception as exc:
        logger.warning("Lead notification dispatch failed for lead %s: %s", lead.get("_id"), exc)


async def _notify_lead_recipients(lead: dict) -> None:
    lead_id = str(lead.get("_id") or lead.get("id") or "")
    scenario_key = resolve_scenario_key(lead)
    scenario = await notification_settings_service.get_scenario(scenario_key)
    scenario_label = scenario.label if scenario else scenario_key.replace("_", " ").title()

    emails, resolution = await resolve_recipient_emails(scenario_key)

    if resolution == "scenario_disabled":
        await _log_notification(
            lead_id=lead_id,
            scenario=scenario_key,
            recipients=[],
            status="skipped",
            error_message="Scenario notifications are disabled",
        )
        logger.info("Notification skipped for lead %s (%s disabled)", lead_id, scenario_key)
        return

    if not emails:
        await _log_notification(
            lead_id=lead_id,
            scenario=scenario_key,
            recipients=[],
            status="skipped",
            error_message="No recipients configured and no fallback email",
        )
        logger.warning("No notification recipients for lead %s scenario %s", lead_id, scenario_key)
        return

    if not settings.EMAIL_ENABLED:
        await _log_notification(
            lead_id=lead_id,
            scenario=scenario_key,
            recipients=emails,
            status="skipped",
            error_message="Email delivery is disabled",
        )
        return

    failures: List[str] = []
    successes: List[str] = []
    for email in emails:
        try:
            sent = email_service.send_scenario_lead_notification(
                lead=lead,
                scenario_label=scenario_label,
                to_email=email,
            )
            if sent:
                successes.append(email)
            else:
                failures.append(email)
        except Exception as exc:
            logger.warning("Notification to %s failed: %s", email, exc)
            failures.append(email)

    if successes:
        await _log_notification(
            lead_id=lead_id,
            scenario=scenario_key,
            recipients=successes,
            status="failed" if failures else "sent",
            error_message=f"Partial failure: {', '.join(failures)}" if failures else None,
        )
    else:
        await _log_notification(
            lead_id=lead_id,
            scenario=scenario_key,
            recipients=emails,
            status="failed",
            error_message=f"All sends failed: {', '.join(failures)}",
        )

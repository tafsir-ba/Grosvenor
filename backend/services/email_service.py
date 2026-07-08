"""Outbound email via Resend — staff notifications + visitor confirmations.

Isolated here so lead capture never depends on email succeeding.
"""
import asyncio
import html
import logging
from typing import Optional

import requests

from core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"

LEAD_TYPE_LABELS = {
    "general_contact": "General Contact",
    "book_showroom_visit": "Book Showroom Visit",
    "download_brochure": "Brochure Download",
    "download_price_list": "Price List Download",
    "contact_about_unit": "Unit Enquiry",
    "mortgage_info_request": "Mortgage Enquiry",
    "sales_explorer": "Sales Explorer Inquiry",
}


def _esc(value) -> str:
    return html.escape("" if value is None else str(value))


def _send_email(
    to: str,
    subject: str,
    html_body: str,
    reply_to: Optional[str] = None,
) -> bool:
    if not settings.EMAIL_ENABLED:
        logger.debug("Email disabled — skipped: %s", subject)
        return False
    if not to:
        logger.warning("Email skipped (no recipient): %s", subject)
        return False

    payload = {
        "from": settings.EMAIL_FROM,
        "to": [to],
        "subject": subject,
        "html": html_body,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    try:
        resp = requests.post(
            RESEND_API_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        resp.raise_for_status()
        return True
    except Exception as exc:
        logger.warning("Resend email failed (%s): %s", subject, exc)
        return False


def _lead_summary_rows(lead: dict) -> str:
    rows = [
        ("Name", f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip()),
        ("Email", lead.get("email")),
        ("Phone", lead.get("phone") or "—"),
        ("Type", LEAD_TYPE_LABELS.get(lead.get("lead_type"), lead.get("lead_type"))),
        ("Project", lead.get("project")),
        ("Source page", lead.get("source_page") or "—"),
        ("Unit", lead.get("source_unit") or "—"),
        ("Building", lead.get("source_building") or "—"),
        ("Collection", lead.get("collection") or "—"),
    ]
    if lead.get("unit_surface"):
        rows.append(("Surface", f"{lead.get('unit_surface')} sq ft"))
    if lead.get("message"):
        rows.append(("Message", lead.get("message")))

    return "".join(
        f"<tr><td style='padding:6px 12px 6px 0;color:#666;vertical-align:top'>{_esc(label)}</td>"
        f"<td style='padding:6px 0'>{_esc(value)}</td></tr>"
        for label, value in rows
    )


def notify_staff_new_lead(lead: dict) -> bool:
    """Alert the sales inbox that a new enquiry was captured."""
    name = f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip()
    lead_type = LEAD_TYPE_LABELS.get(lead.get("lead_type"), lead.get("lead_type"))
    subject = f"New {lead_type} — {name or 'Enquiry'}"
    body = f"""
    <div style="font-family:Arial,sans-serif;color:#2c241c;max-width:560px">
      <h2 style="color:#064F73;font-weight:normal;margin:0 0 16px">New website enquiry</h2>
      <table style="border-collapse:collapse;font-size:15px;line-height:1.5">
        {_lead_summary_rows(lead)}
      </table>
      <p style="margin-top:24px;font-size:13px;color:#888">
        View all leads in the admin dashboard.
      </p>
    </div>
    """
    return _send_email(
        settings.NOTIFY_EMAIL,
        subject,
        body,
        reply_to=lead.get("email"),
    )


def send_lead_confirmation(lead: dict) -> bool:
    """Auto-reply so the visitor knows their enquiry was received."""
    first = lead.get("first_name") or "there"
    subject = "We received your enquiry — Grosvenor Vistas"
    body = f"""
    <div style="font-family:Arial,sans-serif;color:#2c241c;max-width:560px">
      <h2 style="color:#064F73;font-weight:normal;margin:0 0 16px">Thank you, {_esc(first)}</h2>
      <p style="font-size:16px;line-height:1.6">
        We have received your enquiry and a member of our team will be in touch shortly.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#555">
        Grosvenor Vistas · Grosvenor Heights, Manor Park, Kingston 8, Jamaica
      </p>
    </div>
    """
    return _send_email(lead.get("email"), subject, body)


async def send_lead_notifications(lead: dict) -> None:
    """Fire staff + confirmation emails without blocking lead capture."""
    if not settings.EMAIL_ENABLED:
        return
    results = await asyncio.gather(
        asyncio.to_thread(notify_staff_new_lead, lead),
        asyncio.to_thread(send_lead_confirmation, lead),
        return_exceptions=True,
    )
    for result in results:
        if isinstance(result, Exception):
            logger.warning("Lead email task failed: %s", result)

"""Outbound email via Resend — staff notifications + visitor confirmations.

Isolated here so lead capture never depends on email succeeding.
"""
import asyncio
import base64
import html
import logging
import re
from pathlib import Path
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
    cc: Optional[list[str]] = None,
    attachments: Optional[list[dict]] = None,
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
    if cc:
        payload["cc"] = [addr for addr in cc if addr]
    if attachments:
        payload["attachments"] = attachments

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
        ("Name", f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip() or "—"),
        ("Email", lead.get("email") or "—"),
        ("Phone", lead.get("phone") or "—"),
        ("Scenario", lead.get("_scenario_label") or LEAD_TYPE_LABELS.get(lead.get("lead_type"), lead.get("lead_type"))),
        ("Lead type", LEAD_TYPE_LABELS.get(lead.get("lead_type"), lead.get("lead_type"))),
        ("Project", lead.get("project")),
        ("Source page", lead.get("source_page") or "—"),
        ("Source URL", lead.get("source_url") or "—"),
        ("Unit", lead.get("source_unit") or "—"),
        ("Building", lead.get("source_building") or "—"),
        ("Collection", lead.get("collection") or "—"),
        ("Submitted", lead.get("created_at") or "—"),
    ]
    if lead.get("unit_surface"):
        rows.append(("Surface", f"{lead.get('unit_surface')} sq ft"))
    if lead.get("message"):
        rows.append(("Message", lead.get("message")))

    utm_parts = [
        lead.get("utm_source"),
        lead.get("utm_medium"),
        lead.get("utm_campaign"),
        lead.get("utm_content"),
        lead.get("utm_term"),
    ]
    if any(utm_parts):
        rows.append(("UTM", " / ".join(p for p in utm_parts if p)))

    return "".join(
        f"<tr><td style='padding:6px 12px 6px 0;color:#666;vertical-align:top'>{_esc(label)}</td>"
        f"<td style='padding:6px 0'>{_esc(value)}</td></tr>"
        for label, value in rows
    )


def send_scenario_lead_notification(*, lead: dict, scenario_label: str, to_email: str) -> bool:
    """Send a scenario-specific staff notification to one recipient."""
    name = f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip()
    lead_copy = {**lead, "_scenario_label": scenario_label}
    subject = f"[Grosvenor] New Lead: {scenario_label}"
    body = f"""
    <div style="font-family:Arial,sans-serif;color:#2c241c;max-width:560px">
      <h2 style="color:#064F73;font-weight:normal;margin:0 0 16px">New { _esc(scenario_label) } Lead</h2>
      <table style="border-collapse:collapse;font-size:15px;line-height:1.5">
        {_lead_summary_rows(lead_copy)}
      </table>
      <p style="margin-top:24px;font-size:13px;color:#888">
        View all leads in the admin dashboard.
      </p>
    </div>
    """
    reply_to = lead.get("email") if lead.get("email") else None
    return _send_email(to_email, subject, body, reply_to=reply_to)


def notify_staff_new_lead(lead: dict) -> bool:
    """Legacy single-recipient alert — prefer notification_service.notify_lead_recipients."""
    name = f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip()
    lead_type = LEAD_TYPE_LABELS.get(lead.get("lead_type"), lead.get("lead_type"))
    return send_scenario_lead_notification(
        lead=lead,
        scenario_label=lead_type,
        to_email=settings.NOTIFY_EMAIL,
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
    """Fire visitor confirmation email without blocking lead capture."""
    if not settings.EMAIL_ENABLED or not lead.get("email"):
        return
    try:
        await asyncio.to_thread(send_lead_confirmation, lead)
    except Exception as exc:
        logger.warning("Lead confirmation email failed: %s", exc)


def _floorplan_path(unit_number: str, floorplans_dir: Path) -> Optional[Path]:
    safe = re.sub(r"[^A-Za-z0-9 ]", "", unit_number).strip()
    path = floorplans_dir / f"{safe}.pdf"
    return path if path.is_file() else None


def send_residence_to_buyer(
    *,
    to: str,
    unit: dict,
    note: Optional[str] = None,
    cc_sales: bool = True,
    residence_type: Optional[str] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[float] = None,
    floorplans_dir: Path,
) -> bool:
    """Email a buyer the residence summary with an attached floor-plan PDF when available."""
    unit_number = unit.get("unit_number") or "—"
    building = unit.get("building") or "—"
    price = unit.get("price")
    currency = unit.get("currency") or "USD"
    status = (unit.get("status") or "available").replace("_", " ").title()
    price_line = (
        f"{currency} {price:,.0f}"
        if price is not None
        else "On request"
    )

    detail_rows = [
        ("Residence", unit_number),
        ("Building", building),
        ("Status", status),
        ("Total surface", f"{unit.get('total_surface', '—')} sq ft"),
        ("Balcony", f"{unit.get('balcony_surface', '—')} sq ft"),
        ("Price", price_line),
    ]
    if residence_type:
        detail_rows.append(("Type", residence_type))
    if bedrooms is not None:
        detail_rows.append(("Bedrooms", str(bedrooms)))
    if bathrooms is not None:
        detail_rows.append(("Bathrooms", str(bathrooms)))

    rows_html = "".join(
        f"<tr><td style='padding:6px 12px 6px 0;color:#666;vertical-align:top'>{_esc(label)}</td>"
        f"<td style='padding:6px 0'>{_esc(value)}</td></tr>"
        for label, value in detail_rows
    )
    note_html = (
        f"<p style='margin-top:20px;font-size:15px;line-height:1.6'><strong>Note from your advisor:</strong><br>{_esc(note)}</p>"
        if note
        else ""
    )

    subject = f"Residence {unit_number} — Grosvenor Vistas"
    body = f"""
    <div style="font-family:Arial,sans-serif;color:#2c241c;max-width:560px">
      <h2 style="color:#064F73;font-weight:normal;margin:0 0 16px">Your residence at Grosvenor Vistas</h2>
      <p style="font-size:16px;line-height:1.6">
        Please find the details for the residence discussed with our team below.
        The floor plan is attached when available.
      </p>
      <table style="border-collapse:collapse;font-size:15px;line-height:1.5;margin-top:12px">
        {rows_html}
      </table>
      {note_html}
      <p style="margin-top:24px;font-size:13px;color:#888">
        Grosvenor Vistas · Grosvenor Heights, Manor Park, Kingston 8, Jamaica
      </p>
    </div>
    """

    attachments = []
    plan_path = _floorplan_path(unit_number, floorplans_dir)
    if plan_path:
        attachments.append({
            "filename": f"Residence-{unit_number.replace(' ', '-')}-Floor-Plan.pdf",
            "content": base64.b64encode(plan_path.read_bytes()).decode("ascii"),
        })

    cc = [settings.NOTIFY_EMAIL] if cc_sales and settings.NOTIFY_EMAIL else None
    return _send_email(
        to,
        subject,
        body,
        reply_to=settings.NOTIFY_EMAIL or None,
        cc=cc,
        attachments=attachments or None,
    )

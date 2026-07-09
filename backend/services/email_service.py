"""Outbound email via Resend — branded staff notifications + visitor confirmations.

Isolated here so lead capture never depends on email succeeding.
"""
import asyncio
import base64
import logging
import re
from pathlib import Path
from typing import Optional

import requests

from core.config import settings
from services import email_templates

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


def _send_email(
    to: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
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
    if text_body:
        payload["text"] = text_body
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


def _lead_table_rows(lead: dict) -> list[tuple[str, str]]:
    scenario = (
        lead.get("_scenario_label")
        or LEAD_TYPE_LABELS.get(lead.get("lead_type"), lead.get("lead_type"))
    )
    rows = [
        ("Name", f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip() or "—"),
        ("Email", lead.get("email") or "—"),
        ("Phone", lead.get("phone") or "—"),
        ("Scenario", scenario),
        ("Lead type", LEAD_TYPE_LABELS.get(lead.get("lead_type"), lead.get("lead_type"))),
        ("Project", lead.get("project") or "—"),
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
    return rows


def send_scenario_lead_notification(*, lead: dict, scenario_label: str, to_email: str) -> bool:
    """Send a scenario-specific staff notification to one recipient."""
    lead_copy = {**lead, "_scenario_label": scenario_label}
    name = f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip() or "Anonymous"
    table_rows = _lead_table_rows(lead_copy)
    subject = f"[Grosvenor] New Lead: {scenario_label}"
    admin_url = f"{settings.EMAIL_SITE_URL}/admin/leads"

    html_body = email_templates.render_email(
        variant="internal",
        preheader=f"New {scenario_label} lead from {name}",
        eyebrow="New lead",
        title=f"{scenario_label}",
        body_html=email_templates.render_body_paragraphs(
            "A new lead has been captured on the website. "
            "The details are summarised below.",
        ),
        table_rows=table_rows,
        cta_label="View in admin",
        cta_href=admin_url,
        cta_gold=False,
    )
    text_body = email_templates.render_plain_text(
        title=f"New {scenario_label} lead",
        paragraphs=["A new lead has been captured on the website."],
        table_rows=table_rows,
        cta_label="View in admin",
        cta_href=admin_url,
        footer_note="Internal notification — Grosvenor Vistas admin",
    )
    reply_to = lead.get("email") if lead.get("email") else None
    return _send_email(to_email, subject, html_body, text_body=text_body, reply_to=reply_to)


def notify_staff_new_lead(lead: dict) -> bool:
    """Legacy single-recipient alert — prefer notification_service.notify_lead_recipients."""
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
    site_url = settings.EMAIL_SITE_URL

    html_body = email_templates.render_email(
        variant="external",
        preheader="Thank you for your interest in Grosvenor Vistas.",
        eyebrow="Thank you",
        title=f"Thank you, {first}",
        body_html=email_templates.render_body_paragraphs(
            "We have received your enquiry and a member of our team "
            "will be in touch shortly.",
            "In the meantime, you are welcome to explore the residences, "
            "amenities, and location at Grosvenor Vistas.",
        ),
        cta_label="Explore residences",
        cta_href=f"{site_url}/residences",
        cta_gold=True,
    )
    text_body = email_templates.render_plain_text(
        title=f"Thank you, {first}",
        paragraphs=[
            "We have received your enquiry and a member of our team will be in touch shortly.",
            "Explore the residences at Grosvenor Vistas:",
        ],
        cta_label="Explore residences",
        cta_href=f"{site_url}/residences",
    )
    return _send_email(lead.get("email"), subject, html_body, text_body=text_body)


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

    note_html = email_templates.render_note_box(note) if note else ""

    subject = f"Residence {unit_number} — Grosvenor Vistas"
    site_url = settings.EMAIL_SITE_URL
    html_body = email_templates.render_email(
        variant="external",
        preheader=f"Your residence details for {unit_number} at Grosvenor Vistas.",
        eyebrow="Your residence",
        title=f"Residence {unit_number}",
        body_html=email_templates.render_body_paragraphs(
            "Please find the details for the residence discussed with our team below. "
            "The floor plan is attached when available.",
        ),
        table_rows=detail_rows,
        note_html=note_html,
        cta_label="View on website",
        cta_href=f"{site_url}/residences",
        cta_gold=True,
    )
    text_body = email_templates.render_plain_text(
        title=f"Residence {unit_number}",
        paragraphs=[
            "Please find the details for the residence discussed with our team below.",
            f"Advisor note: {note}" if note else "",
        ],
        table_rows=detail_rows,
        cta_label="View on website",
        cta_href=f"{site_url}/residences",
    )
    text_body = "\n".join(line for line in text_body.splitlines() if line.strip())

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
        html_body,
        text_body=text_body,
        reply_to=settings.NOTIFY_EMAIL or None,
        cc=cc,
        attachments=attachments or None,
    )

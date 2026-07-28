"""CRM integration — the single, isolated outbound/inbound CRM boundary.

Outbound leads target the EvoHome website-lead webhook:
  POST https://crm.evo-home.ch/api/integrations/website/leads

Allowed payload keys (strict — unknown keys are rejected):
  firstName, lastName, email|phone, message, source, externalId, idempotencyKey
  (projectId / projectReference must be omitted when the integration is locked
  to its default project.)

Auth (either header works):
  X-Integration-Key: <apiKey>
  Authorization: Bearer <apiKey>
"""
import logging
from typing import Optional

import requests

from core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_LEAD_SOURCE = "grosvenorvistas.com"


def _compose_message(lead: dict) -> Optional[str]:
    """Fold unit/attribution context into `message` (the only free-text CRM field)."""
    parts: list[str] = []
    visitor_message = (lead.get("message") or "").strip()
    if visitor_message:
        parts.append(visitor_message)

    context: list[str] = []
    lead_type = lead.get("lead_type")
    if lead_type:
        context.append(f"Inquiry type: {lead_type}")
    project = lead.get("project")
    if project:
        context.append(f"Project: {project}")
    if lead.get("source_unit"):
        context.append(f"Residence: {lead.get('source_unit')}")
    if lead.get("source_building"):
        context.append(f"Building: {lead.get('source_building')}")
    if lead.get("collection"):
        context.append(f"Collection: {lead.get('collection')}")
    if lead.get("residence_type"):
        context.append(f"Residence type: {lead.get('residence_type')}")
    if lead.get("unit_floor") is not None:
        context.append(f"Floor: {lead.get('unit_floor')}")
    if lead.get("unit_surface") is not None:
        context.append(f"Total surface: {lead.get('unit_surface')}")
    if lead.get("unit_living") is not None:
        context.append(f"Living area: {lead.get('unit_living')}")
    if lead.get("unit_balcony") is not None:
        context.append(f"Balcony: {lead.get('unit_balcony')}")
    if lead.get("unit_status"):
        context.append(f"Unit status: {lead.get('unit_status')}")
    if lead.get("source_page"):
        context.append(f"Page: {lead.get('source_page')}")
    if lead.get("source_url"):
        context.append(f"URL: {lead.get('source_url')}")

    utm_bits = []
    for key in ("utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"):
        value = lead.get(key)
        if value:
            utm_bits.append(f"{key}={value}")
    if utm_bits:
        context.append("UTM: " + " ".join(utm_bits))

    if lead.get("consent") is True:
        context.append("Consent: accepted")

    if context:
        parts.append("—\n" + "\n".join(context))

    return "\n\n".join(parts) if parts else None


def build_lead_payload(lead: dict) -> dict:
    """Map an internal Lead document to the EvoHome website-lead webhook payload."""
    payload: dict = {
        "firstName": (lead.get("first_name") or "").strip(),
        "lastName": (lead.get("last_name") or "").strip(),
        "source": DEFAULT_LEAD_SOURCE,
    }

    email = lead.get("email")
    phone = lead.get("phone")
    if email:
        payload["email"] = email
    if phone:
        payload["phone"] = phone

    message = _compose_message(lead)
    if message:
        payload["message"] = message

    lead_id = lead.get("_id") or lead.get("id")
    if lead_id:
        external_id = str(lead_id)
        payload["externalId"] = external_id
        payload["idempotencyKey"] = external_id

    # Intentionally omit projectId / projectReference — integration is locked
    # to its default destination project in EvoHome CRM settings.
    return payload


def map_crm_unit(record: dict) -> dict:
    """Map an inbound CRM unit record to our Unit fields (used by future sync)."""
    return {
        "building": record.get("building") or record.get("block"),
        "unit_number": record.get("unit") or record.get("unit_no"),
        "floor": record.get("floor") or record.get("level"),
        "total_surface": record.get("internal_area") or record.get("total_surface"),
        "balcony_surface": record.get("balcony_area") or 0,
        "price": record.get("price") or record.get("list_price"),
        "currency": record.get("currency", "USD"),
        "status": (record.get("status") or "available").lower(),
        "crm_id": str(record.get("id")) if record.get("id") is not None else None,
    }


def _auth_headers() -> dict:
    headers = {"Content-Type": "application/json"}
    if not settings.CRM_API_KEY:
        return headers

    header_name = settings.CRM_AUTH_HEADER or "X-Integration-Key"
    value = settings.CRM_API_KEY
    if header_name.lower() == "authorization" and not value.lower().startswith("bearer "):
        value = f"Bearer {value}"
    headers[header_name] = value
    return headers


def _extract_crm_reference(data: dict) -> str:
    """Parse EvoHome `{data:{leadId}}` as well as flat id/reference responses."""
    if not isinstance(data, dict):
        return "synced"
    nested = data.get("data")
    if isinstance(nested, dict):
        lead_id = nested.get("leadId") or nested.get("id") or nested.get("reference")
        if lead_id:
            return str(lead_id)
    return str(data.get("leadId") or data.get("id") or data.get("reference") or "synced")


def push_lead(lead: dict) -> Optional[str]:
    """POST a lead to the CRM. Returns a CRM reference id, or None if disabled/failed."""
    if not settings.CRM_SYNC_ENABLED or not settings.CRM_WEBHOOK_URL:
        return None
    try:
        resp = requests.post(
            settings.CRM_WEBHOOK_URL,
            json=build_lead_payload(lead),
            headers=_auth_headers(),
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json() if resp.content else {}
        return _extract_crm_reference(data)
    except Exception as exc:  # network/CRM errors must never break lead capture
        logger.warning("CRM lead push failed: %s", exc)
        return None


def get_crm_status() -> dict:
    return {
        "enabled": settings.CRM_SYNC_ENABLED,
        "configured": bool(settings.CRM_WEBHOOK_URL and settings.CRM_API_KEY),
        "webhook_url_set": bool(settings.CRM_WEBHOOK_URL),
    }


def sync_units_from_crm() -> dict:
    """Placeholder for future inbound CRM unit sync."""
    if not settings.CRM_SYNC_ENABLED or not settings.CRM_WEBHOOK_URL:
        return {
            "ok": True,
            "synced": False,
            "message": "CRM sync is not configured. Set CRM_SYNC_ENABLED and CRM_WEBHOOK_URL to enable unit synchronization.",
            "units_updated": 0,
        }
    return {
        "ok": True,
        "synced": False,
        "message": "CRM inbound sync is not yet implemented for this provider.",
        "units_updated": 0,
    }

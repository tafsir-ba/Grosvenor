"""CRM integration — the single, isolated outbound/inbound CRM boundary.

The website never talks to the CRM anywhere else. Lead push is config-driven
(env), so wiring the real CRM later is a configuration change, not a code change.
"""
import logging
from typing import Optional

import requests

from core.config import settings

logger = logging.getLogger(__name__)


def build_lead_payload(lead: dict) -> dict:
    """Map an internal Lead document to the CRM's expected contact payload."""
    return {
        "contact": {
            "first_name": lead.get("first_name"),
            "last_name": lead.get("last_name"),
            "email": lead.get("email"),
            "phone": lead.get("phone"),
        },
        "note": lead.get("message"),
        "project": lead.get("project"),
        "inquiry_type": lead.get("lead_type"),
        "residence_ref": lead.get("source_unit"),
        "building_ref": lead.get("source_building"),
        "source_page": lead.get("source_page"),
        "source_url": lead.get("source_url"),
        "consent_accepted": lead.get("consent"),
        "attribution": {
            "utm_source": lead.get("utm_source"),
            "utm_medium": lead.get("utm_medium"),
            "utm_campaign": lead.get("utm_campaign"),
            "utm_content": lead.get("utm_content"),
            "utm_term": lead.get("utm_term"),
        },
        "created_at": lead.get("created_at"),
    }


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


def push_lead(lead: dict) -> Optional[str]:
    """POST a lead to the CRM. Returns a CRM reference id, or None if disabled/failed."""
    if not settings.CRM_SYNC_ENABLED or not settings.CRM_WEBHOOK_URL:
        return None
    headers = {"Content-Type": "application/json"}
    if settings.CRM_API_KEY:
        headers[settings.CRM_AUTH_HEADER] = settings.CRM_API_KEY
    try:
        resp = requests.post(
            settings.CRM_WEBHOOK_URL,
            json=build_lead_payload(lead),
            headers=headers,
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json() if resp.content else {}
        return str(data.get("id") or data.get("reference") or "synced")
    except Exception as exc:  # network/CRM errors must never break lead capture
        logger.warning("CRM lead push failed: %s", exc)
        return None

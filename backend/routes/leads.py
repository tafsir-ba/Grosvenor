"""Public lead capture + lightweight click tracking (both create Lead records)."""
from fastapi import APIRouter, HTTPException

from domain.enums import CLICK_LEAD_TYPES
from domain.models import LeadCreate
from services import leads_service

router = APIRouter(tags=["leads"])


@router.post("/leads")
async def create_lead(payload: LeadCreate):
    lead = await leads_service.create_lead(payload)
    return {"ok": True, "id": lead.id}


@router.post("/track")
async def track_event(payload: LeadCreate):
    """For whatsapp/phone/email clicks (anonymous). Restricted to click events."""
    if payload.lead_type not in CLICK_LEAD_TYPES:
        raise HTTPException(status_code=422, detail="This endpoint accepts click events only.")
    lead = await leads_service.create_lead(payload)
    return {"ok": True, "id": lead.id}

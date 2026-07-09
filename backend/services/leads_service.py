"""Leads business logic — the single place a lead is created and synced to CRM."""
from typing import List, Optional

from bson import ObjectId
from fastapi import HTTPException

from core.db import db
from domain.base import utc_now_iso
from domain.enums import ANONYMOUS_LEAD_TYPES, CLICK_LEAD_TYPES, LeadStatus, LeadType
from domain.models import Lead, LeadCreate, LeadUpdate
from services import crm, email_service, notification_service

COLLECTION = "leads"


async def create_lead(payload: LeadCreate) -> Lead:
    # Real form submissions require contact info + consent; click events do not.
    if payload.lead_type not in ANONYMOUS_LEAD_TYPES:
        if not payload.first_name or not payload.last_name or not payload.email:
            raise HTTPException(status_code=422, detail="First name, last name and email are required.")
        if not payload.consent:
            raise HTTPException(status_code=422, detail="Please accept the data processing consent to continue.")

    lead = Lead(**payload.model_dump())
    doc = lead.to_mongo()

    # Anonymous clicks are not pushed to the CRM as contacts.
    if payload.lead_type not in ANONYMOUS_LEAD_TYPES:
        reference = crm.push_lead(doc)
        if reference:
            doc["crm_synced"] = True
            doc["crm_reference"] = reference

    res = await db[COLLECTION].insert_one(doc)
    lead_id = str(res.inserted_id)
    doc["_id"] = lead_id

    await notification_service.notify_lead_recipients(doc)

    if payload.lead_type not in ANONYMOUS_LEAD_TYPES:
        await email_service.send_lead_notifications(doc)

    return await get_lead(lead_id)


async def get_lead(lead_id: str) -> Optional[Lead]:
    doc = await db[COLLECTION].find_one({"_id": ObjectId(lead_id)})
    return Lead.from_mongo(doc)


async def list_leads(lead_type: Optional[LeadType] = None,
                     status: Optional[LeadStatus] = None) -> List[Lead]:
    query: dict = {}
    if lead_type:
        query["lead_type"] = lead_type.value
    if status:
        query["status"] = status.value
    docs = await db[COLLECTION].find(query).sort("created_at", -1).to_list(2000)
    return [Lead.from_mongo(d) for d in docs]


async def update_lead(lead_id: str, payload: LeadUpdate) -> Optional[Lead]:
    changes = payload.model_dump(exclude_none=True)
    changes["updated_at"] = utc_now_iso()
    await db[COLLECTION].update_one({"_id": ObjectId(lead_id)}, {"$set": changes})
    return await get_lead(lead_id)

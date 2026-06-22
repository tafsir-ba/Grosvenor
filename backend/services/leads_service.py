"""Leads business logic — the single place a lead is created and synced to CRM."""
from typing import List, Optional

from bson import ObjectId
from fastapi import HTTPException

from core.db import db
from domain.base import utc_now_iso
from domain.enums import CLICK_LEAD_TYPES, LeadStatus, LeadType
from domain.models import Lead, LeadCreate, LeadUpdate
from services import crm

COLLECTION = "leads"


async def create_lead(payload: LeadCreate) -> Lead:
    # Real form submissions require contact info; click events do not.
    if payload.lead_type not in CLICK_LEAD_TYPES:
        if not payload.name or not payload.email:
            raise HTTPException(status_code=422, detail="Name and email are required.")

    lead = Lead(**payload.model_dump())
    doc = lead.to_mongo()

    # Anonymous clicks are not pushed to the CRM as contacts.
    if payload.lead_type not in CLICK_LEAD_TYPES:
        reference = crm.push_lead(doc)
        if reference:
            doc["crm_synced"] = True
            doc["crm_reference"] = reference

    res = await db[COLLECTION].insert_one(doc)
    return await get_lead(str(res.inserted_id))


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

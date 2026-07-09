"""Leads business logic — the single place a lead is created and synced to CRM."""
import asyncio
import csv
import io
import logging
import re
from typing import AsyncIterator, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException

from core.db import db
from domain.base import utc_now_iso
from domain.enums import ANONYMOUS_LEAD_TYPES, LeadStatus, LeadType
from domain.models import Lead, LeadCreate, LeadListResponse, LeadUpdate
from services import crm, email_service, notification_service

logger = logging.getLogger(__name__)
COLLECTION = "leads"
MAX_PAGE_SIZE = 200
DEFAULT_PAGE_SIZE = 50

EXPORT_COLUMNS = [
    "created_at", "updated_at", "first_name", "last_name", "email", "phone",
    "lead_type", "status", "project", "source_unit", "source_building",
    "source_page", "source_url", "consent", "message", "notes",
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "crm_synced", "crm_reference",
]


def _safe_object_id(lead_id: str) -> Optional[ObjectId]:
    try:
        return ObjectId(lead_id)
    except InvalidId:
        return None


def _build_leads_query(
    lead_type: Optional[LeadType] = None,
    status: Optional[LeadStatus] = None,
    search: Optional[str] = None,
    created_from: Optional[str] = None,
    created_to: Optional[str] = None,
) -> dict:
    query: dict = {}
    if lead_type:
        query["lead_type"] = lead_type.value
    if status:
        query["status"] = status.value
    if search and search.strip():
        term = re.escape(search.strip())
        query["$or"] = [
            {"first_name": {"$regex": term, "$options": "i"}},
            {"last_name": {"$regex": term, "$options": "i"}},
            {"email": {"$regex": term, "$options": "i"}},
            {"phone": {"$regex": term, "$options": "i"}},
            {"message": {"$regex": term, "$options": "i"}},
        ]
    if created_from or created_to:
        created_at: dict = {}
        if created_from:
            created_at["$gte"] = created_from if "T" in created_from else f"{created_from}T00:00:00"
        if created_to:
            created_at["$lte"] = created_to if "T" in created_to else f"{created_to}T23:59:59"
        query["created_at"] = created_at
    return query


def schedule_post_lead_notifications(doc: dict, *, send_confirmation: bool) -> None:
    """Run staff + visitor emails in the background so lead APIs respond immediately."""

    async def _run() -> None:
        try:
            await notification_service.notify_lead_recipients(doc)
            if send_confirmation:
                await email_service.send_lead_notifications(doc)
        except Exception as exc:
            logger.warning(
                "Post-lead notifications failed for lead %s: %s",
                doc.get("_id"),
                exc,
            )

    asyncio.create_task(_run())


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

    schedule_post_lead_notifications(
        doc,
        send_confirmation=payload.lead_type not in ANONYMOUS_LEAD_TYPES,
    )

    return await get_lead(lead_id)


async def get_lead(lead_id: str) -> Optional[Lead]:
    oid = _safe_object_id(lead_id)
    if not oid:
        return None
    doc = await db[COLLECTION].find_one({"_id": oid})
    return Lead.from_mongo(doc)


async def list_leads(
    lead_type: Optional[LeadType] = None,
    status: Optional[LeadStatus] = None,
    search: Optional[str] = None,
    created_from: Optional[str] = None,
    created_to: Optional[str] = None,
    limit: int = DEFAULT_PAGE_SIZE,
    offset: int = 0,
) -> LeadListResponse:
    limit = max(1, min(limit, MAX_PAGE_SIZE))
    offset = max(0, offset)
    query = _build_leads_query(lead_type, status, search, created_from, created_to)
    total = await db[COLLECTION].count_documents(query)
    docs = await (
        db[COLLECTION]
        .find(query)
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
        .to_list(limit)
    )
    return LeadListResponse(
        items=[Lead.from_mongo(d) for d in docs],
        total=total,
        limit=limit,
        offset=offset,
    )


async def get_leads_total() -> int:
    return await db[COLLECTION].count_documents({})


async def get_leads_by_type() -> dict:
    pipeline = [{"$group": {"_id": "$lead_type", "count": {"$sum": 1}}}]
    result = await db[COLLECTION].aggregate(pipeline).to_list(None)
    return {row["_id"]: row["count"] for row in result if row.get("_id")}


async def get_recent_leads(limit: int = 8) -> List[Lead]:
    docs = await (
        db[COLLECTION]
        .find({})
        .sort("created_at", -1)
        .limit(limit)
        .to_list(limit)
    )
    return [Lead.from_mongo(d) for d in docs]


def _lead_export_row(lead: Lead) -> dict:
    data = lead.model_dump()
    data["lead_type"] = lead.lead_type.value
    data["status"] = lead.status.value
    return data


async def iter_leads_for_export(
    lead_type: Optional[LeadType] = None,
    status: Optional[LeadStatus] = None,
    search: Optional[str] = None,
    created_from: Optional[str] = None,
    created_to: Optional[str] = None,
) -> AsyncIterator[str]:
    query = _build_leads_query(lead_type, status, search, created_from, created_to)
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=EXPORT_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    yield buffer.getvalue()
    buffer.seek(0)
    buffer.truncate(0)

    cursor = db[COLLECTION].find(query).sort("created_at", -1)
    async for doc in cursor:
        lead = Lead.from_mongo(doc)
        row = _lead_export_row(lead)
        writer.writerow(row)
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)


async def update_lead(lead_id: str, payload: LeadUpdate) -> Optional[Lead]:
    oid = _safe_object_id(lead_id)
    if not oid:
        return None
    changes = payload.model_dump(exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No fields to update.")
    changes["updated_at"] = utc_now_iso()
    result = await db[COLLECTION].update_one({"_id": oid}, {"$set": changes})
    if result.matched_count == 0:
        return None
    return await get_lead(lead_id)

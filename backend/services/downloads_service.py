"""Downloads business logic — gated brochure vs open price list (single rule)."""
from typing import List, Optional

from bson import ObjectId
from fastapi import HTTPException

from core.db import db
from domain.enums import GATED_DOWNLOAD_TYPES, DownloadType, LeadType
from domain.models import Download, DownloadCreate, DownloadUpdate, LeadCreate
from services import leads_service

COLLECTION = "downloads"

# Which lead_type a gated download produces.
DOWNLOAD_LEAD_TYPE = {
    DownloadType.BROCHURE: LeadType.DOWNLOAD_BROCHURE,
    DownloadType.PRICELIST: LeadType.DOWNLOAD_PRICE_LIST,
}


async def list_downloads(dtype: Optional[DownloadType] = None) -> List[Download]:
    query = {"type": dtype.value} if dtype else {}
    docs = await db[COLLECTION].find(query).to_list(100)
    return [Download.from_mongo(d) for d in docs]


async def get_download(download_id: str) -> Optional[Download]:
    doc = await db[COLLECTION].find_one({"_id": ObjectId(download_id)})
    return Download.from_mongo(doc)


async def access_download(download_id: str, lead: Optional[LeadCreate]) -> dict:
    """Enforce the single gating rule and return the file url.

    Gated (brochure): a valid lead must be supplied -> captured -> file returned.
    Open (pricelist): file returned immediately; click recorded as a lead-less event.
    """
    download = await get_download(download_id)
    if not download:
        raise HTTPException(status_code=404, detail="Download not found")

    if download.type in GATED_DOWNLOAD_TYPES:
        if not lead or not lead.first_name or not lead.last_name or not lead.email:
            raise HTTPException(status_code=422, detail="Please provide your details to download.")
        if not lead.consent:
            raise HTTPException(status_code=422, detail="Please accept the data processing consent to continue.")
        lead.lead_type = DOWNLOAD_LEAD_TYPE[download.type]
        await leads_service.create_lead(lead)

    return {"file_url": download.file_url, "title": download.title}


async def create_download(payload: DownloadCreate) -> Download:
    res = await db[COLLECTION].insert_one(Download(**payload.model_dump()).to_mongo())
    return await get_download(str(res.inserted_id))


async def update_download(download_id: str, payload: DownloadUpdate) -> Optional[Download]:
    changes = payload.model_dump(exclude_none=True)
    await db[COLLECTION].update_one({"_id": ObjectId(download_id)}, {"$set": changes})
    return await get_download(download_id)


async def delete_download(download_id: str) -> bool:
    res = await db[COLLECTION].delete_one({"_id": ObjectId(download_id)})
    return res.deleted_count == 1

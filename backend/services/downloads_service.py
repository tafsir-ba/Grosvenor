"""Downloads business logic — gated brochure vs open price list (single rule)."""
import secrets
from datetime import timedelta
from pathlib import Path
from typing import List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException

from core.db import db
from domain.base import utc_now
from domain.enums import GATED_DOWNLOAD_TYPES, DownloadType, LeadType
from domain.models import Download, DownloadCreate, DownloadUpdate, LeadCreate
from services import leads_service

COLLECTION = "downloads"
TOKENS_COL = "download_tokens"
PROTECTED_DIR = Path(__file__).resolve().parent.parent / "protected_downloads"
TOKEN_TTL = timedelta(minutes=15)

# Which lead_type a gated download produces.
DOWNLOAD_LEAD_TYPE = {
    DownloadType.BROCHURE: LeadType.DOWNLOAD_BROCHURE,
    DownloadType.PRICELIST: LeadType.DOWNLOAD_PRICE_LIST,
}


def _safe_object_id(value: str) -> Optional[ObjectId]:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def to_public_download(download: Download) -> dict:
    """Public list is metadata only — never expose gated file locations."""
    data = download.model_dump(by_alias=True)
    if download.type in GATED_DOWNLOAD_TYPES:
        data.pop("file_url", None)
    return data


def protected_file_path(download: Download) -> Path:
    """Resolve a gated download to a file outside the web root."""
    name = Path(download.file_url or "").name
    if not name or name != Path(name).name:
        raise HTTPException(status_code=404, detail="Download file not found")
    path = (PROTECTED_DIR / name).resolve()
    if not str(path).startswith(str(PROTECTED_DIR.resolve())):
        raise HTTPException(status_code=404, detail="Download file not found")
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Download file not found")
    return path


async def list_downloads(dtype: Optional[DownloadType] = None) -> List[Download]:
    query = {"type": dtype.value} if dtype else {}
    docs = await db[COLLECTION].find(query).to_list(100)
    return [Download.from_mongo(d) for d in docs]


async def list_public_downloads(dtype: Optional[DownloadType] = None) -> List[dict]:
    return [to_public_download(d) for d in await list_downloads(dtype)]


async def get_download(download_id: str) -> Optional[Download]:
    oid = _safe_object_id(download_id)
    if not oid:
        return None
    doc = await db[COLLECTION].find_one({"_id": oid})
    return Download.from_mongo(doc)


async def _issue_gated_file_url(download: Download) -> str:
    """Create a short-lived token URL that streams the protected file."""
    # Confirm file exists before issuing a token.
    protected_file_path(download)
    token = secrets.token_urlsafe(32)
    await db[TOKENS_COL].insert_one({
        "token": token,
        "download_id": str(download.id),
        "expires_at": utc_now() + TOKEN_TTL,
        "used": False,
    })
    return f"/api/downloads/file/{token}"


async def access_download(download_id: str, lead: Optional[LeadCreate]) -> dict:
    """Enforce the single gating rule and return the file url.

    Gated (brochure): a valid lead must be supplied -> captured -> tokenized file URL.
    Open (pricelist): public file_url returned immediately; click recorded as a lead-less event.
    """
    download = await get_download(download_id)
    if not download:
        raise HTTPException(status_code=404, detail="Download not found")

    if download.type in GATED_DOWNLOAD_TYPES:
        if not lead or not (lead.first_name or "").strip() or not (lead.last_name or "").strip() or not lead.email:
            raise HTTPException(status_code=422, detail="Please provide your details to download.")
        if not lead.consent:
            raise HTTPException(status_code=422, detail="Please accept the data processing consent to continue.")
        lead.lead_type = DOWNLOAD_LEAD_TYPE[download.type]
        await leads_service.create_lead(lead)
        return {"file_url": await _issue_gated_file_url(download), "title": download.title}

    if download.type == DownloadType.PRICELIST:
        await leads_service.create_lead(LeadCreate(lead_type=LeadType.DOWNLOAD_PRICE_LIST))

    return {"file_url": download.file_url, "title": download.title}


async def resolve_download_token(token: str) -> tuple[Path, str]:
    """Validate a short-lived download token and return (path, filename)."""
    if not token:
        raise HTTPException(status_code=404, detail="Download not found")
    doc = await db[TOKENS_COL].find_one({"token": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Download not found")
    expires_at = doc.get("expires_at")
    if not expires_at or expires_at < utc_now():
        raise HTTPException(status_code=404, detail="Download link has expired")

    download = await get_download(str(doc.get("download_id")))
    if not download or download.type not in GATED_DOWNLOAD_TYPES:
        raise HTTPException(status_code=404, detail="Download not found")

    path = protected_file_path(download)
    return path, path.name


async def create_download(payload: DownloadCreate) -> Download:
    res = await db[COLLECTION].insert_one(Download(**payload.model_dump()).to_mongo())
    return await get_download(str(res.inserted_id))


async def update_download(download_id: str, payload: DownloadUpdate) -> Optional[Download]:
    oid = _safe_object_id(download_id)
    if not oid:
        return None
    changes = payload.model_dump(exclude_none=True)
    await db[COLLECTION].update_one({"_id": oid}, {"$set": changes})
    return await get_download(download_id)


async def delete_download(download_id: str) -> bool:
    oid = _safe_object_id(download_id)
    if not oid:
        return False
    res = await db[COLLECTION].delete_one({"_id": oid})
    return res.deleted_count == 1


async def ensure_brochure_protected_path():
    """Migrate legacy public brochure URLs to the protected filename SoT."""
    await db[COLLECTION].update_many(
        {"type": DownloadType.BROCHURE.value, "file_url": {"$regex": r"downloads/"}},
        {"$set": {"file_url": "grosvenor-vistas-brochure.pdf"}},
    )

"""Downloads business logic — website brochure (form-gated) vs email brochure (open)."""
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException

from core.db import db
from domain.base import utc_now
from domain.enums import GATED_DOWNLOAD_TYPES, PUBLIC_WEBSITE_DOWNLOAD_TYPES, DownloadType, LeadType
from domain.models import Download, DownloadCreate, DownloadUpdate, LeadCreate
from services import leads_service

COLLECTION = "downloads"
TOKENS_COL = "download_tokens"
PROTECTED_DIR = Path(__file__).resolve().parent.parent / "protected_downloads"
PROTECTED_BROCHURE_FILENAME = "grosvenor-vistas-brochure.pdf"
# Open CRM drip-email brochure. Existing campaign links keep this path.
PUBLIC_EMAIL_BROCHURE_URL = "/downloads/grosvenor-vistas-brochure.pdf"
PUBLIC_BROCHURE_URL = PUBLIC_EMAIL_BROCHURE_URL
# Known website-brochure locations that should be moved back to the protected file.
WEBSITE_BROCHURE_FILE_URLS = frozenset({
    PROTECTED_BROCHURE_FILENAME,
    PUBLIC_EMAIL_BROCHURE_URL,
    "/downloads/grosvenor-vistas-brochure.pdf",
})
TOKEN_TTL = timedelta(minutes=15)

# Which lead_type a download click / gated access produces.
DOWNLOAD_LEAD_TYPE = {
    DownloadType.BROCHURE: LeadType.DOWNLOAD_BROCHURE,
    DownloadType.PRICELIST: LeadType.DOWNLOAD_PRICE_LIST,
}

EMAIL_BROCHURE_SEED = {
    "title": "Grosvenor Vistas Brochure (Email)",
    "type": DownloadType.BROCHURE_EMAIL.value,
    "file_url": PUBLIC_EMAIL_BROCHURE_URL,
    "description": "Open public brochure for CRM drip emails. Not shown on the website.",
}


def _safe_object_id(value: str) -> Optional[ObjectId]:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def token_is_expired(expires_at, now: Optional[datetime] = None) -> bool:
    """True when token expiry is missing or in the past.

    Motor's default codec returns naive datetimes; utc_now() is timezone-aware.
    Normalize naive values as UTC before comparing.
    """
    if not expires_at:
        return True
    if getattr(expires_at, "tzinfo", None) is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at < (now or utc_now())


def to_public_download(download: Download) -> dict:
    """Public list includes open file URLs; gated website brochure locations stay hidden."""
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
    downloads = await list_downloads(dtype)
    return [
        to_public_download(d)
        for d in downloads
        if d.type in PUBLIC_WEBSITE_DOWNLOAD_TYPES
    ]


async def get_download(download_id: str) -> Optional[Download]:
    oid = _safe_object_id(download_id)
    if not oid:
        return None
    doc = await db[COLLECTION].find_one({"_id": oid})
    return Download.from_mongo(doc)


async def _issue_gated_file_url(download: Download) -> str:
    """Create a short-lived token URL that streams the protected file."""
    protected_file_path(download)
    token = secrets.token_urlsafe(32)
    await db[TOKENS_COL].insert_one({
        "token": token,
        "download_id": str(download.id),
        "expires_at": utc_now() + TOKEN_TTL,
        "used": False,
    })
    return f"/api/downloads/file/{token}"


def _require_download_lead(lead: Optional[LeadCreate]) -> LeadCreate:
    """Website brochure needs name, email, and consent."""
    if not lead or not (lead.first_name or "").strip() or not (lead.last_name or "").strip() or not lead.email:
        raise HTTPException(status_code=422, detail="Please provide your details to download.")
    if not lead.consent:
        raise HTTPException(status_code=422, detail="Please accept the data processing consent to continue.")
    return lead


async def access_download(download_id: str, lead: Optional[LeadCreate]) -> dict:
    """Enforce the gating rule (if any) and return the file url.

    Website brochure: a valid lead must be supplied -> captured -> tokenized file URL.
    Email brochure / pricelist: public file_url returned immediately.
    """
    download = await get_download(download_id)
    if not download:
        raise HTTPException(status_code=404, detail="Download not found")

    if download.type in GATED_DOWNLOAD_TYPES:
        lead = _require_download_lead(lead)
        lead.lead_type = DOWNLOAD_LEAD_TYPE[download.type]
        await leads_service.create_lead(lead)
        return {"file_url": await _issue_gated_file_url(download), "title": download.title}

    lead_type = DOWNLOAD_LEAD_TYPE.get(download.type)
    if lead_type:
        await leads_service.create_lead(LeadCreate(lead_type=lead_type))

    return {"file_url": download.file_url, "title": download.title}


async def resolve_download_token(token: str) -> tuple[Path, str]:
    """Validate a short-lived download token and return (path, filename)."""
    if not token:
        raise HTTPException(status_code=404, detail="Download not found")
    doc = await db[TOKENS_COL].find_one({"token": token})
    if not doc:
        raise HTTPException(status_code=404, detail="Download not found")
    if token_is_expired(doc.get("expires_at")):
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


def website_brochure_needs_protected_path(file_url: Optional[str]) -> bool:
    """True when the website brochure still points at the public drip URL or bare filename."""
    return (file_url or "") in WEBSITE_BROCHURE_FILE_URLS


async def ensure_brochure_buckets():
    """Keep two brochure records: gated website file + open email drip URL.

    Does not overwrite admin-customized website brochure paths that are not known defaults.
    """
    await db[COLLECTION].update_many(
        {
            "type": DownloadType.BROCHURE.value,
            "file_url": {"$in": list(WEBSITE_BROCHURE_FILE_URLS)},
        },
        {"$set": {"file_url": PROTECTED_BROCHURE_FILENAME}},
    )
    if await db[COLLECTION].count_documents({"type": DownloadType.BROCHURE_EMAIL.value}) == 0:
        await db[COLLECTION].insert_one(dict(EMAIL_BROCHURE_SEED))


# Back-compat aliases for older call sites / imports.
ensure_brochure_public_path = ensure_brochure_buckets
ensure_brochure_protected_path = ensure_brochure_buckets
brochure_url_needs_public_migration = website_brochure_needs_protected_path

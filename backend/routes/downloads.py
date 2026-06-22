"""Public download routes — list + gated access."""
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from domain.models import LeadCreate
from services import downloads_service

router = APIRouter(prefix="/downloads", tags=["downloads"])


class DownloadAccessRequest(BaseModel):
    lead: Optional[LeadCreate] = None


@router.get("")
async def list_downloads():
    return await downloads_service.list_downloads()


@router.post("/{download_id}/access")
async def access_download(download_id: str, payload: DownloadAccessRequest):
    return await downloads_service.access_download(download_id, payload.lead)

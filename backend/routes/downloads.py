"""Public download routes — list + gated access."""
from typing import Optional

from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel

from domain.models import LeadCreate
from services import downloads_service

router = APIRouter(prefix="/downloads", tags=["downloads"])


class DownloadAccessRequest(BaseModel):
    lead: Optional[LeadCreate] = None


@router.get("")
async def list_downloads():
    return await downloads_service.list_public_downloads()


@router.post("/{download_id}/access")
async def access_download(download_id: str, payload: DownloadAccessRequest):
    return await downloads_service.access_download(download_id, payload.lead)


@router.get("/file/{token}")
async def download_file(token: str):
    path, filename = await downloads_service.resolve_download_token(token)
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=filename,
        content_disposition_type="inline",
    )

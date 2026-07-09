"""Admin routes — protected by require_admin. Reuses the same services."""
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, EmailStr

from core.security import require_admin
from domain.enums import LeadStatus, LeadType, UnitStatus
from domain.models import (
    DownloadCreate,
    DownloadUpdate,
    LeadCreate,
    LeadListResponse,
    LeadUpdate,
    UnitCreate,
    UnitUpdate,
)
from services import downloads_service, leads_service, units_service
from services.crm import get_crm_status, sync_units_from_crm
from services.email_service import send_residence_to_buyer

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

FLOORPLANS_DIR = Path(__file__).resolve().parent.parent / "protected_floorplans"


class SendToBuyerPayload(BaseModel):
    email: EmailStr
    unit_slug: str
    message: Optional[str] = None
    cc_sales: bool = True
    residence_type: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None


# ------------------------ Protected floor plans ------------------------
@router.get("/floorplans/{unit_number}")
async def get_floorplan(unit_number: str):
    """Serve a unit's floor-plan PDF. Admin-only — never exposed publicly."""
    safe = re.sub(r"[^A-Za-z0-9 ]", "", unit_number).strip()
    path = FLOORPLANS_DIR / f"{safe}.pdf"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Floor plan not available")
    return FileResponse(path, media_type="application/pdf", filename=f"Residence-{safe}.pdf")


# ------------------------------ Stats ------------------------------
@router.get("/stats")
async def stats():
    units = await units_service.list_units()
    by_status = {s.value: 0 for s in UnitStatus}
    total_value = 0
    for u in units:
        by_status[u.status.value] = by_status.get(u.status.value, 0) + 1
        if u.status == UnitStatus.AVAILABLE and u.price:
            total_value += u.price
    leads_total = await leads_service.get_leads_total()
    leads_by_type = await leads_service.get_leads_by_type()
    recent_leads = await leads_service.get_recent_leads(8)
    return {
        "units_total": len(units),
        "units_by_status": by_status,
        "available_value_usd": total_value,
        "leads_total": leads_total,
        "leads_by_type": leads_by_type,
        "recent_leads": [lead.model_dump() for lead in recent_leads],
    }


# ------------------------------ Units ------------------------------
@router.get("/units")
async def admin_list_units():
    return await units_service.list_units()


@router.post("/units")
async def admin_create_unit(payload: UnitCreate):
    return await units_service.create_unit(payload)


@router.patch("/units/{unit_id}")
async def admin_update_unit(unit_id: str, payload: UnitUpdate):
    unit = await units_service.update_unit(unit_id, payload)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit


@router.delete("/units/{unit_id}")
async def admin_delete_unit(unit_id: str):
    if not await units_service.delete_unit(unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")
    return {"ok": True}


@router.post("/units/sync")
async def admin_sync_units(_: dict = Depends(require_admin)):
    return sync_units_from_crm()


@router.get("/crm/status")
async def admin_crm_status(_: dict = Depends(require_admin)):
    return get_crm_status()


@router.post("/residences/send-to-buyer")
async def send_to_buyer(payload: SendToBuyerPayload, _: dict = Depends(require_admin)):
    unit = await units_service.get_unit_by_slug(payload.unit_slug)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    sent = send_residence_to_buyer(
        to=payload.email.lower(),
        unit=unit.model_dump(),
        note=payload.message,
        cc_sales=payload.cc_sales,
        residence_type=payload.residence_type,
        bedrooms=payload.bedrooms,
        bathrooms=payload.bathrooms,
        floorplans_dir=FLOORPLANS_DIR,
    )
    if not sent:
        raise HTTPException(status_code=503, detail="Email could not be sent. Check email configuration.")
    return {"ok": True, "sent": True}


# ------------------------------ Leads ------------------------------
@router.post("/leads")
async def admin_create_lead(payload: LeadCreate):
    lead = await leads_service.create_lead(payload)
    return {"ok": True, "id": lead.id}


@router.get("/leads", response_model=LeadListResponse)
async def admin_list_leads(
    lead_type: Optional[LeadType] = None,
    status: Optional[LeadStatus] = None,
    search: Optional[str] = None,
    created_from: Optional[str] = None,
    created_to: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    return await leads_service.list_leads(
        lead_type=lead_type,
        status=status,
        search=search,
        created_from=created_from,
        created_to=created_to,
        limit=limit,
        offset=offset,
    )


@router.get("/leads/export")
async def admin_export_leads(
    lead_type: Optional[LeadType] = None,
    status: Optional[LeadStatus] = None,
    search: Optional[str] = None,
    created_from: Optional[str] = None,
    created_to: Optional[str] = None,
):
    return StreamingResponse(
        leads_service.iter_leads_for_export(
            lead_type=lead_type,
            status=status,
            search=search,
            created_from=created_from,
            created_to=created_to,
        ),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="grosvenor-leads.csv"'},
    )


@router.patch("/leads/{lead_id}")
async def admin_update_lead(lead_id: str, payload: LeadUpdate):
    lead = await leads_service.update_lead(lead_id, payload)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


# ---------------------------- Downloads ----------------------------
@router.get("/downloads")
async def admin_list_downloads():
    return await downloads_service.list_downloads()


@router.post("/downloads")
async def admin_create_download(payload: DownloadCreate):
    return await downloads_service.create_download(payload)


@router.patch("/downloads/{download_id}")
async def admin_update_download(download_id: str, payload: DownloadUpdate):
    d = await downloads_service.update_download(download_id, payload)
    if not d:
        raise HTTPException(status_code=404, detail="Download not found")
    return d


@router.delete("/downloads/{download_id}")
async def admin_delete_download(download_id: str):
    if not await downloads_service.delete_download(download_id):
        raise HTTPException(status_code=404, detail="Download not found")
    return {"ok": True}

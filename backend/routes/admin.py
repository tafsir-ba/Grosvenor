"""Admin routes — protected by require_admin. Reuses the same services."""
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from core.db import db
from core.security import require_admin
from domain.enums import LeadStatus, LeadType, UnitStatus
from domain.models import (
    DownloadCreate,
    DownloadUpdate,
    LeadCreate,
    LeadUpdate,
    UnitCreate,
    UnitUpdate,
)
from services import downloads_service, leads_service, units_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

FLOORPLANS_DIR = Path(__file__).resolve().parent.parent / "protected_floorplans"


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
    leads = await leads_service.list_leads()
    leads_by_type: dict = {}
    for lead in leads:
        leads_by_type[lead.lead_type.value] = leads_by_type.get(lead.lead_type.value, 0) + 1
    return {
        "units_total": len(units),
        "units_by_status": by_status,
        "available_value_usd": total_value,
        "leads_total": len(leads),
        "leads_by_type": leads_by_type,
        "recent_leads": [lead.model_dump() for lead in leads[:8]],
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


# ------------------------------ Leads ------------------------------
@router.post("/leads")
async def admin_create_lead(payload: LeadCreate):
    lead = await leads_service.create_lead(payload)
    return {"ok": True, "id": lead.id}


@router.get("/leads")
async def admin_list_leads(lead_type: Optional[LeadType] = None,
                           status: Optional[LeadStatus] = None):
    return await leads_service.list_leads(lead_type, status)


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

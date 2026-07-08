"""Public unit routes."""
from typing import Optional

from fastapi import APIRouter, HTTPException

from domain.enums import UnitStatus
from services import units_service

router = APIRouter(prefix="/units", tags=["units"])


@router.get("")
async def list_units(
    building: Optional[str] = None,
    status: Optional[UnitStatus] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = "building",
):
    units = await units_service.list_units(building, status, min_price, max_price, sort)
    return [units_service.to_public_unit(u) for u in units]


@router.get("/{slug}")
async def get_unit(slug: str):
    unit = await units_service.get_unit_by_slug(slug)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return units_service.to_public_unit(unit)

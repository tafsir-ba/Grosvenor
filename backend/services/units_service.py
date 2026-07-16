"""Units business logic. The website reads units only through this service."""
import re
from typing import List, Optional

from bson import ObjectId

from core.db import db
from domain.base import utc_now_iso
from domain.enums import UnitStatus
from domain.models import Unit, UnitCreate, UnitUpdate

COLLECTION = "units"

# Block inventory-style bed/bath counts and floor-plan references.
# Finish copy may mention bedrooms/bathrooms (e.g. "Built-in wardrobes in all bedrooms").
_FORBIDDEN_AMENITY_RE = re.compile(
    r"\b\d+\s*-?\s*bed(?:room)?s?\b|\b\d+\s*-?\s*bath(?:room)?s?\b|floor\s*plan|ensuite|principal\s*suite|guest\s*wc",
    re.IGNORECASE,
)


def make_slug(unit_number: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", unit_number.lower()).strip("-")


def sanitize_public_amenities(amenities: Optional[List[str]]) -> List[str]:
    if not amenities:
        return []
    return [a for a in amenities if a and not _FORBIDDEN_AMENITY_RE.search(a)]


def to_public_unit(unit: Unit) -> Unit:
    data = unit.model_dump()
    data["amenities"] = sanitize_public_amenities(data.get("amenities"))
    return Unit(**data)


async def list_units(
    building: Optional[str] = None,
    status: Optional[UnitStatus] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = "building",
) -> List[Unit]:
    query: dict = {}
    if building:
        query["building"] = building
    if status:
        query["status"] = status.value
    if min_price is not None or max_price is not None:
        price_q: dict = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        query["price"] = price_q

    sort_map = {
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "surface_desc": [("total_surface", -1)],
        "building": [("building", 1), ("unit_number", 1)],
    }
    cursor = db[COLLECTION].find(query).sort(sort_map.get(sort, sort_map["building"]))
    docs = await cursor.to_list(1000)
    return [Unit.from_mongo(d) for d in docs]


async def get_unit_by_slug(slug: str) -> Optional[Unit]:
    doc = await db[COLLECTION].find_one({"slug": slug})
    return Unit.from_mongo(doc)


async def get_unit(unit_id: str) -> Optional[Unit]:
    doc = await db[COLLECTION].find_one({"_id": ObjectId(unit_id)})
    return Unit.from_mongo(doc)


async def create_unit(payload: UnitCreate) -> Unit:
    unit = Unit(**payload.model_dump(), slug=make_slug(payload.unit_number))
    doc = unit.to_mongo()
    res = await db[COLLECTION].insert_one(doc)
    return await get_unit(str(res.inserted_id))


async def update_unit(unit_id: str, payload: UnitUpdate) -> Optional[Unit]:
    changes = payload.model_dump(exclude_none=True)
    if "unit_number" in changes:
        changes["slug"] = make_slug(changes["unit_number"])
    changes["updated_at"] = utc_now_iso()
    await db[COLLECTION].update_one({"_id": ObjectId(unit_id)}, {"$set": changes})
    return await get_unit(unit_id)


async def delete_unit(unit_id: str) -> bool:
    res = await db[COLLECTION].delete_one({"_id": ObjectId(unit_id)})
    return res.deleted_count == 1


async def upsert_from_crm(unit_fields: dict) -> None:
    """Used by the future CRM sync; keyed by crm_id."""
    crm_id = unit_fields.get("crm_id")
    unit_fields["slug"] = make_slug(unit_fields["unit_number"])
    unit_fields["updated_at"] = utc_now_iso()
    await db[COLLECTION].update_one(
        {"crm_id": crm_id}, {"$set": unit_fields, "$setOnInsert": {"created_at": utc_now_iso()}},
        upsert=True,
    )

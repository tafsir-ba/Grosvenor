"""Idempotent seed data: the real 43-unit inventory + default downloads.

Inventory is loaded from `units.csv` (the single source of truth for unit data
until the live CRM is wired). Edit that CSV and re-seed to update inventory.
"""
import csv
import re
from pathlib import Path

from core.db import db
from services.units_service import make_slug

CSV_PATH = Path(__file__).parent / "units.csv"

# Default residence features (applied on insert + one-time migration; editable per unit in admin).
_DEFAULT_AMENITIES = [
    "Large floor-to-ceiling windows",
    "Porcelain tiled flooring throughout",
    "Solid surface kitchen countertops",
    "Contemporary kitchen cabinetry",
    "Built-in wardrobes in all bedrooms",
    "Recessed LED lighting",
    "Dedicated laundry room",
    "Master bathroom with bathtub and separate walk-in shower",
    "Secondary bathrooms with walk-in showers",
    "Premium bathroom fixtures and fittings",
]

# Bump only when intentionally re-applying the canonical amenities list to all units.
_AMENITIES_VERSION = "2026-07-16"
_META_ID = "seed"

# Friendly block name (CSV) -> canonical building value used across the app.
_BLOCK_TO_BUILDING = {
    "Heliconia": "Block A — Heliconia",
    "Hibiscus": "Block B — Hibiscus",
    "Ginger Lily": "Block C — Ginger Lily",
    "Begonia": "Townhouses — Begonia",
}


def _first_floor(label: str) -> int:
    m = re.search(r"\d+", label or "")
    return int(m.group()) if m else 1


def load_units_from_csv():
    docs = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            price = row["price_usd"].strip()
            floor_label = row["floor_label"].strip()
            docs.append({
                "building": _BLOCK_TO_BUILDING.get(row["block"].strip(), row["block"].strip()),
                "unit_number": row["unit_number"].strip(),
                "floor": _first_floor(floor_label),
                "floor_label": floor_label or None,
                "total_surface": float(row["total_sqft"]),
                "balcony_surface": float(row["balcony_sqft"]),
                "living_area": float(row["living_sqft"]),
                "price": float(price) if price else None,
                "currency": "USD",
                "status": row["status"].strip().lower(),
                "amenities": list(_DEFAULT_AMENITIES),
                "crm_id": None,
                "slug": make_slug(row["unit_number"].strip()),
            })
    return docs


_DOWNLOADS = [
    {"title": "Grosvenor Vistas Brochure", "type": "brochure",
     "file_url": "grosvenor-vistas-brochure.pdf",
     "description": "The complete development brochure."},
    {"title": "Current Price List", "type": "pricelist",
     "file_url": "/downloads/grosvenor-vistas-pricelist.pdf",
     "description": "Up-to-date availability and pricing."},
]


def should_apply_amenities_migration(meta_doc) -> bool:
    """True only when the one-time amenities migration has not yet been recorded."""
    if not meta_doc:
        return True
    return meta_doc.get("amenities_version") != _AMENITIES_VERSION


async def apply_amenities_migration_once():
    """Apply canonical amenities once, then leave per-unit admin edits alone."""
    meta = await db.meta.find_one({"_id": _META_ID})
    if not should_apply_amenities_migration(meta):
        return False
    await db.units.update_many({}, {"$set": {"amenities": list(_DEFAULT_AMENITIES)}})
    await db.meta.update_one(
        {"_id": _META_ID},
        {"$set": {"amenities_version": _AMENITIES_VERSION}},
        upsert=True,
    )
    return True


async def seed_inventory():
    if await db.units.count_documents({}) == 0:
        from domain.base import utc_now_iso
        now = utc_now_iso()
        docs = [{**d, "created_at": now, "updated_at": now} for d in load_units_from_csv()]
        await db.units.insert_many(docs)
        await db.meta.update_one(
            {"_id": _META_ID},
            {"$set": {"amenities_version": _AMENITIES_VERSION}},
            upsert=True,
        )
    else:
        await apply_amenities_migration_once()

    if await db.downloads.count_documents({}) == 0:
        await db.downloads.insert_many([dict(d) for d in _DOWNLOADS])
    else:
        from services.downloads_service import ensure_brochure_protected_path
        await ensure_brochure_protected_path()

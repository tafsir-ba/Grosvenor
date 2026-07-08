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

# Default residence features (editable per unit in the admin panel).
# Public copy must not reference bedrooms, bathrooms, floor plans, or room types.
_DEFAULT_AMENITIES = [
    "Open-plan living spaces",
    "Floor-to-ceiling windows",
    "SPC Laminate flooring",
    "Solid surface countertops",
    "Recessed lighting",
    "Contemporary kitchen cabinetry and fixtures",
    "Provisioning for telephone and cable",
    "Air-conditioning throughout",
    "Utility closet",
]

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
     "file_url": "/downloads/grosvenor-vistas-brochure.pdf",
     "description": "The complete development brochure."},
    {"title": "Current Price List", "type": "pricelist",
     "file_url": "/downloads/grosvenor-vistas-pricelist.pdf",
     "description": "Up-to-date availability and pricing."},
]


async def seed_inventory():
    if await db.units.count_documents({}) == 0:
        from domain.base import utc_now_iso
        now = utc_now_iso()
        docs = [{**d, "created_at": now, "updated_at": now} for d in load_units_from_csv()]
        await db.units.insert_many(docs)

    if await db.downloads.count_documents({}) == 0:
        await db.downloads.insert_many([dict(d) for d in _DOWNLOADS])

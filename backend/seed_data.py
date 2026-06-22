"""Idempotent seed data: the real 43-unit inventory + default downloads.

This represents the structured synced source until the live CRM is wired.
"""
from core.db import db
from services.units_service import make_slug

# (building, unit_number, floor, total_surface, balcony_surface, price, status)
_UNITS = [
    # Block A — Heliconia
    ("Block A — Heliconia", "A101", 1, 1671, 139, 427000, "available"),
    ("Block A — Heliconia", "A102", 1, 1671, 139, 418000, "available"),
    ("Block A — Heliconia", "A103", 1, 1671, 139, 423000, "available"),
    ("Block A — Heliconia", "A104", 1, 1671, 139, 425000, "available"),
    ("Block A — Heliconia", "A201", 2, 1671, 139, 428000, "available"),
    ("Block A — Heliconia", "A202", 2, 1671, 139, 426000, "available"),
    ("Block A — Heliconia", "A203", 2, 1671, 139, 431000, "available"),
    ("Block A — Heliconia", "A204", 2, 1671, 139, 431000, "available"),
    ("Block A — Heliconia", "A301", 3, 1671, 139, 433000, "available"),
    ("Block A — Heliconia", "A302", 3, 1671, 139, 431000, "available"),
    ("Block A — Heliconia", "A303", 3, 1671, 139, None, "sold"),
    ("Block A — Heliconia", "A304", 3, 1671, 139, 437000, "available"),
    ("Block A — Heliconia", "A401", 4, 1671, 139, 443000, "available"),
    ("Block A — Heliconia", "A402", 5, 3135, 467, 890000, "available"),
    ("Block A — Heliconia", "A403", 4, 1671, 139, None, "sold"),
    ("Block A — Heliconia", "A404", 5, 3135, 467, 890000, "sold"),
    # Block B — Hibiscus
    ("Block B — Hibiscus", "B101", 1, 1671, 139, 423000, "available"),
    ("Block B — Hibiscus", "B102", 1, 1671, 139, 423000, "available"),
    ("Block B — Hibiscus", "B103", 1, 1779, 139, 452000, "available"),
    ("Block B — Hibiscus", "B104", 1, 1779, 139, 452000, "available"),
    ("Block B — Hibiscus", "B201", 2, 1671, 139, 426000, "available"),
    ("Block B — Hibiscus", "B202", 2, 1671, 139, 426000, "available"),
    ("Block B — Hibiscus", "B203", 2, 1779, 139, 458000, "available"),
    ("Block B — Hibiscus", "B204", 2, 1779, 139, 455000, "available"),
    ("Block B — Hibiscus", "B301", 3, 1671, 139, 429000, "available"),
    ("Block B — Hibiscus", "B302", 3, 1671, 139, 429000, "available"),
    ("Block B — Hibiscus", "B303", 3, 1779, 139, None, "available"),
    ("Block B — Hibiscus", "B304", 3, 1779, 139, 468000, "sold"),
    ("Block B — Hibiscus", "B401", 4, 1671, 139, 440000, "available"),
    ("Block B — Hibiscus", "B402", 4, 1671, 139, None, "sold"),
    ("Block B — Hibiscus", "B403", 5, 3644, 883, None, "sold"),
    ("Block B — Hibiscus", "B404", 5, 3644, 883, None, "sold"),
    # Block C — Ginger Lily
    ("Block C — Ginger Lily", "C101", 1, 2322, 409, 599000, "sold"),
    ("Block C — Ginger Lily", "C102", 1, 1671, 139, 430000, "available"),
    ("Block C — Ginger Lily", "C103", 1, 1671, 139, 430000, "available"),
    ("Block C — Ginger Lily", "C201", 2, 2141, 228, None, "sold"),
    ("Block C — Ginger Lily", "C202", 2, 1671, 139, None, "sold"),
    ("Block C — Ginger Lily", "C203", 2, 1671, 139, 437000, "sold"),
    ("Block C — Ginger Lily", "C301", 3, 2141, 228, None, "sold"),
    ("Block C — Ginger Lily", "C302", 4, 3135, 467, 890000, "sold"),
    ("Block C — Ginger Lily", "C303", 4, 3135, 467, 890000, "available"),
    # Townhouses — Begonia
    ("Townhouses — Begonia", "Townhouse 1", 1, 4845, 1682, 1145000, "available"),
    ("Townhouses — Begonia", "Townhouse 2", 1, 4845, 1682, 1145000, "available"),
]

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
        docs = []
        for (building, num, floor, surf, balc, price, status) in _UNITS:
            docs.append({
                "building": building, "unit_number": num, "floor": floor,
                "total_surface": float(surf), "balcony_surface": float(balc),
                "price": float(price) if price is not None else None,
                "currency": "USD", "status": status, "crm_id": None,
                "slug": make_slug(num), "created_at": now, "updated_at": now,
            })
        await db.units.insert_many(docs)

    if await db.downloads.count_documents({}) == 0:
        await db.downloads.insert_many([dict(d) for d in _DOWNLOADS])

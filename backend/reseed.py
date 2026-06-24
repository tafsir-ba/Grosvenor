"""One-off: replace the units collection from units.csv. Run: python reseed.py"""
import asyncio

from core.db import db
from domain.base import utc_now_iso
from seed_data import load_units_from_csv


async def main():
    now = utc_now_iso()
    docs = [{**d, "created_at": now, "updated_at": now} for d in load_units_from_csv()]
    await db.units.delete_many({})
    await db.units.insert_many(docs)
    print(f"Reseeded {len(docs)} units from units.csv")


if __name__ == "__main__":
    asyncio.run(main())

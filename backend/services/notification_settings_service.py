"""Notification settings CRUD — recipients and scenario configuration."""
from typing import List, Optional

from bson import ObjectId
from fastapi import HTTPException

from core.config import settings
from core.db import db
from domain.base import utc_now_iso
from domain.models import (
    NotificationRecipient,
    NotificationRecipientCreate,
    NotificationRecipientUpdate,
    NotificationScenario,
    NotificationScenarioUpdate,
)
from domain.notification_scenarios import DEFAULT_SCENARIOS

RECIPIENTS_COL = "notification_recipients"
SCENARIOS_COL = "notification_scenarios"


async def seed_notification_settings() -> None:
    now = utc_now_iso()
    for scenario in DEFAULT_SCENARIOS:
        existing = await db[SCENARIOS_COL].find_one({"key": scenario["key"]})
        if existing is None:
            await db[SCENARIOS_COL].insert_one({
                **scenario,
                "enabled": True,
                "fallback_email": settings.NOTIFY_EMAIL,
                "created_at": now,
                "updated_at": now,
            })

    if await db[RECIPIENTS_COL].count_documents({}) == 0 and settings.NOTIFY_EMAIL:
        await db[RECIPIENTS_COL].insert_one({
            "name": settings.ADMIN_NAME or "Admin",
            "email": settings.NOTIFY_EMAIL,
            "label": "Admin",
            "active": True,
            "scenarios": [s["key"] for s in DEFAULT_SCENARIOS],
            "created_at": now,
            "updated_at": now,
        })


async def list_recipients() -> List[NotificationRecipient]:
    docs = await db[RECIPIENTS_COL].find().sort("name", 1).to_list(500)
    return [NotificationRecipient.from_mongo(d) for d in docs]


async def get_recipient(recipient_id: str) -> Optional[NotificationRecipient]:
    doc = await db[RECIPIENTS_COL].find_one({"_id": ObjectId(recipient_id)})
    return NotificationRecipient.from_mongo(doc)


async def create_recipient(payload: NotificationRecipientCreate) -> NotificationRecipient:
    await _validate_scenario_keys(payload.scenarios)
    now = utc_now_iso()
    doc = {**payload.model_dump(), "created_at": now, "updated_at": now}
    res = await db[RECIPIENTS_COL].insert_one(doc)
    return await get_recipient(str(res.inserted_id))


async def update_recipient(
    recipient_id: str,
    payload: NotificationRecipientUpdate,
) -> Optional[NotificationRecipient]:
    changes = payload.model_dump(exclude_none=True)
    if "scenarios" in changes:
        await _validate_scenario_keys(changes["scenarios"])
    if not changes:
        return await get_recipient(recipient_id)
    changes["updated_at"] = utc_now_iso()
    result = await db[RECIPIENTS_COL].update_one(
        {"_id": ObjectId(recipient_id)},
        {"$set": changes},
    )
    if result.matched_count == 0:
        return None
    return await get_recipient(recipient_id)


async def delete_recipient(recipient_id: str) -> bool:
    res = await db[RECIPIENTS_COL].delete_one({"_id": ObjectId(recipient_id)})
    return res.deleted_count == 1


async def list_scenarios() -> List[NotificationScenario]:
    docs = await db[SCENARIOS_COL].find().sort("key", 1).to_list(50)
    return [NotificationScenario.from_mongo(d) for d in docs]


async def get_scenario(key: str) -> Optional[NotificationScenario]:
    doc = await db[SCENARIOS_COL].find_one({"key": key})
    return NotificationScenario.from_mongo(doc)


async def update_scenario(
    key: str,
    payload: NotificationScenarioUpdate,
) -> Optional[NotificationScenario]:
    changes = payload.model_dump(exclude_none=True)
    if not changes:
        return await get_scenario(key)
    changes["updated_at"] = utc_now_iso()
    result = await db[SCENARIOS_COL].update_one({"key": key}, {"$set": changes})
    if result.matched_count == 0:
        return None
    return await get_scenario(key)


async def get_settings() -> dict:
    recipients = await list_recipients()
    scenarios = await list_scenarios()
    scenario_keys = {s.key for s in scenarios}
    enriched = []
    for scenario in scenarios:
        assigned = [
            r for r in recipients
            if r.active and scenario.key in (r.scenarios or [])
        ]
        enriched.append({
            **scenario.model_dump(),
            "assigned_recipients": [
                {"id": r.id, "name": r.name, "email": r.email, "label": r.label}
                for r in assigned
            ],
        })
    return {
        "recipients": [r.model_dump() for r in recipients],
        "scenarios": enriched,
        "available_scenarios": sorted(scenario_keys),
        "fallback_admin_email": settings.NOTIFY_EMAIL,
    }


async def _validate_scenario_keys(keys: List[str]) -> None:
    if not keys:
        return
    known = {s.key for s in await list_scenarios()}
    unknown = [k for k in keys if k not in known]
    if unknown:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown notification scenario(s): {', '.join(unknown)}",
        )

"""Admin notification settings API."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from core.security import require_admin
from domain.models import (
    NotificationRecipient,
    NotificationRecipientCreate,
    NotificationRecipientUpdate,
    NotificationScenario,
    NotificationScenarioUpdate,
)
from services.notification_settings_service import (
    create_recipient,
    delete_recipient,
    get_settings,
    update_recipient,
    update_scenario,
)

router = APIRouter(
    prefix="/admin/notifications",
    tags=["admin-notifications"],
    dependencies=[Depends(require_admin)],
)


@router.get("/settings")
async def read_notification_settings():
    return await get_settings()


@router.post("/recipients", response_model=NotificationRecipient)
async def post_recipient(body: NotificationRecipientCreate):
    return await create_recipient(body)


@router.put("/recipients/{recipient_id}", response_model=NotificationRecipient)
async def put_recipient(recipient_id: str, body: NotificationRecipientUpdate):
    result = await update_recipient(recipient_id, body)
    if result is None:
        raise HTTPException(status_code=404, detail="Recipient not found")
    return result


@router.delete("/recipients/{recipient_id}")
async def remove_recipient(recipient_id: str):
    deleted = await delete_recipient(recipient_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Recipient not found")
    return {"ok": True}


@router.patch("/scenarios/{scenario_key}", response_model=NotificationScenario)
async def patch_scenario(scenario_key: str, body: NotificationScenarioUpdate):
    result = await update_scenario(scenario_key, body)
    if result is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return result

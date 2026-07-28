"""Unit tests for background CRM scheduling on lead create."""
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from domain.enums import LeadType
from domain.models import LeadCreate
from services import leads_service


def _mock_leads_collection(inserted_id: str):
    collection = MagicMock()
    collection.insert_one = AsyncMock(
        return_value=MagicMock(inserted_id=inserted_id)
    )
    collection.update_one = AsyncMock()
    return collection


def test_create_lead_schedules_crm_push_without_inline_call():
    async def exercise():
        payload = LeadCreate(
            first_name="Jane",
            last_name="Doe",
            email="jane@example.com",
            consent=True,
            lead_type=LeadType.GENERAL_CONTACT,
        )
        collection = _mock_leads_collection("507f1f77bcf86cd799439011")

        with patch.object(
            leads_service, "db", {"leads": collection}
        ), patch.object(
            leads_service,
            "get_lead",
            new=AsyncMock(return_value=MagicMock(id="507f1f77bcf86cd799439011")),
        ), patch.object(
            leads_service, "schedule_post_lead_notifications"
        ) as schedule_email, patch.object(
            leads_service, "schedule_crm_push"
        ) as schedule_crm, patch.object(
            leads_service.crm, "push_lead"
        ) as push_lead:
            await leads_service.create_lead(payload)

        schedule_crm.assert_called_once()
        assert schedule_crm.call_args.args[0] == "507f1f77bcf86cd799439011"
        assert schedule_crm.call_args.args[1]["_id"] == "507f1f77bcf86cd799439011"
        push_lead.assert_not_called()
        schedule_email.assert_called_once()
        collection.insert_one.assert_awaited_once()

    asyncio.run(exercise())


def test_create_lead_skips_crm_for_anonymous_clicks():
    async def exercise():
        payload = LeadCreate(lead_type=LeadType.WHATSAPP_CLICK)
        collection = _mock_leads_collection("507f1f77bcf86cd799439099")

        with patch.object(
            leads_service, "db", {"leads": collection}
        ), patch.object(
            leads_service,
            "get_lead",
            new=AsyncMock(return_value=MagicMock(id="507f1f77bcf86cd799439099")),
        ), patch.object(
            leads_service, "schedule_post_lead_notifications"
        ), patch.object(
            leads_service, "schedule_crm_push"
        ) as schedule_crm:
            await leads_service.create_lead(payload)

        schedule_crm.assert_not_called()

    asyncio.run(exercise())


def test_schedule_crm_push_updates_lead_on_success():
    async def exercise():
        doc = {"_id": "507f1f77bcf86cd799439011", "first_name": "Jane"}
        oid = MagicMock()
        collection = MagicMock()
        collection.update_one = AsyncMock()
        scheduled = []

        def _capture(coro):
            scheduled.append(coro)
            return MagicMock()

        async def _to_thread(fn, *args):
            return fn(*args)

        with patch.object(leads_service, "_safe_object_id", return_value=oid), patch.object(
            leads_service, "db", {"leads": collection}
        ), patch.object(
            leads_service.crm, "push_lead", return_value="crm-ref-1"
        ), patch.object(
            leads_service.asyncio, "create_task", side_effect=_capture
        ), patch.object(
            leads_service.asyncio, "to_thread", side_effect=_to_thread
        ):
            leads_service.schedule_crm_push("507f1f77bcf86cd799439011", doc)
            assert len(scheduled) == 1
            await scheduled[0]

        collection.update_one.assert_awaited_once_with(
            {"_id": oid},
            {"$set": {"crm_synced": True, "crm_reference": "crm-ref-1"}},
        )

    asyncio.run(exercise())

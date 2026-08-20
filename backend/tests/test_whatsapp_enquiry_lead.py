"""Unit tests for soft-gated WhatsApp enquiry leads."""
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

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


def test_whatsapp_enquiry_accepts_first_name_and_email_only():
    async def exercise():
        payload = LeadCreate(
            first_name="Ada",
            email="ada@example.com",
            consent=True,
            lead_type=LeadType.WHATSAPP_ENQUIRY,
        )
        collection = _mock_leads_collection("507f1f77bcf86cd7994390aa")

        with patch.object(
            leads_service, "db", {"leads": collection}
        ), patch.object(
            leads_service,
            "get_lead",
            new=AsyncMock(return_value=MagicMock(id="507f1f77bcf86cd7994390aa")),
        ), patch.object(
            leads_service, "schedule_post_lead_notifications"
        ), patch.object(
            leads_service, "schedule_crm_push"
        ) as schedule_crm:
            lead = await leads_service.create_lead(payload)

        schedule_crm.assert_called_once()
        inserted = collection.insert_one.await_args.args[0]
        assert inserted["lead_type"] == "whatsapp_enquiry"
        assert inserted["first_name"] == "Ada"
        assert inserted.get("last_name") in (None, "")
        assert lead is not None

    asyncio.run(exercise())


def test_whatsapp_enquiry_requires_consent():
    async def exercise():
        payload = LeadCreate(
            first_name="Ada",
            email="ada@example.com",
            consent=False,
            lead_type=LeadType.WHATSAPP_ENQUIRY,
        )
        with patch.object(leads_service, "db", {"leads": MagicMock()}), patch.object(
            leads_service, "schedule_post_lead_notifications"
        ), patch.object(leads_service, "schedule_crm_push"):
            with pytest.raises(HTTPException) as exc:
                await leads_service.create_lead(payload)
        assert exc.value.status_code == 422

    asyncio.run(exercise())

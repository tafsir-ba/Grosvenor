"""Tests for non-blocking post-lead notification dispatch."""
import asyncio
import time
from unittest.mock import AsyncMock, patch

from services.leads_service import schedule_post_lead_notifications


def test_schedule_post_lead_notifications_returns_immediately():
    async def exercise():
        started = asyncio.Event()
        released = asyncio.Event()

        async def slow_notify(_doc):
            started.set()
            await asyncio.sleep(0.15)
            released.set()

        with patch(
            "services.leads_service.notification_service.notify_lead_recipients",
            new=AsyncMock(side_effect=slow_notify),
        ), patch(
            "services.leads_service.email_service.send_lead_notifications",
            new=AsyncMock(),
        ):
            before = time.monotonic()
            schedule_post_lead_notifications({"_id": "lead1"}, send_confirmation=False)
            elapsed = time.monotonic() - before
            assert elapsed < 0.05
            await asyncio.wait_for(started.wait(), timeout=1.0)
            await asyncio.wait_for(released.wait(), timeout=1.0)

    asyncio.run(exercise())


def test_schedule_post_lead_notifications_sends_visitor_confirmation_when_requested():
    async def exercise():
        confirm = AsyncMock()
        notify = AsyncMock()

        with patch(
            "services.leads_service.notification_service.notify_lead_recipients",
            new=notify,
        ), patch(
            "services.leads_service.email_service.send_lead_notifications",
            new=confirm,
        ):
            schedule_post_lead_notifications({"_id": "lead2"}, send_confirmation=True)

            for _ in range(20):
                if notify.called and confirm.called:
                    return
                await asyncio.sleep(0.05)
            raise AssertionError("Expected staff and visitor notifications to run")

    asyncio.run(exercise())

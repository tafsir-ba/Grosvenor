"""Validation tests for notification settings models."""
import pytest
from pydantic import ValidationError

from domain.models import NotificationRecipientCreate, NotificationRecipientUpdate


def test_recipient_create_requires_scenarios():
    with pytest.raises(ValidationError):
        NotificationRecipientCreate(
            name="Admin",
            email="admin@example.com",
            scenarios=[],
        )


def test_recipient_create_requires_name():
    with pytest.raises(ValidationError):
        NotificationRecipientCreate(
            name="   ",
            email="admin@example.com",
            scenarios=["contact_form"],
        )


def test_recipient_update_rejects_empty_scenarios():
    with pytest.raises(ValidationError):
        NotificationRecipientUpdate(scenarios=[])


def test_recipient_update_allows_omitted_scenarios():
    payload = NotificationRecipientUpdate(active=False)
    assert payload.scenarios is None

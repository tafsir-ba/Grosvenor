"""Unit tests for lead normalization (no live API required)."""
from domain.enums import LeadType
from domain.models import LeadCreate
from services.leads_service import normalize_lead_create


def test_normalize_lead_create_strips_whitespace_names():
    payload = LeadCreate(
        first_name="  Jane  ",
        last_name="\tDoe\n",
        email=" jane@example.com ",
        phone="  +1 876  ",
        message="  hello  ",
        consent=True,
        lead_type=LeadType.GENERAL_CONTACT,
    )
    normalized = normalize_lead_create(payload)
    assert normalized.first_name == "Jane"
    assert normalized.last_name == "Doe"
    assert normalized.email == "jane@example.com"
    assert normalized.phone == "+1 876"
    assert normalized.message == "hello"


def test_normalize_lead_create_blank_names_become_none():
    payload = LeadCreate(
        first_name="   ",
        last_name="\t",
        email="ok@example.com",
        consent=True,
        lead_type=LeadType.GENERAL_CONTACT,
    )
    normalized = normalize_lead_create(payload)
    assert normalized.first_name is None
    assert normalized.last_name is None
    assert normalized.email == "ok@example.com"

"""Unit tests for EvoHome CRM lead payload mapping and push helpers."""
from unittest.mock import MagicMock, patch

from services import crm


SAMPLE_LEAD = {
    "_id": "507f1f77bcf86cd799439011",
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+18765550123",
    "message": "I'd like a showroom visit",
    "consent": True,
    "project": "Grosvenor Vistas",
    "lead_type": "book_showroom_visit",
    "source_unit": "A101",
    "source_building": "Heliconia",
    "collection": "Vista",
    "unit_surface": 1200,
    "unit_balcony": 80,
    "unit_floor": "1",
    "source_page": "/contact",
    "source_url": "https://grosvenorvistas.com/contact",
    "utm_source": "google",
    "utm_medium": "cpc",
}


def test_build_lead_payload_uses_evohome_flat_camel_case():
    payload = crm.build_lead_payload(SAMPLE_LEAD)

    assert payload["firstName"] == "Jane"
    assert payload["lastName"] == "Doe"
    assert payload["email"] == "jane@example.com"
    assert payload["phone"] == "+18765550123"
    assert payload["source"] == "grosvenorvistas.com"
    assert payload["externalId"] == SAMPLE_LEAD["_id"]
    assert payload["idempotencyKey"] == SAMPLE_LEAD["_id"]

    # Strict schema — must not send nested contact or locked project overrides.
    assert "contact" not in payload
    assert "projectId" not in payload
    assert "projectReference" not in payload
    assert "first_name" not in payload
    assert "utm_source" not in payload


def test_build_lead_payload_folds_context_into_message():
    payload = crm.build_lead_payload(SAMPLE_LEAD)
    message = payload["message"]

    assert "I'd like a showroom visit" in message
    assert "Inquiry type: book_showroom_visit" in message
    assert "Residence: A101" in message
    assert "Building: Heliconia" in message
    assert "Page: /contact" in message
    assert "utm_source=google" in message
    assert "Consent: accepted" in message


def test_build_lead_payload_omits_empty_optional_contact_fields():
    payload = crm.build_lead_payload(
        {
            "first_name": "Only",
            "last_name": "Email",
            "email": "only@example.com",
        }
    )
    assert payload["email"] == "only@example.com"
    assert "phone" not in payload
    assert "externalId" not in payload
    assert "idempotencyKey" not in payload


def test_extract_crm_reference_from_evohome_response():
    assert (
        crm._extract_crm_reference({"data": {"leadId": "abc", "duplicate": False}})
        == "abc"
    )
    assert crm._extract_crm_reference({"id": "flat"}) == "flat"
    assert crm._extract_crm_reference({}) == "synced"


def test_auth_headers_x_integration_key():
    with patch.object(crm.settings, "CRM_API_KEY", "evocrm_whk_test"), patch.object(
        crm.settings, "CRM_AUTH_HEADER", "X-Integration-Key"
    ):
        headers = crm._auth_headers()
    assert headers["X-Integration-Key"] == "evocrm_whk_test"
    assert headers["Content-Type"] == "application/json"


def test_auth_headers_authorization_adds_bearer_prefix():
    with patch.object(crm.settings, "CRM_API_KEY", "evocrm_whk_test"), patch.object(
        crm.settings, "CRM_AUTH_HEADER", "Authorization"
    ):
        headers = crm._auth_headers()
    assert headers["Authorization"] == "Bearer evocrm_whk_test"


def test_auth_headers_authorization_keeps_existing_bearer_prefix():
    with patch.object(crm.settings, "CRM_API_KEY", "Bearer already"), patch.object(
        crm.settings, "CRM_AUTH_HEADER", "Authorization"
    ):
        headers = crm._auth_headers()
    assert headers["Authorization"] == "Bearer already"


def test_push_lead_disabled_returns_none():
    with patch.object(crm.settings, "CRM_SYNC_ENABLED", False):
        assert crm.push_lead(SAMPLE_LEAD) is None


def test_push_lead_posts_and_returns_lead_id():
    mock_resp = MagicMock()
    mock_resp.content = b'{"data":{"leadId":"crm-lead-1"}}'
    mock_resp.json.return_value = {"data": {"leadId": "crm-lead-1"}}
    mock_resp.raise_for_status.return_value = None

    with patch.object(crm.settings, "CRM_SYNC_ENABLED", True), patch.object(
        crm.settings, "CRM_WEBHOOK_URL", "https://crm.example/leads"
    ), patch.object(crm.settings, "CRM_API_KEY", "secret"), patch.object(
        crm.settings, "CRM_AUTH_HEADER", "X-Integration-Key"
    ), patch("services.crm.requests.post", return_value=mock_resp) as post:
        reference = crm.push_lead(SAMPLE_LEAD)

    assert reference == "crm-lead-1"
    post.assert_called_once()
    kwargs = post.call_args.kwargs
    assert kwargs["json"]["firstName"] == "Jane"
    assert kwargs["headers"]["X-Integration-Key"] == "secret"


def test_push_lead_swallows_http_errors():
    mock_resp = MagicMock()
    mock_resp.raise_for_status.side_effect = Exception("boom")

    with patch.object(crm.settings, "CRM_SYNC_ENABLED", True), patch.object(
        crm.settings, "CRM_WEBHOOK_URL", "https://crm.example/leads"
    ), patch.object(crm.settings, "CRM_API_KEY", "secret"), patch(
        "services.crm.requests.post", return_value=mock_resp
    ):
        assert crm.push_lead(SAMPLE_LEAD) is None


def test_get_crm_status_requires_key_and_url():
    with patch.object(crm.settings, "CRM_SYNC_ENABLED", True), patch.object(
        crm.settings, "CRM_WEBHOOK_URL", "https://crm.example/leads"
    ), patch.object(crm.settings, "CRM_API_KEY", ""):
        status = crm.get_crm_status()
    assert status["enabled"] is True
    assert status["configured"] is False
    assert status["webhook_url_set"] is True

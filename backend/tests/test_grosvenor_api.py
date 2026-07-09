"""Backend regression tests for the Grosvenor Vistas API.

Covers: units (list/filter/sort, slug), leads (form + click), downloads
(open vs gated), auth (login/me), and admin (stats + CRUD).

Requires a running API. Set REACT_APP_BACKEND_URL, or add it to frontend/.env.
"""
import os
import uuid
from pathlib import Path

import pytest
import requests


def _resolve_backend_url():
    url = os.environ.get("REACT_APP_BACKEND_URL")
    if url:
        return url.rstrip("/")

    repo_root = Path(__file__).resolve().parents[2]
    env_candidates = (
        repo_root / "frontend" / ".env",
        Path("/app/frontend/.env"),
    )
    for env_path in env_candidates:
        if not env_path.is_file():
            continue
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                return line.split("=", 1)[1].strip().rstrip("/")
    return None


BASE_URL = _resolve_backend_url()
if not BASE_URL:
    pytest.skip(
        "Backend regression tests require REACT_APP_BACKEND_URL "
        "(env var or frontend/.env). Start the API and set the URL before running pytest.",
        allow_module_level=True,
    )

API = BASE_URL + "/api"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@grosvenorvistas.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Grosvenor2026!")


def _leads_items(payload):
    if isinstance(payload, list):
        return payload
    return payload.get("items", [])


def _leads_total(payload):
    if isinstance(payload, list):
        return len(payload)
    return payload.get("total", len(_leads_items(payload)))


# -------------------- fixtures --------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture
def admin_session(session, admin_token):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}",
    })
    return s


# -------------------- units --------------------
class TestUnits:
    def test_list_returns_43(self, session):
        r = session.get(f"{API}/units")
        assert r.status_code == 200
        units = r.json()
        assert isinstance(units, list)
        assert len(units) == 43, f"expected 43 units, got {len(units)}"
        # No bedrooms / bathrooms / floor plan fields per brand rule
        sample = units[0]
        for forbidden in ("bedrooms", "bathrooms", "floor_plan", "images"):
            assert forbidden not in sample, f"forbidden field present: {forbidden}"
        for amenity in sample.get("amenities", []):
            lower = amenity.lower()
            assert "bedroom" not in lower, f"prohibited amenity copy: {amenity}"
            assert "bathroom" not in lower, f"prohibited amenity copy: {amenity}"
            assert "floor plan" not in lower, f"prohibited amenity copy: {amenity}"
        assert "_id" in sample and "slug" in sample

    def test_filter_by_building(self, session):
        # discover a real building from listing
        all_units = session.get(f"{API}/units").json()
        building = all_units[0]["building"]
        r = session.get(f"{API}/units", params={"building": building})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(u["building"] == building for u in data)

    def test_filter_by_status_available(self, session):
        r = session.get(f"{API}/units", params={"status": "available"})
        assert r.status_code == 200
        data = r.json()
        assert all(u["status"] == "available" for u in data)

    def test_filter_by_price_range(self, session):
        r = session.get(f"{API}/units",
                        params={"min_price": 100000, "max_price": 1000000})
        assert r.status_code == 200
        for u in r.json():
            assert u["price"] is None or 100000 <= u["price"] <= 1000000

    def test_sort_price_asc(self, session):
        r = session.get(f"{API}/units", params={"sort": "price_asc"})
        assert r.status_code == 200
        prices = [u["price"] for u in r.json() if u["price"] is not None]
        assert prices == sorted(prices)

    def test_sort_price_desc(self, session):
        r = session.get(f"{API}/units", params={"sort": "price_desc"})
        assert r.status_code == 200
        prices = [u["price"] for u in r.json() if u["price"] is not None]
        assert prices == sorted(prices, reverse=True)

    def test_sort_surface_desc(self, session):
        r = session.get(f"{API}/units", params={"sort": "surface_desc"})
        surfaces = [u["total_surface"] for u in r.json()]
        assert surfaces == sorted(surfaces, reverse=True)

    def test_get_by_slug_a101(self, session):
        r = session.get(f"{API}/units/a101")
        assert r.status_code == 200, r.text
        unit = r.json()
        assert unit["slug"] == "a101"
        assert "building" in unit

    def test_get_unknown_slug_404(self, session):
        r = session.get(f"{API}/units/does-not-exist-xyz")
        assert r.status_code == 404


# -------------------- leads --------------------
class TestLeads:
    def test_create_general_contact_lead(self, session):
        payload = {
            "first_name": "TEST",
            "last_name": "User",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+18761112222",
            "message": "Hi, please contact me.",
            "consent": True,
            "lead_type": "general_contact",
            "source_page": "/contact",
            "source_url": "https://example.com/contact",
            "utm_source": "test",
            "utm_medium": "pytest",
            "utm_campaign": "regression",
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert isinstance(data.get("id"), str) and len(data["id"]) > 0

    def test_create_lead_missing_consent_422(self, session):
        payload = {
            "first_name": "TEST",
            "last_name": "NoConsent",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "lead_type": "general_contact",
            "message": "no consent",
            "consent": False,
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 422, f"expected 422 got {r.status_code} {r.text}"

    def test_create_lead_missing_first_name_422(self, session):
        payload = {
            "last_name": "Only",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "lead_type": "general_contact",
            "consent": True,
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 422, f"expected 422 got {r.status_code} {r.text}"

    def test_create_lead_missing_last_name_422(self, session):
        payload = {
            "first_name": "Only",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "lead_type": "general_contact",
            "consent": True,
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 422, f"expected 422 got {r.status_code} {r.text}"

    def test_create_lead_missing_email_422(self, session):
        payload = {
            "first_name": "First",
            "last_name": "Last",
            "lead_type": "general_contact",
            "consent": True,
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 422, f"expected 422 got {r.status_code} {r.text}"

    def test_track_whatsapp_anonymous_click(self, session):
        r = session.post(f"{API}/track",
                         json={"lead_type": "whatsapp_click",
                               "source_url": "https://example.com"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert data.get("id")

    def test_track_phone_anonymous_click(self, session):
        r = session.post(f"{API}/track",
                         json={"lead_type": "phone_click",
                               "source_url": "https://example.com"})
        assert r.status_code == 200, r.text

    def test_track_email_anonymous_click(self, session):
        r = session.post(f"{API}/track",
                         json={"lead_type": "email_click",
                               "source_url": "https://example.com"})
        assert r.status_code == 200, r.text

    def test_create_contact_about_unit_lead_with_collection_fields(self, session, admin_session):
        """New: unit-detail enquiry carries collection / unit_surface / unit_balcony."""
        unique_email = f"test_unitdetail_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "first_name": "TESTUnit",
            "last_name": "Enquiry",
            "email": unique_email,
            "phone": "+18764844244",
            "message": "Please share the floor plan for A102.",
            "consent": True,
            "lead_type": "contact_about_unit",
            "source_page": "/residences/a102",
            "source_unit": "A102",
            "source_building": "Heliconia",
            "collection": "Signature Residences",
            "unit_surface": 1872.5,
            "unit_balcony": 145.0,
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        # Verify persistence with all new fields
        r = admin_session.get(f"{API}/admin/leads")
        assert r.status_code == 200
        match = next((l for l in _leads_items(r.json()) if l.get("email") == unique_email), None)
        assert match is not None, "unit-detail lead not found in admin list"
        assert match.get("lead_type") == "contact_about_unit"
        assert match.get("source_unit") == "A102"
        assert match.get("source_building") == "Heliconia"
        assert match.get("collection") == "Signature Residences"
        assert match.get("unit_surface") == 1872.5
        assert match.get("unit_balcony") == 145.0

    def test_track_rejects_form_lead_type(self, session):
        """Defensive: /track should not accept non-click lead types (per iteration_2 action item)."""
        r = session.post(f"{API}/track",
                         json={"lead_type": "general_contact",
                               "source_url": "https://example.com"})
        # Either explicit 422 (preferred) OR at minimum the prior behavior — record as
        # a soft assertion that flags if backend still permits it.
        assert r.status_code in (400, 422), (
            f"/api/track should reject non-click lead_type but got "
            f"{r.status_code}: {r.text}"
        )

    def test_create_sales_explorer_lead_rejected_on_public_api(self, session):
        payload = {
            "first_name": "TEST",
            "last_name": "Public",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "consent": True,
            "lead_type": "sales_explorer",
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 403, r.text

    def test_create_sales_explorer_lead_with_protected_fields(self, admin_session):
        """sales_explorer lead carries unit_living, unit_floor, unit_status, residence_type."""
        unique_email = f"test_explorer_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "first_name": "TESTExplorer",
            "last_name": "Sales",
            "email": unique_email,
            "phone": "+18761234567",
            "message": "Notes about Residence A402.",
            "consent": True,
            "lead_type": "sales_explorer",
            "source_page": "/admin/residence-explorer",
            "source_unit": "A402",
            "source_building": "Heliconia",
            "collection": "3 Bedroom Penthouse — Type C",
            "residence_type": "3 Bedroom Penthouse — Type C",
            "unit_surface": 3135.0,
            "unit_living": 2700.0,
            "unit_balcony": 435.0,
            "unit_floor": "4th Floor",
            "unit_status": "available",
        }
        r = admin_session.post(f"{API}/admin/leads", json=payload)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        r = admin_session.get(f"{API}/admin/leads")
        assert r.status_code == 200
        match = next((l for l in _leads_items(r.json()) if l.get("email") == unique_email), None)
        assert match is not None, "sales_explorer lead not found in admin list"
        assert match.get("lead_type") == "sales_explorer"
        assert match.get("source_unit") == "A402"
        assert match.get("source_building") == "Heliconia"
        assert match.get("residence_type") == "3 Bedroom Penthouse — Type C"
        assert match.get("unit_surface") == 3135.0
        assert match.get("unit_living") == 2700.0
        assert match.get("unit_balcony") == 435.0
        assert match.get("unit_floor") == "4th Floor"
        assert match.get("unit_status") == "available"

    def test_lead_persisted_with_new_fields(self, session, admin_session):
        # Create lead and verify it appears in admin list with new schema fields
        unique_email = f"test_persist_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "first_name": "TESTPersist",
            "last_name": "User",
            "email": unique_email,
            "phone": "+12025550199",
            "message": "Persistence check",
            "consent": True,
            "lead_type": "general_contact",
            "source_page": "/contact",
            "source_unit": "A101",
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text

        r = admin_session.get(f"{API}/admin/leads")
        assert r.status_code == 200
        leads = _leads_items(r.json())
        match = next((l for l in leads if l.get("email") == unique_email), None)
        assert match is not None, "lead not found in admin list"
        assert match.get("first_name") == "TESTPersist"
        assert match.get("last_name") == "User"
        assert match.get("consent") is True
        assert match.get("project") == "Grosvenor Vistas"
        assert match.get("source_unit") == "A101"


# -------------------- downloads --------------------
class TestDownloads:
    def test_list_downloads(self, session):
        r = session.get(f"{API}/downloads")
        assert r.status_code == 200
        items = r.json()
        types = {d["type"] for d in items}
        assert "brochure" in types
        assert "pricelist" in types

    def test_pricelist_open(self, session):
        items = session.get(f"{API}/downloads").json()
        price = next(d for d in items if d["type"] == "pricelist")
        r = session.post(f"{API}/downloads/{price['_id']}/access",
                         json={"lead": None})
        assert r.status_code == 200, r.text
        assert r.json().get("file_url")

    def test_pricelist_access_records_download_lead(self, session, admin_session):
        items = session.get(f"{API}/downloads").json()
        price = next(d for d in items if d["type"] == "pricelist")
        before = _leads_total(admin_session.get(f"{API}/admin/leads").json())
        r = session.post(f"{API}/downloads/{price['_id']}/access", json={"lead": None})
        assert r.status_code == 200, r.text
        after = _leads_total(admin_session.get(f"{API}/admin/leads").json())
        assert after == before + 1
        assert _leads_items(admin_session.get(f"{API}/admin/leads").json())[0].get("lead_type") == "download_price_list"

    def test_brochure_gated_without_lead_422(self, session):
        items = session.get(f"{API}/downloads").json()
        broch = next(d for d in items if d["type"] == "brochure")
        r = session.post(f"{API}/downloads/{broch['_id']}/access",
                         json={"lead": None})
        assert r.status_code == 422, r.text

    def test_brochure_gated_with_lead_succeeds(self, session):
        items = session.get(f"{API}/downloads").json()
        broch = next(d for d in items if d["type"] == "brochure")
        lead = {
            "first_name": "TEST",
            "last_name": "Brochure",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "consent": True,
            "lead_type": "download_brochure",
        }
        r = session.post(f"{API}/downloads/{broch['_id']}/access",
                         json={"lead": lead})
        assert r.status_code == 200, r.text
        assert r.json().get("file_url")


# -------------------- auth --------------------
class TestAuth:
    def test_login_invalid_password(self, session):
        r = session.post(f"{API}/auth/login",
                         json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_token(self, admin_session):
        r = admin_session.get(f"{API}/auth/me")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data.get("role") == "admin"

    def test_admin_requires_auth(self):
        # Use a brand-new client to avoid auth cookies from the shared session
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code == 401, f"expected 401 got {r.status_code}"


# -------------------- admin --------------------
class TestAdmin:
    def test_stats(self, admin_session):
        r = admin_session.get(f"{API}/admin/stats")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "units_by_status" in data
        for k in ("available", "reserved", "sold"):
            assert k in data["units_by_status"]
        assert "leads_by_type" in data
        assert data["units_total"] == 43

    def test_admin_list_units_leads_downloads(self, admin_session):
        for path in ("units", "downloads"):
            r = admin_session.get(f"{API}/admin/{path}")
            assert r.status_code == 200, f"{path}: {r.text}"
            assert isinstance(r.json(), list)

        r = admin_session.get(f"{API}/admin/leads")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, dict)
        assert "items" in data and "total" in data
        assert isinstance(data["items"], list)

    def test_unit_crud_lifecycle(self, admin_session):
        payload = {
            "building": "TEST Block",
            "unit_number": f"T{uuid.uuid4().hex[:4].upper()}",
            "floor": 1,
            "total_surface": 1000.0,
            "balcony_surface": 100.0,
            "price": 500000,
            "currency": "USD",
            "status": "available",
        }
        r = admin_session.post(f"{API}/admin/units", json=payload)
        assert r.status_code == 200, r.text
        created = r.json()
        unit_id = created["_id"]
        assert created["building"] == "TEST Block"

        # Patch status -> reserved
        r = admin_session.patch(f"{API}/admin/units/{unit_id}",
                                json={"status": "reserved"})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "reserved"

        # Verify GET reflects it (public route)
        r = admin_session.get(f"{API}/units/{created['slug']}")
        assert r.status_code == 200
        assert r.json()["status"] == "reserved"

        # Delete
        r = admin_session.delete(f"{API}/admin/units/{unit_id}")
        assert r.status_code == 200

        # Confirm 404
        r = admin_session.get(f"{API}/units/{created['slug']}")
        assert r.status_code == 404

    def test_lead_status_update(self, admin_session, session):
        # create a fresh lead
        lead_payload = {
            "first_name": "TEST",
            "last_name": "LeadPatch",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "consent": True,
            "lead_type": "general_contact",
        }
        r = session.post(f"{API}/leads", json=lead_payload)
        assert r.status_code == 200
        lead_id = r.json()["id"]

        r = admin_session.patch(f"{API}/admin/leads/{lead_id}",
                                json={"status": "contacted", "notes": "TEST"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "contacted"
        assert data["notes"] == "TEST"

    def test_leads_pagination(self, admin_session):
        r = admin_session.get(f"{API}/admin/leads", params={"limit": 2, "offset": 0})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "items" in data and "total" in data
        assert data["limit"] == 2
        assert data["offset"] == 0
        assert len(data["items"]) <= 2

    def test_leads_search_by_email(self, admin_session, session):
        unique_email = f"test_search_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "first_name": "TESTSearch",
            "last_name": "User",
            "email": unique_email,
            "consent": True,
            "lead_type": "general_contact",
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text

        r = admin_session.get(f"{API}/admin/leads", params={"search": unique_email})
        assert r.status_code == 200, r.text
        items = _leads_items(r.json())
        assert any(l.get("email") == unique_email for l in items)

    def test_leads_filter_by_status(self, admin_session, session):
        unique_email = f"test_status_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "first_name": "TEST",
            "last_name": "StatusFilter",
            "email": unique_email,
            "consent": True,
            "lead_type": "general_contact",
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        lead_id = r.json()["id"]

        r = admin_session.patch(f"{API}/admin/leads/{lead_id}", json={"status": "contacted"})
        assert r.status_code == 200, r.text

        r = admin_session.get(f"{API}/admin/leads", params={"status": "contacted", "search": unique_email})
        assert r.status_code == 200, r.text
        items = _leads_items(r.json())
        assert len(items) >= 1
        assert all(l.get("status") == "contacted" for l in items)

    def test_lead_notes_only_patch(self, admin_session, session):
        unique_email = f"test_notes_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "first_name": "TEST",
            "last_name": "NotesOnly",
            "email": unique_email,
            "consent": True,
            "lead_type": "general_contact",
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        lead_id = r.json()["id"]

        r = admin_session.patch(f"{API}/admin/leads/{lead_id}", json={"notes": "Follow up tomorrow"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["notes"] == "Follow up tomorrow"
        assert data["status"] == "new"

    def test_lead_patch_invalid_id_404(self, admin_session):
        r = admin_session.patch(f"{API}/admin/leads/not-a-valid-id", json={"status": "contacted"})
        assert r.status_code == 404, r.text

    def test_lead_patch_empty_body_422(self, admin_session, session):
        lead_payload = {
            "first_name": "TEST",
            "last_name": "EmptyPatch",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "consent": True,
            "lead_type": "general_contact",
        }
        r = session.post(f"{API}/leads", json=lead_payload)
        assert r.status_code == 200, r.text
        lead_id = r.json()["id"]

        r = admin_session.patch(f"{API}/admin/leads/{lead_id}", json={})
        assert r.status_code == 422, r.text

    def test_leads_export_csv(self, admin_session):
        r = admin_session.get(f"{API}/admin/leads/export")
        assert r.status_code == 200, r.text
        assert "text/csv" in r.headers.get("content-type", "")
        assert "message" in r.text.splitlines()[0]

    def test_floorplan_requires_auth(self, session):
        r = session.get(f"{API}/admin/floorplans/A101")
        assert r.status_code == 401

    def test_floorplan_serves_pdf_for_admin(self, admin_session):
        r = admin_session.get(f"{API}/admin/floorplans/A101")
        assert r.status_code == 200, r.text
        assert r.headers.get("content-type", "").startswith("application/pdf")

    def test_floorplan_unknown_unit_404(self, admin_session):
        r = admin_session.get(f"{API}/admin/floorplans/DOESNOTEXIST999")
        assert r.status_code == 404


# -------------------- content --------------------
class TestContent:
    def test_faq(self, session):
        r = session.get(f"{API}/content/faq")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 5
        assert "q" in data[0] and "a" in data[0]

    def test_amenities(self, session):
        r = session.get(f"{API}/content/amenities")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3
        assert data[0]["items"][0]["icon"]


# -------------------- auth refresh / admin sync --------------------
class TestAuthRefresh:
    def test_refresh_requires_cookie(self, session):
        r = session.post(f"{API}/auth/refresh")
        assert r.status_code == 401


class TestAdminSync:
    def test_units_sync_stub(self, admin_session):
        r = admin_session.post(f"{API}/admin/units/sync")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert "units_updated" in data

    def test_crm_status(self, admin_session):
        r = admin_session.get(f"{API}/admin/crm/status")
        assert r.status_code == 200
        assert "enabled" in r.json()

"""Backend regression tests for the Grosvenor Vistas API.

Covers: units (list/filter/sort, slug), leads (form + click), downloads
(open vs gated), auth (login/me), and admin (stats + CRUD).
"""
import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to reading from /app/frontend/.env at test-time
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break

API = BASE_URL.rstrip("/") + "/api"
ADMIN_EMAIL = "admin@grosvenorvistas.com"
ADMIN_PASSWORD = "Grosvenor2026!"


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
        leads = r.json()
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
        for path in ("units", "leads", "downloads"):
            r = admin_session.get(f"{API}/admin/{path}")
            assert r.status_code == 200, f"{path}: {r.text}"
            assert isinstance(r.json(), list)

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

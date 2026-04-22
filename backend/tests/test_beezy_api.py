"""Backend API tests for Beezy Home Services — iteration 2 (JWT auth + paginated admin + email bg tasks)."""
import os
import time
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "mohammedshoaibzfs@gmail.com"
ADMIN_PASSWORD = "Denx@1e05"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def token(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture
def auth_client(client, token):
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


# ============ HEALTH ============
def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "live"


def test_services_list(client):
    r = client.get(f"{API}/services")
    assert r.status_code == 200
    services = r.json().get("services", [])
    assert len(services) == 7
    keys = {s["key"] for s in services}
    assert {"plumbing", "electrical", "cleaning", "eldercare", "ac", "painting", "pestcontrol"}.issubset(keys)


# ============ AUTH ============
def test_login_success(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data and isinstance(data["access_token"], str) and len(data["access_token"]) > 10
    assert data["token_type"] == "bearer"
    assert data["email"] == ADMIN_EMAIL.lower()
    assert isinstance(data["expires_in"], int) and data["expires_in"] > 0


def test_login_wrong_password(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG"})
    assert r.status_code == 401


def test_login_unknown_email(client):
    r = client.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"})
    assert r.status_code == 401


def test_me_requires_token(client):
    r = client.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_invalid_token(client):
    client.headers.update({"Authorization": "Bearer not.a.jwt"})
    r = client.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_with_valid_token(auth_client):
    r = auth_client.get(f"{API}/auth/me")
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL.lower()
    assert data["role"] == "admin"
    assert "password_hash" not in data
    assert "_id" not in data


# ============ PROTECTED ADMIN — 401 WITHOUT TOKEN ============
@pytest.mark.parametrize("path", [
    "/admin/stats",
    "/admin/bookings",
    "/admin/pilot-signups",
    "/admin/shield-subscriptions",
    "/admin/investor-inquiries",
])
def test_admin_endpoints_require_auth(client, path):
    r = client.get(f"{API}{path}")
    assert r.status_code == 401, f"{path} should require auth, got {r.status_code}"


# ============ PUBLIC CREATE (201 + background email) ============
def test_create_booking_201(client):
    payload = {
        "service": "plumbing",
        "full_name": "TEST_Booking User",
        "phone": "9999900001",
        "address": "TEST 12, Indiranagar",
        "apartment": "Block A",
        "preferred_date": "2026-02-10",
        "preferred_slot": "Morning (8-11 AM)",
        "notes": "Leaky tap",
    }
    t0 = time.time()
    r = client.post(f"{API}/bookings", json=payload)
    elapsed = time.time() - t0
    assert r.status_code == 201, r.text
    assert elapsed < 5, f"Response took {elapsed:.2f}s — background task likely blocking"
    d = r.json()
    assert d["service"] == "plumbing"
    assert d["full_name"] == "TEST_Booking User"
    assert "id" in d and "_id" not in d


def test_booking_validation(client):
    r = client.post(f"{API}/bookings", json={"service": "plumbing"})
    assert r.status_code == 422


def test_create_pilot_201(client):
    payload = {
        "full_name": "TEST_Pilot User",
        "phone": "9999900002",
        "apartment_complex": "TEST Prestige Lakeside",
        "service_needed": "plumbing",
    }
    r = client.post(f"{API}/pilot-signups", json=payload)
    assert r.status_code == 201, r.text
    d = r.json()
    assert d["apartment_complex"] == "TEST Prestige Lakeside"
    assert "_id" not in d


def test_create_shield_201(client):
    payload = {
        "full_name": "TEST_Shield User",
        "phone": "9999900003",
        "email": "test_shield@example.com",
        "address": "TEST 22, Koramangala",
    }
    r = client.post(f"{API}/shield-subscribe", json=payload)
    assert r.status_code == 201, r.text
    d = r.json()
    assert d["plan"] == "Beezy Shield Annual"
    assert d["email"] == "test_shield@example.com"


def test_create_investor_201(client):
    payload = {
        "full_name": "TEST_Investor User",
        "email": "test_investor@example.com",
        "organization": "TEST Capital",
        "message": "Keen to learn more.",
    }
    r = client.post(f"{API}/investor-contact", json=payload)
    assert r.status_code == 201, r.text
    assert r.json()["organization"] == "TEST Capital"


def test_investor_invalid_email(client):
    r = client.post(f"{API}/investor-contact", json={
        "full_name": "x", "email": "not-an-email", "organization": "X", "message": "hi"
    })
    assert r.status_code == 422


# ============ OLD PUBLIC GET LISTS — SHOULD BE REMOVED ============
@pytest.mark.parametrize("path", ["/bookings", "/pilot-signups"])
def test_old_public_list_removed(client, path):
    r = client.get(f"{API}{path}")
    # Should return 404 or 405 (method not allowed) — NOT a 200 list
    assert r.status_code in (404, 405), f"GET {path} still reachable ({r.status_code})"


# ============ PROTECTED ADMIN — PAGINATION + CONTENT ============
def test_admin_stats(auth_client):
    r = auth_client.get(f"{API}/admin/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ("bookings", "pilot_signups", "shield_subscriptions", "investor_inquiries", "total_leads"):
        assert k in d
        assert isinstance(d[k], int) and d[k] >= 0
    assert d["total_leads"] == d["bookings"] + d["pilot_signups"] + d["shield_subscriptions"] + d["investor_inquiries"]


@pytest.mark.parametrize("path", [
    "/admin/bookings",
    "/admin/pilot-signups",
    "/admin/shield-subscriptions",
    "/admin/investor-inquiries",
])
def test_admin_pagination_shape(auth_client, path):
    r = auth_client.get(f"{API}{path}?page=1&page_size=50")
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ("items", "total", "page", "page_size", "pages"):
        assert k in d, f"Missing {k} in {path}"
    assert d["page"] == 1
    assert d["page_size"] == 50
    assert isinstance(d["items"], list)
    assert len(d["items"]) <= 50
    # No MongoDB _id leak
    for it in d["items"]:
        assert "_id" not in it


def test_admin_bookings_sorted_desc(auth_client, client):
    # Create a fresh booking, it should appear first (sorted by created_at desc)
    r = client.post(f"{API}/bookings", json={
        "service": "plumbing",
        "full_name": "TEST_Sort Probe",
        "phone": "9999900099",
        "address": "TEST sort",
        "preferred_date": "2026-03-01",
        "preferred_slot": "Morning (8-11 AM)",
    })
    assert r.status_code == 201
    new_id = r.json()["id"]
    time.sleep(0.3)
    r2 = auth_client.get(f"{API}/admin/bookings?page=1&page_size=5")
    assert r2.status_code == 200
    items = r2.json()["items"]
    assert len(items) > 0
    # Newest should be at index 0 (or close) — verify descending order
    assert items[0]["id"] == new_id or any(i["id"] == new_id for i in items)
    # Check sort order across returned items
    dates = [i["created_at"] for i in items]
    assert dates == sorted(dates, reverse=True), "items are not sorted by created_at desc"


def test_admin_page_size_param(auth_client):
    r = auth_client.get(f"{API}/admin/bookings?page=1&page_size=2")
    assert r.status_code == 200
    d = r.json()
    assert d["page_size"] == 2
    assert len(d["items"]) <= 2

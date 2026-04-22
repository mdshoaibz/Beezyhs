"""Backend API tests for Beezy Home Services"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://beezy-home.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Health
def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "live"
    assert "Beezy" in data.get("message", "")


# Services catalog
def test_services_list(client):
    r = client.get(f"{API}/services")
    assert r.status_code == 200
    services = r.json().get("services", [])
    assert len(services) == 7
    keys = {s["key"] for s in services}
    expected = {"plumbing", "electrical", "cleaning", "eldercare", "ac", "painting", "pestcontrol"}
    assert expected.issubset(keys)
    for s in services:
        for k in ("key", "name", "status", "eta", "description"):
            assert k in s


# Bookings
def test_create_and_list_booking(client):
    payload = {
        "service": "plumbing",
        "full_name": "TEST_Booking User",
        "phone": "9999900001",
        "address": "TEST 12, Indiranagar",
        "apartment": "Block A",
        "preferred_date": "2026-02-10",
        "preferred_slot": "Morning (8-11 AM)",
        "notes": "Leaky tap"
    }
    r = client.post(f"{API}/bookings", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["service"] == "plumbing"
    assert data["full_name"] == "TEST_Booking User"
    assert "id" in data and len(data["id"]) > 0
    assert "_id" not in data
    assert "created_at" in data

    # GET list and verify presence
    rl = client.get(f"{API}/bookings")
    assert rl.status_code == 200
    items = rl.json()
    assert any(b["id"] == data["id"] for b in items)
    for b in items:
        assert "_id" not in b


def test_booking_validation(client):
    r = client.post(f"{API}/bookings", json={"service": "plumbing"})
    assert r.status_code == 422


# Pilot signups
def test_create_and_list_pilot(client):
    payload = {
        "full_name": "TEST_Pilot User",
        "phone": "9999900002",
        "apartment_complex": "TEST Prestige Lakeside",
        "service_needed": "plumbing"
    }
    r = client.post(f"{API}/pilot-signups", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["apartment_complex"] == "TEST Prestige Lakeside"
    assert "id" in data
    assert "_id" not in data

    rl = client.get(f"{API}/pilot-signups")
    assert rl.status_code == 200
    assert any(p["id"] == data["id"] for p in rl.json())


# Shield
def test_create_and_list_shield(client):
    payload = {
        "full_name": "TEST_Shield User",
        "phone": "9999900003",
        "email": "test_shield@example.com",
        "address": "TEST 22, Koramangala"
    }
    r = client.post(f"{API}/shield-subscribe", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["plan"] == "Beezy Shield Annual"
    assert data["email"] == "test_shield@example.com"
    assert "_id" not in data

    rl = client.get(f"{API}/shield-subscribe")
    assert rl.status_code == 200
    assert any(s["id"] == data["id"] for s in rl.json())


# Investor
def test_create_and_list_investor(client):
    payload = {
        "full_name": "TEST_Investor User",
        "email": "test_investor@example.com",
        "organization": "TEST Capital",
        "message": "Keen to learn more about Beezy."
    }
    r = client.post(f"{API}/investor-contact", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["organization"] == "TEST Capital"
    assert "_id" not in data

    rl = client.get(f"{API}/investor-contact")
    assert rl.status_code == 200
    assert any(i["id"] == data["id"] for i in rl.json())


def test_investor_invalid_email(client):
    payload = {
        "full_name": "TEST_Bad Email",
        "email": "not-an-email",
        "organization": "X",
        "message": "hi"
    }
    r = client.post(f"{API}/investor-contact", json=payload)
    assert r.status_code == 422

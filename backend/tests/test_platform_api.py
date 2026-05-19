from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.database import Base, SessionLocal, engine, init_db
from app.main import create_app
from app.models import AdminRole, AdminUser
from app.security import hash_password

get_settings.cache_clear()


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Path = __import__("pathlib").Path
    db_file = Path(__file__).resolve().parent.parent / "data" / "test_platform.db"
    if db_file.exists():
        db_file.unlink()
    Base.metadata.drop_all(bind=engine)
    init_db()
    db = SessionLocal()
    try:
        db.add(
            AdminUser(
                email="test-admin@arrowbilisim.com",
                password_hash=hash_password("TestAdmin123!"),
                full_name="Test Admin",
                role=AdminRole.super_admin,
                is_active=True,
            )
        )
        db.commit()
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    return TestClient(create_app())


def _auth_header(client: TestClient) -> dict[str, str]:
    res = client.post(
        "/api/auth/login",
        json={"email": "test-admin@arrowbilisim.com", "password": "TestAdmin123!"},
    )
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_auth_me(client: TestClient):
    headers = _auth_header(client)
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == "test-admin@arrowbilisim.com"


def test_customer_and_license_flow(client: TestClient):
    headers = _auth_header(client)

    cust = client.post(
        "/api/customers",
        headers=headers,
        json={"company_name": "Arrow Demo Restoran", "contact_name": "Patron"},
    )
    assert cust.status_code == 201
    customer_id = cust.json()["id"]

    lic = client.post(
        "/api/licenses",
        headers=headers,
        json={
            "customer_id": customer_id,
            "plan": "demo",
            "max_devices": 1,
            "features": {"reports": True},
        },
    )
    assert lic.status_code == 201
    body = lic.json()
    assert body["license_key"].startswith("AR-")
    assert body["plan"] == "demo"
    license_key = body["license_key"]

    activate = client.post(
        "/api/public/licenses/activate",
        json={
            "license_key": license_key,
            "device_id": "device-1",
            "device_name": "Kasa",
            "app_version": "1.0.0",
        },
    )
    assert activate.status_code == 200
    assert activate.json()["ok"] is True

    activate2 = client.post(
        "/api/public/licenses/activate",
        json={
            "license_key": license_key,
            "device_id": "device-1",
            "device_name": "Kasa",
        },
    )
    assert activate2.status_code == 200
    assert activate2.json()["ok"] is True
    assert activate2.json()["active_devices"] == 1

    validate = client.post(
        "/api/public/licenses/validate",
        json={"license_key": license_key, "device_id": "device-1"},
    )
    assert validate.status_code == 200
    v = validate.json()
    assert v["ok"] is True
    assert v["customer_name"] == "Arrow Demo Restoran"
    assert v["max_devices"] == 1
    assert "expires_at" in v
    assert v["days_left"] is not None


def test_validate_expired_license(client: TestClient):
    headers = _auth_header(client)

    cust = client.post(
        "/api/customers",
        headers=headers,
        json={"company_name": "Expired Co"},
    ).json()

    past = datetime.now(timezone.utc) - timedelta(days=30)
    expired = datetime.now(timezone.utc) - timedelta(days=1)

    lic = client.post(
        "/api/licenses",
        headers=headers,
        json={
            "customer_id": cust["id"],
            "plan": "standard",
            "starts_at": past.isoformat(),
            "expires_at": expired.isoformat(),
            "max_devices": 1,
        },
    )
    assert lic.status_code == 201
    key = lic.json()["license_key"]

    res = client.post(
        "/api/public/licenses/validate",
        json={"license_key": key, "device_id": "x"},
    )
    assert res.status_code == 200
    assert res.json()["ok"] is False


def test_activate_max_devices_403(client: TestClient):
    headers = _auth_header(client)
    cust = client.post(
        "/api/customers",
        headers=headers,
        json={"company_name": "Max Dev Co"},
    ).json()

    lic = client.post(
        "/api/licenses",
        headers=headers,
        json={"customer_id": cust["id"], "plan": "demo", "max_devices": 1},
    ).json()
    key = lic["license_key"]

    client.post(
        "/api/public/licenses/activate",
        json={"license_key": key, "device_id": "d1", "device_name": "A"},
    )
    blocked = client.post(
        "/api/public/licenses/activate",
        json={"license_key": key, "device_id": "d2", "device_name": "B"},
    )
    assert blocked.status_code == 403


def test_suspend_validate_fails(client: TestClient):
    headers = _auth_header(client)
    cust = client.post(
        "/api/customers",
        headers=headers,
        json={"company_name": "Suspend Co"},
    ).json()
    lic = client.post(
        "/api/licenses",
        headers=headers,
        json={"customer_id": cust["id"], "plan": "demo", "max_devices": 1},
    ).json()
    key = lic["license_key"]

    client.post(
        "/api/public/licenses/activate",
        json={"license_key": key, "device_id": "d1", "device_name": "A"},
    )
    client.post(f"/api/licenses/{key}/suspend", headers=headers)

    res = client.post(
        "/api/public/licenses/validate",
        json={"license_key": key, "device_id": "d1"},
    )
    assert res.json()["ok"] is False

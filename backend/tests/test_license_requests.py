from __future__ import annotations

from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.config import get_settings
from app.database import Base, SessionLocal, engine, init_db
from app.main import create_app
from app.models import AdminRole, AdminUser, Customer, License, LicensePlan, LicenseRequest, LicenseStatus
from app.security import hash_password

get_settings.cache_clear()

PAYLOAD = {
    "company_name": "Yeni Restoran A.Ş.",
    "contact_name": "Ahmet Yılmaz",
    "contact_position": "Patron",
    "email": "ahmet@yenirestoran.com",
    "phone": "5551234567",
    "tax_number": "1234567890",
    "machine_code": "MC-TEST-001",
    "device_name": "Kasa-1",
    "app_version": "1.0.0",
    "deployment_mode": "server",
    "requested_plan": "demo",
    "notes": "İlk kurulum talebi",
}


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    from pathlib import Path

    data_dir = Path(__file__).resolve().parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    db_file = data_dir / "test_platform.db"
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
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def test_public_create_license_request(client: TestClient):
    res = client.post("/api/public/license-requests", json=PAYLOAD)
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["ok"] is True
    assert body["request_code"].startswith("LR-")
    assert body["status"] == "pending"
    assert "oluşturuldu" in body["message"].lower() or body["message"]


def test_request_code_unique(client: TestClient):
    res1 = client.post("/api/public/license-requests", json={**PAYLOAD, "email": "a1@test.com", "machine_code": "MC-1"})
    res2 = client.post("/api/public/license-requests", json={**PAYLOAD, "email": "a2@test.com", "machine_code": "MC-2"})
    assert res1.status_code == 201
    assert res2.status_code == 201
    assert res1.json()["request_code"] != res2.json()["request_code"]


def test_status_query_machine_code_check(client: TestClient):
    create = client.post("/api/public/license-requests", json={**PAYLOAD, "machine_code": "MC-STATUS-1"})
    assert create.status_code == 201
    code = create.json()["request_code"]

    ok = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "MC-STATUS-1"},
    )
    assert ok.status_code == 200
    assert ok.json()["ok"] is True
    assert ok.json()["status"] == "pending"
    assert ok.json()["license_key"] is None

    bad = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "WRONG-MACHINE"},
    )
    assert bad.status_code == 403


def test_approve_creates_customer_and_license(client: TestClient):
    create = client.post(
        "/api/public/license-requests",
        json={**PAYLOAD, "email": "approve@test.com", "tax_number": "9998887776", "machine_code": "MC-APPR"},
    )
    assert create.status_code == 201
    code = create.json()["request_code"]

    db = SessionLocal()
    try:
        req = db.scalar(select(LicenseRequest).where(LicenseRequest.request_code == code))
        assert req is not None
        request_id = req.id
    finally:
        db.close()

    headers = _auth_header(client)
    res = client.post(f"/api/admin/license-requests/{request_id}/approve", headers=headers)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["status"] == "approved"
    assert body["license_key"] is not None
    assert body["license_key"].startswith("AR-")
    assert body["customer_id"] is not None

    db = SessionLocal()
    try:
        cust = db.scalar(select(Customer).where(Customer.email == "approve@test.com"))
        assert cust is not None
        assert cust.company_name == PAYLOAD["company_name"]
        lic = db.scalar(select(License).where(License.license_key == body["license_key"]))
        assert lic is not None
        assert lic.customer_id == cust.id
    finally:
        db.close()

    status_res = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "MC-APPR"},
    )
    assert status_res.status_code == 200
    assert status_res.json()["license_key"] == body["license_key"]


def test_approve_matches_existing_customer_by_email(client: TestClient):
    db = SessionLocal()
    try:
        existing = Customer(
            company_name="Mevcut Firma",
            email="existing@test.com",
            tax_number="1112223334",
        )
        db.add(existing)
        db.commit()
        existing_id = existing.id
    finally:
        db.close()

    create = client.post(
        "/api/public/license-requests",
        json={
            **PAYLOAD,
            "company_name": "Farklı İsim",
            "email": "existing@test.com",
            "tax_number": "5556667778",
            "machine_code": "MC-MATCH-EMAIL",
        },
    )
    assert create.status_code == 201
    db = SessionLocal()
    try:
        req = db.scalar(
            select(LicenseRequest).where(LicenseRequest.request_code == create.json()["request_code"])
        )
        request_id = req.id
    finally:
        db.close()

    headers = _auth_header(client)
    res = client.post(f"/api/admin/license-requests/{request_id}/approve", headers=headers)
    assert res.status_code == 200
    assert res.json()["customer_id"] == existing_id


def test_reject_without_reason_fails(client: TestClient):
    create = client.post(
        "/api/public/license-requests",
        json={**PAYLOAD, "email": "reject1@test.com", "machine_code": "MC-REJ1"},
    )
    db = SessionLocal()
    try:
        req = db.scalar(
            select(LicenseRequest).where(LicenseRequest.request_code == create.json()["request_code"])
        )
        request_id = req.id
    finally:
        db.close()

    headers = _auth_header(client)
    res = client.post(
        f"/api/admin/license-requests/{request_id}/reject",
        headers=headers,
        json={},
    )
    assert res.status_code == 422

    res2 = client.post(
        f"/api/admin/license-requests/{request_id}/reject",
        headers=headers,
        json={"rejection_reason": ""},
    )
    assert res2.status_code == 400
    assert "Red nedeni" in res2.json()["detail"]


def test_reject_with_reason_sets_status(client: TestClient):
    create = client.post(
        "/api/public/license-requests",
        json={**PAYLOAD, "email": "reject2@test.com", "machine_code": "MC-REJ2"},
    )
    code = create.json()["request_code"]
    db = SessionLocal()
    try:
        req = db.scalar(select(LicenseRequest).where(LicenseRequest.request_code == code))
        request_id = req.id
    finally:
        db.close()

    headers = _auth_header(client)
    res = client.post(
        f"/api/admin/license-requests/{request_id}/reject",
        headers=headers,
        json={"rejection_reason": "Eksik belge"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "rejected"
    assert body["rejection_reason"] == "Eksik belge"

    status_res = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "MC-REJ2"},
    )
    assert status_res.status_code == 200
    assert status_res.json()["rejection_reason"] == "Eksik belge"
    assert status_res.json()["license_key"] is None


def test_admin_list_requires_auth(client: TestClient):
    res = client.get("/api/admin/license-requests")
    assert res.status_code == 401

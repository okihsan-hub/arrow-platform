"""PLATFORM-1 — public license request status hardening."""
from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import SessionLocal
from app.models import License, LicensePlan, LicenseRequest, LicenseRequestStatus, LicenseStatus


def test_public_status_pending_for_new_request(client: TestClient):
    res = client.post(
        "/api/public/license-requests",
        json={
            "company_name": "Public Status Co",
            "contact_name": "Ali",
            "email": "public-status@test.com",
            "phone": "5550001122",
            "machine_code": "MC-PUB-ST",
            "device_name": "Kasa",
            "app_version": "1.0.0",
            "deployment_mode": "client",
        },
    )
    assert res.status_code == 201
    code = res.json()["request_code"]

    st = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "MC-PUB-ST"},
    )
    assert st.status_code == 200
    body = st.json()
    assert body["ok"] is True
    assert body["status"] == "pending"
    assert body["license_key"] is None


def test_orphan_approved_missing_license_row_returns_pending(client: TestClient):
    create = client.post(
        "/api/public/license-requests",
        json={
            "company_name": "Orphan Co",
            "contact_name": "Veli",
            "email": "orphan-key@test.com",
            "phone": "5550003344",
            "machine_code": "MC-ORPH-KEY",
            "device_name": "Kasa",
            "app_version": "1.0.0",
            "deployment_mode": "server",
        },
    )
    assert create.status_code == 201
    code = create.json()["request_code"]

    db = SessionLocal()
    try:
        req = db.scalar(select(LicenseRequest).where(LicenseRequest.request_code == code))
        assert req is not None
        req.status = LicenseRequestStatus.approved
        req.license_key = "AR-ORPHAN-NO-LICENSE"
        db.commit()
    finally:
        db.close()

    st = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "MC-ORPH-KEY"},
    )
    assert st.status_code == 200
    assert st.json()["status"] == "pending"
    assert st.json()["license_key"] is None


def test_approved_with_valid_license_returns_key(client: TestClient):
    create = client.post(
        "/api/public/license-requests",
        json={
            "company_name": "Valid Co",
            "contact_name": "Can",
            "email": "valid-lic@test.com",
            "phone": "5550005566",
            "machine_code": "MC-VALID",
            "device_name": "Kasa",
            "app_version": "1.0.0",
            "deployment_mode": "server",
        },
    )
    assert create.status_code == 201
    code = create.json()["request_code"]

    db = SessionLocal()
    try:
        req = db.scalar(select(LicenseRequest).where(LicenseRequest.request_code == code))
        assert req is not None
        from datetime import datetime, timedelta, timezone

        from app.models import Customer

        cust = Customer(company_name="Valid Co", email="valid-lic@test.com")
        db.add(cust)
        db.flush()
        key = "AR-VALID-TEST-KEY-001"
        lic = License(
            license_key=key,
            customer_id=cust.id,
            plan=LicensePlan.demo,
            status=LicenseStatus.active,
            starts_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            max_devices=1,
        )
        db.add(lic)
        req.status = LicenseRequestStatus.approved
        req.license_key = key
        req.customer_id = cust.id
        db.commit()
    finally:
        db.close()

    st = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "MC-VALID"},
    )
    assert st.status_code == 200
    assert st.json()["status"] == "approved"
    assert st.json()["license_key"] == key

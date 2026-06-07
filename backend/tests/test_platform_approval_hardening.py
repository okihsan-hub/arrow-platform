"""PLATFORM-1 — approval flow hardening."""
from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.database import SessionLocal
from app.models import LicenseRequest, LicenseRequestStatus


def _create_request(client: TestClient, *, machine_code: str = "MC-P1-001", email: str = "p1@test.com") -> tuple[str, int]:
    payload = {
        "company_name": "Platform One A.Ş.",
        "contact_name": "Test User",
        "email": email,
        "phone": "5551112233",
        "machine_code": machine_code,
        "device_name": "Kasa-1",
        "app_version": "1.0.0",
        "deployment_mode": "server",
        "requested_plan": "demo",
    }
    res = client.post("/api/public/license-requests", json=payload)
    assert res.status_code == 201, res.text
    code = res.json()["request_code"]
    db = SessionLocal()
    try:
        req = db.scalar(select(LicenseRequest).where(LicenseRequest.request_code == code))
        assert req is not None
        return code, req.id
    finally:
        db.close()


def _auth_header(client: TestClient) -> dict[str, str]:
    res = client.post(
        "/api/auth/login",
        json={"email": "test-admin@arrowbilisim.com", "password": "TestAdmin123!"},
    )
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def test_patch_status_approved_returns_400(client: TestClient):
    _, request_id = _create_request(client, email="patch-block@test.com")
    headers = _auth_header(client)
    res = client.patch(
        f"/api/admin/license-requests/{request_id}",
        headers=headers,
        json={"status": "approved"},
    )
    assert res.status_code == 400, res.text
    assert "approve" in res.json()["detail"].lower() or "lisans" in res.json()["detail"].lower()


def test_approve_create_license_works(client: TestClient):
    code, request_id = _create_request(client, email="approve-create@test.com", machine_code="MC-P1-APPR")
    headers = _auth_header(client)
    res = client.post(
        f"/api/admin/license-requests/{request_id}/approve-create-license",
        headers=headers,
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["status"] == "approved"
    assert body["license_key"]
    assert body["license_key"].startswith("AR-")

    status_res = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "MC-P1-APPR"},
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "approved"
    assert status_res.json()["license_key"] == body["license_key"]


def test_orphan_approved_without_license_returns_pending_status(client: TestClient):
    code, request_id = _create_request(client, email="orphan@test.com", machine_code="MC-P1-ORPH")
    db = SessionLocal()
    try:
        req = db.get(LicenseRequest, request_id)
        assert req is not None
        req.status = LicenseRequestStatus.approved
        req.license_key = None
        db.commit()
    finally:
        db.close()

    res = client.get(
        f"/api/public/license-requests/{code}/status",
        params={"machine_code": "MC-P1-ORPH"},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["ok"] is True
    assert body["status"] == "pending"
    assert body["license_key"] is None

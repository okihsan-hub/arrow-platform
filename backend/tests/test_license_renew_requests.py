from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.config import get_settings
from app.database import Base, SessionLocal, engine, init_db
from app.main import create_app
from app.models import AdminRole, AdminUser, Customer, License, LicensePlan, LicenseRenewRequest, LicenseStatus
from app.security import hash_password
from app.license_utils import ensure_aware
from app.services import license_renew_requests as renew_service

get_settings.cache_clear()


@pytest.fixture(scope="module", autouse=True)
def setup_db():
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


def _seed_license(db, *, key: str = "AR-ABCD-EFGH-IJKL-MNOP") -> License:
    cust = Customer(company_name="Demo Restoran")
    db.add(cust)
    db.flush()
    now = datetime.now(timezone.utc)
    lic = License(
        license_key=key,
        customer_id=cust.id,
        plan=LicensePlan.standard,
        status=LicenseStatus.active,
        starts_at=now - timedelta(days=30),
        expires_at=now + timedelta(days=5),
        max_devices=2,
    )
    db.add(lic)
    db.commit()
    db.refresh(lic)
    return lic


def _write_jsonl(path: Path, records: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for rec in records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")


def test_import_from_jsonl_idempotent(client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    db = SessionLocal()
    try:
        lic = _seed_license(db)
    finally:
        db.close()

    created = datetime.now(timezone.utc).isoformat()
    record = {
        "created_at": created,
        "requested_period": "1_month",
        "requested_period_label": "1 ay",
        "note": "Uzat",
        "contact_phone": "555",
        "license_key": lic.license_key,
        "license_key_masked": "AR-A****MNOP",
        "customer_name": "Demo Restoran",
        "device_name": "Kasa",
        "device_id": "dev-1",
        "status": "active",
        "plan": "standard",
    }
    jsonl = tmp_path / "requests.jsonl"
    _write_jsonl(jsonl, [record])
    monkeypatch.setenv("LICENSE_RENEW_JSONL_PATH", str(jsonl))
    get_settings.cache_clear()

    headers = _auth_header(client)
    res1 = client.get("/api/admin/license-renew-requests", headers=headers)
    assert res1.status_code == 200
    assert len(res1.json()) == 1
    assert res1.json()[0]["status"] == "pending"

    res2 = client.get("/api/admin/license-renew-requests", headers=headers)
    assert res2.status_code == 200
    assert len(res2.json()) == 1


def test_approve_extends_expires_at(client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    db = SessionLocal()
    try:
        lic = _seed_license(db, key="AR-APPR-OVE1-EXT1-KEYS-HERE")
        old_expires = lic.expires_at
        created = datetime.now(timezone.utc).isoformat()
        jsonl = tmp_path / "approve.jsonl"
        _write_jsonl(
            jsonl,
            [
                {
                    "created_at": created,
                    "requested_period": "1_month",
                    "license_key": lic.license_key,
                    "customer_name": "Demo Restoran",
                }
            ],
        )
        monkeypatch.setenv("LICENSE_RENEW_JSONL_PATH", str(jsonl))
        get_settings.cache_clear()
        sync = renew_service.sync_from_jsonl(db, path=jsonl)
        assert sync["imported"] == 1
        req = db.scalar(
            select(LicenseRenewRequest)
            .where(LicenseRenewRequest.license_key == lic.license_key)
            .order_by(LicenseRenewRequest.id.desc())
        )
        assert req is not None
        request_id = req.id
        license_id = lic.id
    finally:
        db.close()

    headers = _auth_header(client)
    res = client.post(f"/api/admin/license-renew-requests/{request_id}/approve", headers=headers)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["status"] == "approved"

    db = SessionLocal()
    try:
        lic2 = db.get(License, license_id)
        assert lic2 is not None
        assert ensure_aware(lic2.expires_at) > ensure_aware(old_expires)
    finally:
        db.close()


def test_reject_changes_status(client: TestClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    db = SessionLocal()
    try:
        lic = _seed_license(db, key="AR-REJE-CTED-KEYS-HERE")
        jsonl = tmp_path / "reject.jsonl"
        _write_jsonl(
            jsonl,
            [
                {
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "requested_period": "3_months",
                    "license_key": lic.license_key,
                }
            ],
        )
        renew_service.sync_from_jsonl(db, path=jsonl)
        req = db.scalar(
            select(LicenseRenewRequest)
            .where(LicenseRenewRequest.license_key == lic.license_key)
            .order_by(LicenseRenewRequest.id.desc())
        )
        assert req is not None
        request_id = req.id
    finally:
        db.close()

    headers = _auth_header(client)
    res = client.post(f"/api/admin/license-renew-requests/{request_id}/reject", headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "rejected"


def test_list_requires_auth(client: TestClient):
    res = client.get("/api/admin/license-renew-requests")
    assert res.status_code == 401


def test_public_renew_request_post(client: TestClient):
    payload = {
        "external_id": "renew-ext-public-001",
        "requested_period": "1_year",
        "requested_period_label": "1 yıl",
        "note": "Cloud test",
        "contact_phone": "05551234567",
        "license_key": "AR-PUBLIC-RENEW-TEST01",
        "license_key_masked": "AR-P****ST01",
        "customer_name": "Public Renew Co",
        "device_name": "Kasa-1",
        "device_id": "dev-public-renew-1",
        "client_license_status": "active",
        "plan": "standard",
    }
    res1 = client.post("/api/public/license-renew-requests", json=payload)
    assert res1.status_code == 201, res1.text
    body1 = res1.json()
    assert body1["ok"] is True
    assert body1["external_id"] == payload["external_id"]
    assert body1["status"] == "pending"

    res2 = client.post("/api/public/license-renew-requests", json=payload)
    assert res2.status_code == 201, res2.text
    assert res2.json()["request_id"] == body1["request_id"]

    db = SessionLocal()
    try:
        row = db.scalar(
            select(LicenseRenewRequest).where(
                LicenseRenewRequest.external_id == payload["external_id"]
            )
        )
        assert row is not None
    finally:
        db.close()

    headers = _auth_header(client)
    admin = client.get("/api/admin/license-renew-requests", headers=headers)
    assert admin.status_code == 200
    ids = {row["external_id"] for row in admin.json()}
    assert payload["external_id"] in ids

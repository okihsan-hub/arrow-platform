from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.models.license import License, LicenseStatus


class DummySession:
    def add(self, _obj) -> None:  # noqa: D401
        return None

    def commit(self) -> None:
        return None

    def refresh(self, _obj) -> None:
        return None

    def rollback(self) -> None:
        return None


def _future(dt: int = 7) -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=dt)


def _sign(*, secret: str, license_key: str, device_id: str, timestamp: str, nonce: str) -> str:
    msg = f"{license_key}{device_id}{timestamp}{nonce}".encode("utf-8")
    return hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()


@pytest.fixture()
def app():
    return create_app()


@pytest.fixture()
def client(app, monkeypatch: pytest.MonkeyPatch):
    # override DB dependency to avoid real DB
    from app.core import db as core_db

    dummy = DummySession()

    def _get_db():
        yield dummy

    app.dependency_overrides[core_db.get_db] = _get_db
    return TestClient(app)


def test_validate_unbound_device_invalid(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    lic = License(
        customer_id=1,
        reseller_id=None,
        product_name="Arrow Restaurant",
        license_key="AR-TEST-TEST-TEST-TEST",
        status=LicenseStatus.active,
        starts_at=_future(-1),
        expires_at=_future(30),
        max_devices=1,
        bound_devices={},
    )

    from app.services import licenses as licenses_service
    from app.services import license_events as events_service

    calls: list[dict] = []
    monkeypatch.setattr(events_service, "log_license_event", lambda _db, **kw: calls.append(kw))

    monkeypatch.setattr(licenses_service, "get_license_by_key", lambda _db, _key: lic)

    res = client.post("/api/licenses/validate", json={"license_key": lic.license_key, "device_id": "dev-1"})
    assert res.status_code == 200
    body = res.json()
    assert body["valid"] is False
    assert body["reason"] == "device_not_activated"
    assert any(c.get("event_type").value == "validation" and c.get("success") is False for c in calls)


def test_activate_then_validate_bound_device_valid(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    lic = License(
        customer_id=1,
        reseller_id=None,
        product_name="Arrow Restaurant",
        license_key="AR-TEST-TEST-TEST-TEST",
        status=LicenseStatus.active,
        starts_at=_future(-1),
        expires_at=_future(30),
        max_devices=1,
        bound_devices={},
    )

    from app.services import licenses as licenses_service
    from app.services import license_signing as signing_service
    from app.services import license_events as events_service

    calls: list[dict] = []
    monkeypatch.setattr(events_service, "log_license_event", lambda _db, **kw: calls.append(kw))

    monkeypatch.setattr(licenses_service, "get_license_by_key", lambda _db, _key: lic)
    # use in-memory nonce tracker for DummySession tests
    seen: set[str] = set()
    monkeypatch.setattr(signing_service, "_consume_nonce", lambda _db, n: (False if n in seen else (seen.add(n) or True)))

    ts = str(int(datetime.now(timezone.utc).timestamp()))
    nonce = secrets.token_hex(8)
    sig = _sign(secret="test-signing-secret", license_key=lic.license_key, device_id="dev-1", timestamp=ts, nonce=nonce)

    r1 = client.post(
        "/api/licenses/activate",
        json={"license_key": lic.license_key, "device_id": "dev-1", "device_name": "Laptop", "app_version": "1.0.0"},
        headers={
            "X-Timestamp": ts,
            "X-Nonce": nonce,
            "X-Signature": sig,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
    )
    assert r1.status_code == 200
    assert r1.json()["valid"] is True
    assert "dev-1" in (lic.bound_devices or {})
    dev = (lic.bound_devices or {}).get("dev-1") or {}
    assert "device_name" in dev
    assert "first_seen_at" in dev
    assert "last_seen_at" in dev
    assert "app_version" in dev
    assert "ip" in dev
    assert "platform" in dev
    assert dev["platform"] == "windows"

    r2 = client.post("/api/licenses/validate", json={"license_key": lic.license_key, "device_id": "dev-1"})
    assert r2.status_code == 200
    body = r2.json()
    assert body["valid"] is True
    assert body["product_name"] == "Arrow Restaurant"
    assert body["max_devices"] == 1
    assert body["device_count"] == 1
    assert any(c.get("event_type").value == "activation" and c.get("success") is True for c in calls)


def test_activate_invalid_signature(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    lic = License(
        customer_id=1,
        reseller_id=None,
        product_name="Arrow Restaurant",
        license_key="AR-TEST-TEST-TEST-TEST",
        status=LicenseStatus.active,
        starts_at=_future(-1),
        expires_at=_future(30),
        max_devices=1,
        bound_devices={},
    )

    from app.services import licenses as licenses_service
    from app.services import license_signing as signing_service

    monkeypatch.setattr(licenses_service, "get_license_by_key", lambda _db, _key: lic)
    monkeypatch.setattr(signing_service, "_consume_nonce", lambda _db, _n: True)

    ts = str(int(datetime.now(timezone.utc).timestamp()))
    nonce = "abc123"
    res = client.post(
        "/api/licenses/activate",
        json={"license_key": lic.license_key, "device_id": "dev-1", "device_name": "Laptop", "app_version": "1.0.0"},
        headers={"X-Timestamp": ts, "X-Nonce": nonce, "X-Signature": "bad"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["valid"] is False
    assert body["reason"] == "invalid_signature"


def test_activate_rate_limited(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    lic = License(
        customer_id=1,
        reseller_id=None,
        product_name="Arrow Restaurant",
        license_key="AR-TEST-TEST-TEST-TEST",
        status=LicenseStatus.active,
        starts_at=_future(-1),
        expires_at=_future(30),
        max_devices=100,
        bound_devices={},
    )

    from app.services import licenses as licenses_service
    from app.services import license_signing as signing_service
    from app.services import rate_limit as rl

    rl._reset_for_tests()
    monkeypatch.setattr(licenses_service, "get_license_by_key", lambda _db, _key: lic)
    monkeypatch.setattr(signing_service, "_consume_nonce", lambda _db, _n: True)

    ts = str(int(datetime.now(timezone.utc).timestamp()))
    # Each request needs a different nonce to pass replay check (until rate limit hits)
    for i in range(10):
        nonce = f"n{i}"
        sig = _sign(secret="test-signing-secret", license_key=lic.license_key, device_id="dev-1", timestamp=ts, nonce=nonce)
        res = client.post(
            "/api/licenses/activate",
            json={"license_key": lic.license_key, "device_id": "dev-1", "device_name": "Kasa-1", "app_version": "1.0.0"},
            headers={"X-Timestamp": ts, "X-Nonce": nonce, "X-Signature": sig},
        )
        assert res.status_code == 200

    # 11th should be limited
    nonce = "n10"
    sig = _sign(secret="test-signing-secret", license_key=lic.license_key, device_id="dev-1", timestamp=ts, nonce=nonce)
    res = client.post(
        "/api/licenses/activate",
        json={"license_key": lic.license_key, "device_id": "dev-1", "device_name": "Kasa-1", "app_version": "1.0.0"},
        headers={"X-Timestamp": ts, "X-Nonce": nonce, "X-Signature": sig},
    )
    body = res.json()
    assert body["valid"] is False
    assert body["reason"] == "rate_limited"


from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.models.user import User, UserRole


@pytest.fixture()
def client():
    return TestClient(create_app())


def test_login_accepts_json_and_returns_token_pair(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    fake_user = User(
        id=1,
        email="admin@example.com",
        hashed_password="irrelevant",
        role=UserRole.admin,
        is_active=True,
    )

    from app.api.routers import auth as auth_mod

    def _auth(db, email: str, password: str):
        if email == "admin@example.com" and password == "123456":
            return fake_user
        return None

    monkeypatch.setattr(auth_mod, "authenticate_user", _auth)
    monkeypatch.setattr(auth_mod, "persist_refresh_token", lambda *a, **k: None)

    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "123456"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data.get("token_type") == "bearer"


def test_login_json_invalid_credentials_401(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    from app.api.routers import auth as auth_mod

    monkeypatch.setattr(auth_mod, "authenticate_user", lambda *a, **k: None)

    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "wrong"})
    assert res.status_code == 401

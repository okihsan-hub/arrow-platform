"""Faz 1 — public update check endpoint."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import create_app


def test_update_check_available_when_behind_latest():
    client = TestClient(create_app())
    r = client.get(
        "/api/public/updates/check",
        params={"app": "arrow-restaurant", "version": "1.0.0"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["app"] == "arrow-restaurant"
    assert body["current_version"] == "1.0.0"
    assert body["latest_version"] == "1.0.1"
    assert body["min_supported_version"] == "1.0.0"
    assert body["update_available"] is True
    assert body["force_update"] is False
    assert body["channel"] == "stable"
    assert body["download_url"] == ""
    assert body["sha256"] == ""
    assert body["release_notes"] == "Arrow Restaurant uzaktan güncelleme altyapısı hazırlandı."


def test_update_check_not_available_when_on_latest():
    client = TestClient(create_app())
    r = client.get(
        "/api/public/updates/check",
        params={"app": "arrow-restaurant", "version": "1.0.1"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["update_available"] is False
    assert body["current_version"] == "1.0.1"
    assert body["latest_version"] == "1.0.1"


def test_update_check_unknown_app_returns_404():
    client = TestClient(create_app())
    r = client.get(
        "/api/public/updates/check",
        params={"app": "unknown", "version": "1.0.0"},
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Update metadata not found"

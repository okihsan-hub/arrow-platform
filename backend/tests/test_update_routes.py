"""Faz 2A — public update check endpoint (DB-backed UpdateRelease)."""
from __future__ import annotations

import pytest

from app.database import SessionLocal
from app.models import UpdateRelease


@pytest.fixture()
def seed_arrow_restaurant_stable():
    db = SessionLocal()
    try:
        db.query(UpdateRelease).delete()
        db.add(
            UpdateRelease(
                app_name="arrow-restaurant",
                version="1.0.1",
                channel="stable",
                min_supported_version="1.0.0",
                force_update=False,
                download_url="",
                sha256="",
                release_notes="Arrow Restaurant uzaktan güncelleme altyapısı hazırlandı.",
                is_active=True,
            )
        )
        db.commit()
    finally:
        db.close()
    yield
    db = SessionLocal()
    try:
        db.query(UpdateRelease).delete()
        db.commit()
    finally:
        db.close()


def test_update_check_available_when_behind_latest(client, seed_arrow_restaurant_stable):
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


def test_update_check_not_available_when_on_latest(client, seed_arrow_restaurant_stable):
    r = client.get(
        "/api/public/updates/check",
        params={"app": "arrow-restaurant", "version": "1.0.1"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["update_available"] is False
    assert body["current_version"] == "1.0.1"
    assert body["latest_version"] == "1.0.1"


def test_update_check_release_not_found_returns_404(client):
    db = SessionLocal()
    try:
        db.query(UpdateRelease).delete()
        db.commit()
    finally:
        db.close()

    r = client.get(
        "/api/public/updates/check",
        params={"app": "unknown", "version": "1.0.0"},
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Update metadata not found"

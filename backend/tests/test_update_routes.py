"""Public update check endpoint — DB-backed UpdateRelease (Faz 2A–3)."""
from __future__ import annotations

import pytest

from app.database import SessionLocal
from app.models import ReleaseStatus, UpdateRelease


def _clear_releases() -> None:
    db = SessionLocal()
    try:
        db.query(UpdateRelease).delete()
        db.commit()
    finally:
        db.close()


def _add_release(**kwargs) -> None:
    db = SessionLocal()
    try:
        db.add(UpdateRelease(**kwargs))
        db.commit()
    finally:
        db.close()


@pytest.fixture()
def seed_arrow_restaurant_stable():
    _clear_releases()
    _add_release(
        app_name="arrow-restaurant",
        version="1.0.1",
        channel="stable",
        min_supported_version="1.0.0",
        force_update=False,
        download_url="",
        sha256="",
        release_notes="Arrow Restaurant uzaktan güncelleme altyapısı hazırlandı.",
        is_active=True,
        release_status=ReleaseStatus.published,
    )
    yield
    _clear_releases()


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
    _clear_releases()

    r = client.get(
        "/api/public/updates/check",
        params={"app": "unknown", "version": "1.0.0"},
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Update metadata not found"


def test_draft_release_not_visible_on_public_endpoint(client):
    _clear_releases()
    _add_release(
        app_name="arrow-restaurant",
        version="1.0.1",
        channel="stable",
        min_supported_version="1.0.0",
        force_update=False,
        is_active=True,
        release_status=ReleaseStatus.draft,
    )

    r = client.get(
        "/api/public/updates/check",
        params={"app": "arrow-restaurant", "version": "1.0.0"},
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Update metadata not found"


def test_archived_release_not_visible_on_public_endpoint(client):
    _clear_releases()
    _add_release(
        app_name="arrow-restaurant",
        version="1.0.1",
        channel="stable",
        min_supported_version="1.0.0",
        force_update=False,
        is_active=False,
        release_status=ReleaseStatus.archived,
    )

    r = client.get(
        "/api/public/updates/check",
        params={"app": "arrow-restaurant", "version": "1.0.0"},
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Update metadata not found"


def test_published_release_visible_on_public_endpoint(client):
    _clear_releases()
    _add_release(
        app_name="arrow-restaurant",
        version="2.0.0",
        channel="stable",
        min_supported_version="1.0.0",
        force_update=False,
        download_url="https://cdn.example.com/2.0.0.exe",
        sha256="a" * 64,
        release_notes="Published release",
        is_active=True,
        release_status=ReleaseStatus.published,
    )

    r = client.get(
        "/api/public/updates/check",
        params={"app": "arrow-restaurant", "version": "1.0.0"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["latest_version"] == "2.0.0"
    assert body["download_url"] == "https://cdn.example.com/2.0.0.exe"
    assert body["sha256"] == "a" * 64

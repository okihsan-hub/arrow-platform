"""Public update metadata + admin release management (Faz 2A / 2B)."""
from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, UpdateRelease
from app.schemas import UpdateReleaseCreate, UpdateReleaseOut, UpdateReleaseUpdate
from app.security import get_current_admin

_public_updates = APIRouter(tags=["updates"])
_admin_updates = APIRouter(tags=["updates-admin"])

DbSession = Annotated[Session, Depends(get_db)]
AdminAuth = Annotated[AdminUser, Depends(get_current_admin)]


def _active_release(db: Session, app_name: str, channel: str) -> UpdateRelease | None:
    return db.scalar(
        select(UpdateRelease)
        .where(
            UpdateRelease.app_name == app_name,
            UpdateRelease.channel == channel,
            UpdateRelease.is_active.is_(True),
        )
        .order_by(UpdateRelease.updated_at.desc(), UpdateRelease.id.desc())
        .limit(1)
    )


def _deactivate_other_active(
    db: Session,
    app_name: str,
    channel: str,
    *,
    keep_id: int | None = None,
) -> None:
    stmt = select(UpdateRelease).where(
        UpdateRelease.app_name == app_name,
        UpdateRelease.channel == channel,
        UpdateRelease.is_active.is_(True),
    )
    if keep_id is not None:
        stmt = stmt.where(UpdateRelease.id != keep_id)
    for row in db.scalars(stmt):
        row.is_active = False


def _optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _apply_create_fields(release: UpdateRelease, body: UpdateReleaseCreate) -> None:
    release.app_name = body.app_name.strip()
    release.version = body.version.strip()
    release.channel = body.channel.strip() or "stable"
    release.force_update = body.force_update
    release.min_supported_version = body.min_supported_version.strip()
    release.download_url = _optional_text(body.download_url)
    release.sha256 = _optional_text(body.sha256)
    release.release_notes = _optional_text(body.release_notes)
    release.is_active = body.is_active


# --- Public ---


@_public_updates.get("/check")
def check_for_updates(
    db: DbSession,
    app: str = Query(..., description="Uygulama kimliği"),
    version: str = Query(..., description="Mevcut sürüm"),
    channel: str = Query("stable", description="Güncelleme kanalı"),
) -> dict[str, Any]:
    release = _active_release(db, app, channel)
    if release is None:
        raise HTTPException(status_code=404, detail="Update metadata not found")

    latest_version = str(release.version)
    update_available = version != latest_version

    return {
        "app": release.app_name,
        "current_version": version,
        "latest_version": latest_version,
        "min_supported_version": release.min_supported_version,
        "update_available": update_available,
        "force_update": bool(release.force_update),
        "channel": channel,
        "download_url": release.download_url or "",
        "sha256": release.sha256 or "",
        "release_notes": release.release_notes or "",
    }


# --- Admin ---


@_admin_updates.get("/releases", response_model=list[UpdateReleaseOut])
def list_update_releases(
    db: DbSession,
    _: AdminAuth,
) -> list[UpdateReleaseOut]:
    rows = db.scalars(select(UpdateRelease).order_by(UpdateRelease.created_at.desc())).all()
    return list(rows)


@_admin_updates.post("/releases", response_model=UpdateReleaseOut, status_code=status.HTTP_201_CREATED)
def create_update_release(
    body: UpdateReleaseCreate,
    db: DbSession,
    _: AdminAuth,
) -> UpdateReleaseOut:
    release = UpdateRelease()
    _apply_create_fields(release, body)
    if release.is_active:
        _deactivate_other_active(db, release.app_name, release.channel)
    db.add(release)
    db.commit()
    db.refresh(release)
    return release


@_admin_updates.put("/releases/{release_id}", response_model=UpdateReleaseOut)
def update_update_release(
    release_id: int,
    body: UpdateReleaseUpdate,
    db: DbSession,
    _: AdminAuth,
) -> UpdateReleaseOut:
    release = db.get(UpdateRelease, release_id)
    if release is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Release not found")

    data = body.model_dump(exclude_unset=True)
    if "app_name" in data and data["app_name"] is not None:
        release.app_name = data["app_name"].strip()
    if "version" in data and data["version"] is not None:
        release.version = data["version"].strip()
    if "channel" in data and data["channel"] is not None:
        release.channel = data["channel"].strip() or "stable"
    if "force_update" in data and data["force_update"] is not None:
        release.force_update = data["force_update"]
    if "min_supported_version" in data and data["min_supported_version"] is not None:
        release.min_supported_version = data["min_supported_version"].strip()
    if "download_url" in data:
        release.download_url = _optional_text(data["download_url"])
    if "sha256" in data:
        release.sha256 = _optional_text(data["sha256"])
    if "release_notes" in data:
        release.release_notes = _optional_text(data["release_notes"])
    if "is_active" in data and data["is_active"] is not None:
        release.is_active = data["is_active"]

    if release.is_active:
        _deactivate_other_active(db, release.app_name, release.channel, keep_id=release.id)

    db.commit()
    db.refresh(release)
    return release


# main.py imports public_router — include admin routes without touching main.py
public_router = APIRouter()
public_router.include_router(_public_updates, prefix="/public/updates")
public_router.include_router(_admin_updates, prefix="/admin/updates")

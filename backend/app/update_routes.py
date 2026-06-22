"""Public update metadata + admin release management (Faz 2A–3)."""
from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, ReleaseStatus, UpdateRelease, utcnow
from app.schemas import UpdateReleaseCreate, UpdateReleaseOut, UpdateReleaseUpdate
from app.security import get_current_admin

_public_updates = APIRouter(tags=["updates"])
_admin_updates = APIRouter(tags=["updates-admin"])

DbSession = Annotated[Session, Depends(get_db)]
AdminAuth = Annotated[AdminUser, Depends(get_current_admin)]


def _public_release(db: Session, app_name: str, channel: str) -> UpdateRelease | None:
    return db.scalar(
        select(UpdateRelease)
        .where(
            UpdateRelease.app_name == app_name,
            UpdateRelease.channel == channel,
            UpdateRelease.is_active.is_(True),
            UpdateRelease.release_status == ReleaseStatus.published,
        )
        .order_by(UpdateRelease.updated_at.desc(), UpdateRelease.id.desc())
        .limit(1)
    )


def _deactivate_other_published_active(
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
        UpdateRelease.release_status == ReleaseStatus.published,
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


def _get_release_or_404(db: Session, release_id: int) -> UpdateRelease:
    release = db.get(UpdateRelease, release_id)
    if release is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Release not found")
    return release


def _apply_package_fields(release: UpdateRelease, body: UpdateReleaseCreate | UpdateReleaseUpdate) -> None:
    if isinstance(body, UpdateReleaseCreate):
        release.uploaded_file_name = _optional_text(body.uploaded_file_name)
        release.file_size_bytes = body.file_size_bytes
        release.download_url = _optional_text(body.download_url)
        release.sha256 = _normalize_sha256_or_none(body.sha256)
        return

    data = body.model_dump(exclude_unset=True)
    if "uploaded_file_name" in data:
        release.uploaded_file_name = _optional_text(data["uploaded_file_name"])
    if "file_size_bytes" in data:
        release.file_size_bytes = data["file_size_bytes"]
    if "download_url" in data:
        release.download_url = _optional_text(data["download_url"])
    if "sha256" in data:
        release.sha256 = data["sha256"]


def _normalize_sha256_or_none(value: str | None) -> str | None:
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
    release.release_notes = _optional_text(body.release_notes)
    release.release_status = ReleaseStatus.draft
    release.is_active = False
    release.published_at = None
    _apply_package_fields(release, body)


def _apply_update_fields(release: UpdateRelease, body: UpdateReleaseUpdate) -> None:
    if release.release_status == ReleaseStatus.archived:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archived releases cannot be edited; create a new draft instead",
        )

    data = body.model_dump(exclude_unset=True)
    if "release_status" in data and data["release_status"] is not None:
        requested = ReleaseStatus(data["release_status"])
        if requested != ReleaseStatus.draft:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Use publish or archive actions to change release status",
            )
        release.release_status = ReleaseStatus.draft
        release.is_active = False
        release.published_at = None

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
    if "release_notes" in data:
        release.release_notes = _optional_text(data["release_notes"])

    _apply_package_fields(release, body)

    if release.release_status == ReleaseStatus.draft:
        release.is_active = False


# --- Public ---


@_public_updates.get("/check")
def check_for_updates(
    db: DbSession,
    app: str = Query(..., description="Uygulama kimliği"),
    version: str = Query(..., description="Mevcut sürüm"),
    channel: str = Query("stable", description="Güncelleme kanalı"),
) -> dict[str, Any]:
    release = _public_release(db, app, channel)
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
    release = _get_release_or_404(db, release_id)
    _apply_update_fields(release, body)
    db.commit()
    db.refresh(release)
    return release


@_admin_updates.post("/releases/{release_id}/publish", response_model=UpdateReleaseOut)
def publish_update_release(
    release_id: int,
    db: DbSession,
    _: AdminAuth,
) -> UpdateReleaseOut:
    release = _get_release_or_404(db, release_id)
    if release.release_status == ReleaseStatus.archived:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Archived releases cannot be published",
        )

    _deactivate_other_published_active(
        db,
        release.app_name,
        release.channel,
        keep_id=release.id,
    )
    release.release_status = ReleaseStatus.published
    release.is_active = True
    release.published_at = utcnow()
    db.commit()
    db.refresh(release)
    return release


@_admin_updates.post("/releases/{release_id}/archive", response_model=UpdateReleaseOut)
def archive_update_release(
    release_id: int,
    db: DbSession,
    _: AdminAuth,
) -> UpdateReleaseOut:
    release = _get_release_or_404(db, release_id)
    release.release_status = ReleaseStatus.archived
    release.is_active = False
    db.commit()
    db.refresh(release)
    return release


# main.py imports public_router — include admin routes without touching main.py
public_router = APIRouter()
public_router.include_router(_public_updates, prefix="/public/updates")
public_router.include_router(_admin_updates, prefix="/admin/updates")

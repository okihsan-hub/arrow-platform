"""Public update metadata — Faz 2A (veritabanından aktif release)."""
from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UpdateRelease

public_router = APIRouter(prefix="/public/updates", tags=["updates"])

DbSession = Annotated[Session, Depends(get_db)]


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


@public_router.get("/check")
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

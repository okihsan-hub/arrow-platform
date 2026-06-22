"""Public update metadata — Faz 1 (sabit metadata)."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query

public_router = APIRouter(prefix="/public/updates", tags=["updates"])

_UPDATE_METADATA: dict[str, Any] = {
    "app": "arrow-restaurant",
    "latest_version": "1.0.1",
    "min_supported_version": "1.0.0",
    "channel": "stable",
    "force_update": False,
    "download_url": "",
    "sha256": "",
    "release_notes": "Arrow Restaurant uzaktan güncelleme altyapısı hazırlandı.",
}


@public_router.get("/check")
def check_for_updates(
    app: str = Query(..., description="Uygulama kimliği"),
    version: str = Query(..., description="Mevcut sürüm"),
    channel: str = Query("stable", description="Güncelleme kanalı"),
) -> dict[str, Any]:
    if app != _UPDATE_METADATA["app"]:
        raise HTTPException(status_code=404, detail="Update metadata not found")

    latest_version = str(_UPDATE_METADATA["latest_version"])
    update_available = version != latest_version

    return {
        "app": _UPDATE_METADATA["app"],
        "current_version": version,
        "latest_version": latest_version,
        "min_supported_version": _UPDATE_METADATA["min_supported_version"],
        "update_available": update_available,
        "force_update": _UPDATE_METADATA["force_update"],
        "channel": channel,
        "download_url": _UPDATE_METADATA["download_url"],
        "sha256": _UPDATE_METADATA["sha256"],
        "release_notes": _UPDATE_METADATA["release_notes"],
    }

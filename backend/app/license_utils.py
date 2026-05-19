from __future__ import annotations

import secrets
import string
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import License, LicenseDevice, LicensePlan, LicenseStatus


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def ensure_aware(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def generate_license_key() -> str:
    alphabet = string.ascii_uppercase + string.digits
    parts = ["".join(secrets.choice(alphabet) for _ in range(4)) for _ in range(4)]
    return "AR-" + "-".join(parts)


def ensure_unique_license_key(db: Session, max_attempts: int = 20) -> str:
    for _ in range(max_attempts):
        key = generate_license_key()
        exists = db.scalar(select(License.id).where(License.license_key == key))
        if not exists:
            return key
    raise RuntimeError("Could not generate unique license key")


def demo_expiry(starts_at: datetime) -> datetime:
    days = get_settings().demo_license_days
    return starts_at + timedelta(days=days)


def count_active_devices(db: Session, license_id: int) -> int:
    return int(
        db.scalar(
            select(func.count())
            .select_from(LicenseDevice)
            .where(LicenseDevice.license_id == license_id, LicenseDevice.is_active.is_(True))
        )
        or 0
    )


def sync_license_expired_status(license_row: License, *, now: datetime | None = None) -> LicenseStatus:
    now = ensure_aware(now or utcnow())
    expires = ensure_aware(license_row.expires_at)
    if license_row.status in (LicenseStatus.cancelled, LicenseStatus.suspended):
        return license_row.status
    if expires <= now:
        license_row.status = LicenseStatus.expired
        return LicenseStatus.expired
    if license_row.status == LicenseStatus.expired and expires > now:
        license_row.status = LicenseStatus.active
    return license_row.status


def days_left(expires_at: datetime, *, now: datetime | None = None) -> int:
    now = ensure_aware(now or utcnow())
    delta = ensure_aware(expires_at) - now
    return max(0, delta.days)


def normalize_features(features) -> dict | list | None:
    if features is None:
        return {}
    return features

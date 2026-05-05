from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.license import License, LicenseStatus, generate_license_key


def create_license(
    db: Session,
    *,
    customer_id: int,
    reseller_id: int | None,
    product_name: str,
    starts_at,
    expires_at,
    max_devices: int,
) -> License:
    # retry a few times in the extremely unlikely case of key collision
    for _ in range(5):
        lic = License(
            customer_id=customer_id,
            reseller_id=reseller_id,
            product_name=product_name,
            license_key=generate_license_key(),
            status=LicenseStatus.active,
            starts_at=starts_at,
            expires_at=expires_at,
            max_devices=max_devices,
            bound_devices={},
        )
        db.add(lic)
        try:
            db.commit()
            db.refresh(lic)
            return lic
        except IntegrityError:
            db.rollback()
            continue
    raise RuntimeError("Failed to generate unique license key")


def list_licenses(db: Session) -> list[License]:
    return list(db.scalars(select(License).order_by(License.id.desc())).all())


def get_license(db: Session, license_id: int) -> License | None:
    return db.get(License, license_id)


def set_license_status(db: Session, license_id: int, status: LicenseStatus) -> License | None:
    lic = db.get(License, license_id)
    if not lic:
        return None
    lic.status = status
    db.add(lic)
    db.commit()
    db.refresh(lic)
    return lic


def reset_license_devices(db: Session, license_id: int) -> License | None:
    lic = db.get(License, license_id)
    if not lic:
        return None
    lic.bound_devices = {}
    db.add(lic)
    db.commit()
    db.refresh(lic)
    return lic


def list_customer_licenses(db: Session, customer_id: int) -> list[License]:
    return list(db.scalars(select(License).where(License.customer_id == customer_id).order_by(License.id.desc())).all())


def get_license_by_key(db: Session, license_key: str) -> License | None:
    return db.scalar(select(License).where(License.license_key == license_key))


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)

def _normalize_platform(raw: str | None) -> str | None:
    if not raw:
        return None
    s = raw.lower()
    if "android" in s:
        return "android"
    if "windows" in s:
        return "windows"
    return None


def _device_count(lic: License) -> int:
    devices = lic.bound_devices or {}
    if not isinstance(devices, dict):
        return 0
    return len(devices)


def validate_license_for_device(db: Session, *, license_key: str, device_id: str) -> tuple[bool, str | None, License | None]:
    lic = get_license_by_key(db, license_key)
    if not lic:
        return False, "license_not_found", None
    if lic.status != LicenseStatus.active:
        return False, "license_not_active", lic
    if lic.expires_at <= _utc_now():
        return False, "license_expired", lic

    devices = lic.bound_devices or {}
    if isinstance(devices, dict) and device_id in devices:
        return True, None, lic

    if _device_count(lic) >= lic.max_devices:
        return False, "device_limit_exceeded", lic

    return True, None, lic


def validate_license_strict(db: Session, *, license_key: str, device_id: str) -> tuple[bool, str | None, License | None]:
    """
    Strict validation: device must already be activated (bound) to be valid.
    Does NOT allow "valid but unbound" even when there's remaining device capacity.
    """
    lic = get_license_by_key(db, license_key)
    if not lic:
        return False, "license_not_found", None
    if lic.status != LicenseStatus.active:
        return False, "license_not_active", lic
    if lic.expires_at <= _utc_now():
        return False, "license_expired", lic

    devices = lic.bound_devices or {}
    if isinstance(devices, dict) and device_id in devices:
        return True, None, lic

    return False, "device_not_activated", lic


def activate_license(
    db: Session,
    *,
    license_key: str,
    device_id: str,
    device_name: str,
    app_version: str,
    ip: str | None = None,
    platform: str | None = None,
) -> tuple[bool, str | None, License | None]:
    ok, reason, lic = validate_license_for_device(db, license_key=license_key, device_id=device_id)
    if not ok or not lic:
        return ok, reason, lic

    now = _utc_now()
    platform_norm = _normalize_platform(platform)
    devices = lic.bound_devices or {}
    if not isinstance(devices, dict):
        devices = {}

    entry = devices.get(device_id)
    if isinstance(entry, dict):
        entry.setdefault("first_seen_at", now.isoformat())
        entry["device_name"] = device_name
        entry["app_version"] = app_version
        entry["last_seen_at"] = now.isoformat()
        entry.setdefault("ip", ip)
        entry.setdefault("platform", platform_norm)
        if ip:
            entry["ip"] = ip
        if platform_norm:
            entry["platform"] = platform_norm
        devices[device_id] = entry
    else:
        devices[device_id] = {
            "device_name": device_name,
            "ip": ip,
            "platform": platform_norm,
            "app_version": app_version,
            "first_seen_at": now.isoformat(),
            "last_seen_at": now.isoformat(),
        }

    lic.bound_devices = devices
    db.add(lic)
    db.commit()
    db.refresh(lic)
    return True, None, lic


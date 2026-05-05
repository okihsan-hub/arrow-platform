from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.license_event import LicenseEvent, LicenseEventType


def mask_license_key(license_key: str) -> str:
    """
    Mask everything except last 4 chars (keep format readable).
    Example: AR-ABCD-...-WXYZ -> ************WXYZ
    """
    k = (license_key or "").strip()
    if len(k) <= 4:
        return "*" * len(k)
    return ("*" * (len(k) - 4)) + k[-4:]


def log_license_event(
    db: Session,
    *,
    event_type: LicenseEventType,
    license_key: str,
    device_id: str,
    ip: str | None,
    success: bool,
    reason: str | None = None,
) -> None:
    """
    Best-effort logging: failures should never break API flow.
    """
    try:
        ev = LicenseEvent(
            event_type=event_type,
            license_key_masked=mask_license_key(license_key),
            device_id=device_id,
            ip=ip,
            success=success,
            reason=reason,
        )
        db.add(ev)
        db.commit()
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass


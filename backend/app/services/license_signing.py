from __future__ import annotations

import hmac
import hashlib
from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.activation_nonce import ActivationNonce


_NONCE_TTL = timedelta(minutes=5)
_TIMESTAMP_SKEW_SECONDS = 60

# Temporary rollout: omit `X-Signature` entirely to skip HMAC/timestamp/nonce checks on activate.
# Set to False to require signing for every activation request again.
SIGNATURE_OPTIONAL_UNTIL_CLIENTS_UPDATED = True


def activation_signing_should_verify(signature: str | None) -> bool:
    """
    When this returns False, callers should skip verify_activation_request_or_reason and
    rely on license business rules only (exists, active, not expired, device limit).
    """
    if not SIGNATURE_OPTIONAL_UNTIL_CLIENTS_UPDATED:
        return True
    return bool((signature or "").strip())


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_timestamp(ts: str) -> int | None:
    try:
        return int(ts)
    except (TypeError, ValueError):
        return None


def _expected_signature(secret_key: str, *, license_key: str, device_id: str, timestamp: str, nonce: str) -> str:
    msg = f"{license_key}{device_id}{timestamp}{nonce}".encode("utf-8")
    mac = hmac.new(secret_key.encode("utf-8"), msg, hashlib.sha256).hexdigest()
    return mac


def _consume_nonce(db: Session, nonce: str) -> bool:
    """
    Insert nonce with a unique constraint. If it already exists, treat as replay.
    """
    now = _utc_now()
    record = ActivationNonce(nonce=nonce, expires_at=now + _NONCE_TTL)
    db.add(record)
    try:
        db.commit()
        return True
    except IntegrityError:
        db.rollback()
        return False


def verify_activation_request_or_reason(
    db: Session,
    *,
    license_key: str,
    device_id: str,
    timestamp: str | None,
    nonce: str | None,
    signature: str | None,
) -> str | None:
    """
    Returns None when OK, otherwise returns a reason string.
    Spec-required reason for signature failures: "invalid_signature".
    """
    settings = get_settings()
    secret = settings.license_signing_secret
    if not secret:
        # If not configured, fail closed for production safety.
        return "invalid_signature"

    if not timestamp or not nonce or not signature:
        return "invalid_signature"

    ts_int = _parse_timestamp(timestamp)
    if ts_int is None:
        return "invalid_signature"

    now_ts = int(_utc_now().timestamp())
    if abs(now_ts - ts_int) > _TIMESTAMP_SKEW_SECONDS:
        return "invalid_signature"

    expected = _expected_signature(secret, license_key=license_key, device_id=device_id, timestamp=timestamp, nonce=nonce)
    if not hmac.compare_digest(expected, signature):
        return "invalid_signature"

    if not _consume_nonce(db, nonce):
        return "invalid_signature"

    return None


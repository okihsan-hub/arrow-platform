from __future__ import annotations

import calendar
import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.license_utils import ensure_aware, utcnow
from app.models import License, LicenseDevice

logger = logging.getLogger(__name__)

VALID_PERIODS = frozenset({"1_month", "3_months", "6_months", "1_year"})

PERIOD_LABELS = {
    "1_month": "1 ay",
    "3_months": "3 ay",
    "6_months": "6 ay",
    "1_year": "1 yıl",
}


def mask_license_key(license_key: str | None) -> str:
    key = str(license_key or "").strip().upper()
    if not key:
        return ""
    if len(key) <= 8:
        return "****"
    return f"{key[:4]}****{key[-4:]}"


def compute_external_id(record: dict[str, Any]) -> str:
    if rid := str(record.get("request_id") or "").strip():
        return rid[:64]
    parts = [
        str(record.get("created_at") or ""),
        str(record.get("license_key") or "").strip().upper(),
        str(record.get("license_key_masked") or "").strip().upper(),
        str(record.get("requested_period") or ""),
        str(record.get("contact_phone") or ""),
        str(record.get("note") or ""),
        str(record.get("device_id") or ""),
    ]
    digest = hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()
    return digest[:32]


def parse_created_at(value: str | None) -> datetime:
    raw = str(value or "").strip()
    if not raw:
        return utcnow()
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return ensure_aware(dt)
    except ValueError:
        return utcnow()


def add_calendar_months(dt: datetime, months: int) -> datetime:
    dt = ensure_aware(dt)
    month_index = dt.month - 1 + months
    year = dt.year + month_index // 12
    month = month_index % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    day = min(dt.day, last_day)
    return dt.replace(year=year, month=month, day=day, microsecond=0)


def extend_expires_for_period(expires_at: datetime, period: str, *, now: datetime | None = None) -> datetime:
    if period not in VALID_PERIODS:
        raise ValueError(f"Geçersiz süre: {period}")
    now = ensure_aware(now or utcnow())
    base = ensure_aware(expires_at)
    if base <= now:
        base = now
    if period == "1_month":
        return add_calendar_months(base, 1)
    if period == "3_months":
        return add_calendar_months(base, 3)
    if period == "6_months":
        return add_calendar_months(base, 6)
    return add_calendar_months(base, 12)


def _masked_prefix_suffix(masked: str) -> tuple[str, str] | None:
    m = str(masked or "").strip().upper()
    if "****" not in m:
        return None
    left, right = m.split("****", 1)
    if len(left) < 4 or len(right) < 4:
        return None
    return left[:4], right[-4:]


def _license_company_name(lic: License) -> str:
    try:
        customer = lic.customer
        if customer is None:
            return ""
        return str(customer.company_name or "").strip()
    except Exception:
        return ""


def find_license_by_device_id(db: Session, device_id: str | None) -> License | None:
    dev_id = str(device_id or "").strip()
    if not dev_id:
        return None
    try:
        dev = db.scalar(
            select(LicenseDevice)
            .where(LicenseDevice.device_id == dev_id, LicenseDevice.is_active.is_(True))
            .order_by(LicenseDevice.last_seen_at.desc(), LicenseDevice.id.desc())
            .limit(1)
        )
        if dev is None:
            return None
        lic = db.get(License, dev.license_id)
        if lic is None:
            return None
        logger.info(
            "[RENEW REQUEST] matched license by device_id=%s license_id=%s",
            dev_id[:12],
            lic.id,
        )
        return lic
    except Exception as exc:
        logger.warning("[RENEW REQUEST] device lookup failed device_id=%s err=%s", dev_id[:12], exc)
        return None


def find_license_for_request(
    db: Session,
    *,
    license_key: str | None,
    license_key_masked: str | None,
    customer_name: str | None,
    device_id: str | None = None,
) -> License | None:
    try:
        key = str(license_key or "").strip().upper()
        if key:
            lic = db.scalar(select(License).where(License.license_key == key))
            if lic:
                return lic

        parts = _masked_prefix_suffix(license_key_masked or "")
        if not parts:
            return find_license_by_device_id(db, device_id)
        prefix, suffix = parts
        candidates = list(
            db.scalars(
                select(License)
                .options(joinedload(License.customer))
                .where(License.license_key.like(f"{prefix}%"))
                .order_by(License.id.desc())
            ).all()
        )
        company = str(customer_name or "").strip().casefold()
        matched: list[License] = []
        masked_upper = str(license_key_masked or "").strip().upper()
        for lic in candidates:
            lic_key = str(lic.license_key or "").strip().upper()
            if not lic_key.endswith(suffix):
                continue
            if mask_license_key(lic_key) != masked_upper:
                continue
            matched.append(lic)

        if not matched:
            return find_license_by_device_id(db, device_id)
        if len(matched) == 1:
            return matched[0]
        if company:
            for lic in matched:
                if _license_company_name(lic).casefold() == company:
                    return lic
        by_device = find_license_by_device_id(db, device_id)
        if by_device is not None and by_device in matched:
            return by_device
        logger.warning(
            "[RENEW REQUEST] ambiguous license match count=%s masked=%s",
            len(matched),
            license_key_masked,
        )
        return matched[0]
    except Exception as exc:
        logger.warning(
            "[RENEW REQUEST] license lookup failed masked=%s device_id=%s err=%s",
            license_key_masked,
            str(device_id or "")[:12] or "-",
            exc,
        )
        return find_license_by_device_id(db, device_id)


def parse_jsonl_line(line: str) -> dict[str, Any] | None:
    raw = line.strip()
    if not raw:
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("[RENEW IMPORT] invalid json line prefix=%s", raw[:40])
        return None
    if not isinstance(data, dict):
        return None
    return data

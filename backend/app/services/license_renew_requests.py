from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.license_renew_utils import (
    PERIOD_LABELS,
    VALID_PERIODS,
    compute_external_id,
    extend_expires_for_period,
    find_license_for_request,
    mask_license_key,
    parse_created_at,
    parse_jsonl_line,
)
from app.license_utils import sync_license_expired_status, utcnow
from app.models import (
    AdminUser,
    License,
    LicenseRenewRequest,
    LicenseRenewRequestStatus,
    LicenseStatus,
    utcnow as model_utcnow,
)

logger = logging.getLogger(__name__)


def default_jsonl_path() -> Path | None:
    settings = get_settings()
    if settings.license_renew_jsonl_path:
        return Path(settings.license_renew_jsonl_path)
    candidates = [
        Path(__file__).resolve().parents[3] / "arrowrestaurant" / "backend" / "data" / "license_renew_requests.jsonl",
        Path("C:/arrowrestaurant/backend/data/license_renew_requests.jsonl"),
    ]
    for p in candidates:
        if p.is_file():
            return p
    return None


def sync_from_jsonl(db: Session, *, path: Path | None = None) -> dict[str, int]:
    file_path = path or default_jsonl_path()
    if file_path is None or not file_path.is_file():
        return {"imported": 0, "skipped": 0, "errors": 0}

    imported = skipped = errors = 0
    with file_path.open(encoding="utf-8") as fh:
        for line in fh:
            record = parse_jsonl_line(line)
            if not record:
                if line.strip():
                    errors += 1
                continue
            period = str(record.get("requested_period") or "").strip()
            if period not in VALID_PERIODS:
                errors += 1
                continue
            external_id = compute_external_id(record)
            exists = db.scalar(
                select(LicenseRenewRequest.id).where(LicenseRenewRequest.external_id == external_id)
            )
            if exists:
                skipped += 1
                continue

            license_key = str(record.get("license_key") or "").strip().upper() or None
            masked = str(record.get("license_key_masked") or "").strip() or None
            if license_key and not masked:
                masked = mask_license_key(license_key)

            lic = find_license_for_request(
                db,
                license_key=license_key,
                license_key_masked=masked,
                customer_name=record.get("customer_name"),
                device_id=str(record.get("device_id") or "").strip() or None,
            )

            row = LicenseRenewRequest(
                external_id=external_id,
                status=LicenseRenewRequestStatus.pending,
                created_at=parse_created_at(record.get("created_at")),
                requested_period=period,
                requested_period_label=record.get("requested_period_label"),
                note=str(record.get("note") or "").strip() or None,
                contact_phone=str(record.get("contact_phone") or "").strip() or None,
                license_key_masked=masked,
                license_key=license_key,
                license_id=lic.id if lic else None,
                customer_name=str(record.get("customer_name") or "").strip() or None,
                device_name=str(record.get("device_name") or "").strip() or None,
                device_id=str(record.get("device_id") or "").strip() or None,
                client_license_status=str(record.get("status") or "").strip() or None,
                plan=str(record.get("plan") or "").strip() or None,
            )
            db.add(row)
            imported += 1

    if imported:
        db.commit()
    logger.info(
        "[RENEW IMPORT] path=%s imported=%s skipped=%s errors=%s",
        file_path,
        imported,
        skipped,
        errors,
    )
    return {"imported": imported, "skipped": skipped, "errors": errors}


def _status_rank(status: LicenseRenewRequestStatus) -> int:
    if status == LicenseRenewRequestStatus.pending:
        return 0
    return 1


def _link_renew_request_to_license(
    db: Session,
    req: LicenseRenewRequest,
    *,
    license_key: str | None = None,
    license_key_masked: str | None = None,
    customer_name: str | None = None,
    device_id: str | None = None,
) -> License | None:
    try:
        lic: License | None = None
        if req.license_id:
            lic = db.get(License, req.license_id)
        if lic is None:
            key = license_key if license_key is not None else req.license_key
            masked = license_key_masked if license_key_masked is not None else req.license_key_masked
            company = customer_name if customer_name is not None else req.customer_name
            dev_id = device_id if device_id is not None else req.device_id
            lic = find_license_for_request(
                db,
                license_key=key,
                license_key_masked=masked,
                customer_name=company,
                device_id=dev_id,
            )
        if lic is None:
            return None
        req.license_id = lic.id
        if not str(req.license_key or "").strip():
            req.license_key = lic.license_key
        if not str(req.license_key_masked or "").strip():
            req.license_key_masked = mask_license_key(lic.license_key)
        db.add(req)
        return lic
    except Exception as exc:
        logger.warning("[RENEW PUBLIC] license link skipped request=%s err=%s", req.external_id[:12], exc)
        return None


def _period_label(data: dict[str, Any], period: str) -> str:
    explicit = str(data.get("requested_period_label") or "").strip()
    if explicit:
        return explicit
    return PERIOD_LABELS.get(period, period)


def _try_find_license_for_public(db: Session, data: dict[str, Any]) -> License | None:
    license_key = str(data.get("license_key") or "").strip().upper() or None
    masked = str(data.get("license_key_masked") or "").strip() or None
    if license_key and not masked:
        masked = mask_license_key(license_key)
    try:
        return find_license_for_request(
            db,
            license_key=license_key,
            license_key_masked=masked,
            customer_name=data.get("customer_name"),
            device_id=str(data.get("device_id") or "").strip() or None,
        )
    except Exception as exc:
        logger.warning(
            "[RENEW PUBLIC] license lookup skipped external_id=%s err=%s",
            str(data.get("external_id") or "")[:12],
            exc,
        )
        return None


def create_renew_request_public(db: Session, data: dict[str, Any]) -> tuple[LicenseRenewRequest, bool]:
    """POS/restaurant süre uzatma talebi — external_id ile idempotent."""
    period = str(data.get("requested_period") or "").strip()
    if period not in VALID_PERIODS:
        raise ValueError("invalid_requested_period")

    external_id = str(data.get("external_id") or "").strip() or compute_external_id(data)
    external_id = external_id[:64]

    existing = db.scalar(
        select(LicenseRenewRequest).where(LicenseRenewRequest.external_id == external_id)
    )
    if existing is not None:
        _link_renew_request_to_license(
            db,
            existing,
            license_key=str(data.get("license_key") or "").strip().upper() or None,
            license_key_masked=str(data.get("license_key_masked") or "").strip() or None,
            customer_name=data.get("customer_name"),
            device_id=str(data.get("device_id") or "").strip() or None,
        )
        try:
            db.commit()
            db.refresh(existing)
        except Exception as exc:
            db.rollback()
            logger.exception("[RENEW PUBLIC] idempotent commit failed external_id=%s", external_id[:12])
            raise exc
        return existing, False

    license_key = str(data.get("license_key") or "").strip().upper() or None
    masked = str(data.get("license_key_masked") or "").strip() or None
    if license_key and not masked:
        masked = mask_license_key(license_key)

    lic = _try_find_license_for_public(db, data)

    row = LicenseRenewRequest(
        external_id=external_id,
        status=LicenseRenewRequestStatus.pending,
        created_at=parse_created_at(data.get("created_at")),
        requested_period=period,
        requested_period_label=_period_label(data, period),
        note=str(data.get("note") or "").strip() or None,
        contact_phone=str(data.get("contact_phone") or "").strip() or None,
        license_key_masked=masked,
        license_key=license_key,
        license_id=lic.id if lic else None,
        customer_name=str(data.get("customer_name") or "").strip() or None,
        device_name=str(data.get("device_name") or "").strip() or None,
        device_id=str(data.get("device_id") or "").strip() or None,
        client_license_status=str(data.get("client_license_status") or data.get("status") or "").strip()
        or None,
        plan=str(data.get("plan") or "").strip() or None,
    )
    _link_renew_request_to_license(
        db,
        row,
        license_key=license_key,
        license_key_masked=masked,
        customer_name=data.get("customer_name"),
        device_id=str(data.get("device_id") or "").strip() or None,
    )
    db.add(row)
    try:
        db.commit()
        db.refresh(row)
    except Exception as exc:
        db.rollback()
        logger.exception("[RENEW PUBLIC] create commit failed external_id=%s", external_id[:12])
        raise exc
    logger.info(
        "[RENEW PUBLIC] created id=%s external_id=%s period=%s customer=%s",
        row.id,
        row.external_id[:12],
        row.requested_period,
        row.customer_name or "-",
    )
    return row, True


def list_renew_requests(
    db: Session,
    *,
    status_filter: str | None = None,
) -> list[LicenseRenewRequest]:
    sync_from_jsonl(db)
    q = select(LicenseRenewRequest).options(
        joinedload(LicenseRenewRequest.license).joinedload(License.customer)
    )
    if status_filter and status_filter != "all":
        try:
            st = LicenseRenewRequestStatus(status_filter)
        except ValueError:
            st = None
        if st:
            q = q.where(LicenseRenewRequest.status == st)
    rows = list(db.scalars(q).all())
    rows.sort(
        key=lambda r: (
            _status_rank(r.status),
            -int(r.created_at.timestamp()) if r.created_at else 0,
        )
    )
    return rows


def get_renew_request(db: Session, request_id: int) -> LicenseRenewRequest | None:
    sync_from_jsonl(db)
    return db.scalar(
        select(LicenseRenewRequest)
        .options(joinedload(LicenseRenewRequest.license).joinedload(License.customer))
        .where(LicenseRenewRequest.id == request_id)
    )


def _resolve_license(db: Session, req: LicenseRenewRequest) -> License | None:
    if req.license_id:
        lic = db.get(License, req.license_id)
        if lic:
            return lic
    return find_license_for_request(
        db,
        license_key=req.license_key,
        license_key_masked=req.license_key_masked,
        customer_name=req.customer_name,
        device_id=req.device_id,
    )


def approve_renew_request(
    db: Session,
    request_id: int,
    admin: AdminUser,
) -> LicenseRenewRequest:
    req = get_renew_request(db, request_id)
    if req is None:
        raise LookupError("request_not_found")
    if req.status != LicenseRenewRequestStatus.pending:
        raise ValueError("request_not_pending")

    lic = _resolve_license(db, req)
    if lic is None:
        lic = _link_renew_request_to_license(db, req)
        if lic is not None:
            db.commit()
            db.refresh(req)
    if lic is None:
        raise LookupError("license_not_found")
    if lic.status == LicenseStatus.cancelled:
        raise ValueError("license_cancelled")

    now = utcnow()
    try:
        new_expires = extend_expires_for_period(lic.expires_at, req.requested_period, now=now)
        lic.expires_at = new_expires
        if lic.expires_at > now and lic.status in (LicenseStatus.expired, LicenseStatus.suspended):
            lic.status = LicenseStatus.active
        sync_license_expired_status(lic)
        lic.updated_at = model_utcnow()

        req.status = LicenseRenewRequestStatus.approved
        req.license_id = lic.id
        req.license_key = lic.license_key
        req.processed_at = model_utcnow()
        req.processed_by_admin_id = admin.id
        db.add(lic)
        db.add(req)
        db.commit()
        db.refresh(req)
        db.refresh(lic)
    except Exception:
        db.rollback()
        raise

    logger.info(
        "[RENEW APPROVE] request_id=%s license_id=%s period=%s masked=%s",
        req.id,
        lic.id,
        req.requested_period,
        mask_license_key(lic.license_key),
    )
    return req


def reject_renew_request(
    db: Session,
    request_id: int,
    admin: AdminUser,
) -> LicenseRenewRequest:
    req = get_renew_request(db, request_id)
    if req is None:
        raise LookupError("request_not_found")
    if req.status != LicenseRenewRequestStatus.pending:
        raise ValueError("request_not_pending")

    req.status = LicenseRenewRequestStatus.rejected
    req.processed_at = model_utcnow()
    req.processed_by_admin_id = admin.id
    db.add(req)
    db.commit()
    db.refresh(req)
    logger.info("[RENEW REJECT] request_id=%s", req.id)
    return req

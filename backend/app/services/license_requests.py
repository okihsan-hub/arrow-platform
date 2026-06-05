from __future__ import annotations

import logging
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.license_request_utils import ensure_unique_request_code
from app.license_utils import demo_expiry, ensure_unique_license_key, utcnow
from app.models import (
    AdminUser,
    Customer,
    DeploymentMode,
    License,
    LicensePlan,
    LicenseRequest,
    LicenseRequestStatus,
    LicenseStatus,
    utcnow as model_utcnow,
)

logger = logging.getLogger(__name__)

VALID_PLANS = frozenset(p.value for p in LicensePlan)


def _status_rank(status: LicenseRequestStatus) -> int:
    if status == LicenseRequestStatus.pending:
        return 0
    return 1


def _normalize_email(email: str) -> str:
    return email.strip().casefold()


def find_existing_customer(db: Session, *, email: str, tax_number: str | None) -> Customer | None:
    tax = str(tax_number or "").strip()
    if tax:
        row = db.scalar(select(Customer).where(Customer.tax_number == tax))
        if row:
            return row
    em = _normalize_email(email)
    if em:
        candidates = list(db.scalars(select(Customer).where(Customer.email.is_not(None))).all())
        for row in candidates:
            if row.email and _normalize_email(row.email) == em:
                return row
    return None


def create_license_request(db: Session, data: dict) -> LicenseRequest:
    plan_raw = data.get("requested_plan")
    plan_str: str | None = None
    if plan_raw is not None:
        if hasattr(plan_raw, "value"):
            plan_str = str(plan_raw.value).strip().lower()
        else:
            plan_str = str(plan_raw).strip().lower()
        if plan_str and plan_str not in VALID_PLANS:
            raise ValueError("invalid_requested_plan")

    deployment = DeploymentMode(str(data["deployment_mode"]).strip().lower())
    now = model_utcnow()
    row = LicenseRequest(
        request_code=ensure_unique_request_code(db),
        status=LicenseRequestStatus.pending,
        company_name=str(data["company_name"]).strip(),
        contact_name=str(data["contact_name"]).strip(),
        contact_position=str(data.get("contact_position") or "").strip() or None,
        email=str(data["email"]).strip(),
        phone=str(data["phone"]).strip(),
        tax_number=str(data.get("tax_number") or "").strip() or None,
        machine_code=str(data["machine_code"]).strip(),
        device_name=str(data["device_name"]).strip(),
        app_version=str(data["app_version"]).strip(),
        deployment_mode=deployment,
        requested_plan=plan_str,
        notes=str(data.get("notes") or "").strip() or None,
        created_at=now,
        updated_at=now,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    logger.info("[LICENSE REQUEST] created code=%s company=%s", row.request_code, row.company_name)
    return row


def get_request_by_code(db: Session, request_code: str) -> LicenseRequest | None:
    code = request_code.strip().upper()
    return db.scalar(select(LicenseRequest).where(LicenseRequest.request_code == code))


def get_request_status(
    db: Session,
    *,
    request_code: str,
    machine_code: str,
) -> tuple[LicenseRequest | None, str | None]:
    req = get_request_by_code(db, request_code)
    if req is None:
        return None, "request_not_found"
    if req.machine_code.strip() != machine_code.strip():
        return None, "machine_code_mismatch"
    return req, None


def list_license_requests(
    db: Session,
    *,
    status_filter: str | None = None,
) -> list[LicenseRequest]:
    q = select(LicenseRequest).options(joinedload(LicenseRequest.customer))
    if status_filter and status_filter != "all":
        try:
            st = LicenseRequestStatus(status_filter)
            q = q.where(LicenseRequest.status == st)
        except ValueError:
            pass
    rows = list(db.scalars(q).all())
    rows.sort(
        key=lambda r: (
            _status_rank(r.status),
            -int(r.created_at.timestamp()) if r.created_at else 0,
        )
    )
    return rows


def get_license_request(db: Session, request_id: int) -> LicenseRequest | None:
    return db.scalar(
        select(LicenseRequest)
        .options(joinedload(LicenseRequest.customer))
        .where(LicenseRequest.id == request_id)
    )


def _resolve_plan(requested: str | None) -> LicensePlan:
    if requested:
        try:
            return LicensePlan(requested.strip().lower())
        except ValueError:
            pass
    return LicensePlan.demo


def approve_license_request(
    db: Session,
    request_id: int,
    admin: AdminUser,
) -> LicenseRequest:
    req = get_license_request(db, request_id)
    if req is None:
        raise LookupError("request_not_found")
    if req.status != LicenseRequestStatus.pending:
        raise ValueError("request_not_pending")

    customer = find_existing_customer(db, email=req.email, tax_number=req.tax_number)
    if customer is None:
        customer = Customer(
            company_name=req.company_name,
            contact_name=req.contact_name,
            email=req.email,
            phone=req.phone,
            tax_number=req.tax_number,
            notes=req.notes,
        )
        db.add(customer)
        db.flush()
    else:
        if not customer.contact_name and req.contact_name:
            customer.contact_name = req.contact_name
        if not customer.phone and req.phone:
            customer.phone = req.phone
        customer.updated_at = model_utcnow()

    plan = _resolve_plan(req.requested_plan)
    starts = utcnow()
    if plan == LicensePlan.demo:
        expires = demo_expiry(starts)
    else:
        expires = starts + timedelta(days=365)

    key = ensure_unique_license_key(db)
    lic = License(
        license_key=key,
        customer_id=customer.id,
        plan=plan,
        status=LicenseStatus.active,
        starts_at=starts,
        expires_at=expires,
        max_devices=1,
        features={},
    )
    db.add(lic)
    db.flush()

    now = model_utcnow()
    req.status = LicenseRequestStatus.approved
    req.license_key = key
    req.customer_id = customer.id
    req.reviewed_at = now
    req.reviewed_by_admin_id = admin.id
    req.updated_at = now
    db.add(req)
    db.commit()
    db.refresh(req)

    logger.info(
        "[LICENSE REQUEST APPROVE] id=%s code=%s license=%s customer_id=%s",
        req.id,
        req.request_code,
        key,
        customer.id,
    )
    return req


def reject_license_request(
    db: Session,
    request_id: int,
    admin: AdminUser,
    *,
    rejection_reason: str,
) -> LicenseRequest:
    reason = str(rejection_reason or "").strip()
    if not reason:
        raise ValueError("rejection_reason_required")

    req = get_license_request(db, request_id)
    if req is None:
        raise LookupError("request_not_found")
    if req.status != LicenseRequestStatus.pending:
        raise ValueError("request_not_pending")

    now = model_utcnow()
    req.status = LicenseRequestStatus.rejected
    req.rejection_reason = reason
    req.reviewed_at = now
    req.reviewed_by_admin_id = admin.id
    req.updated_at = now
    db.add(req)
    db.commit()
    db.refresh(req)
    logger.info("[LICENSE REQUEST REJECT] id=%s code=%s", req.id, req.request_code)
    return req


def count_pending_requests(db: Session) -> int:
    return int(
        db.scalar(
            select(func.count())
            .select_from(LicenseRequest)
            .where(LicenseRequest.status == LicenseRequestStatus.pending)
        )
        or 0
    )

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.license_utils import (
    count_active_devices,
    days_left,
    demo_expiry,
    ensure_unique_license_key,
    normalize_features,
    sync_license_expired_status,
    utcnow,
)
from app.models import (
    AdminUser,
    Customer,
    License,
    LicenseDevice,
    LicensePlan,
    LicenseStatus,
    utcnow as model_utcnow,
)
from app.schemas import (
    CustomerCreate,
    CustomerOut,
    CustomerUpdate,
    DeviceActivateRequest,
    DeviceValidateRequest,
    LicenseCreate,
    LicenseDetailOut,
    LicenseDeviceOut,
    LicenseOut,
    LicenseRenew,
    LicenseUpdate,
    LicenseValidateResponse,
    MessageOut,
)
from app.security import get_current_admin

customer_router = APIRouter(prefix="/customers", tags=["customers"])
admin_router = APIRouter(prefix="/licenses", tags=["licenses"])
devices_router = APIRouter(prefix="/devices", tags=["devices"])
public_router = APIRouter(prefix="/public/licenses", tags=["public-licenses"])


# --- Customers (admin) ---


@customer_router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(
    body: CustomerCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> Customer:
    row = Customer(
        company_name=body.company_name.strip(),
        contact_name=body.contact_name,
        email=str(body.email) if body.email else None,
        phone=body.phone,
        tax_number=body.tax_number,
        notes=body.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@customer_router.get("", response_model=list[CustomerOut])
def list_customers(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[Customer]:
    return list(db.scalars(select(Customer).order_by(Customer.id.desc())).all())


@customer_router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> Customer:
    row = db.get(Customer, customer_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return row


@customer_router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    body: CustomerUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> Customer:
    row = db.get(Customer, customer_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    data = body.model_dump(exclude_unset=True)
    if "email" in data and data["email"] is not None:
        data["email"] = str(data["email"])
    for key, value in data.items():
        setattr(row, key, value)
    row.updated_at = model_utcnow()
    db.commit()
    db.refresh(row)
    return row


def _license_to_out(db: Session, lic: License) -> LicenseOut:
    sync_license_expired_status(lic)
    active = count_active_devices(db, lic.id)
    return LicenseOut(
        id=lic.id,
        license_key=lic.license_key,
        customer_id=lic.customer_id,
        plan=lic.plan,
        status=lic.status,
        starts_at=lic.starts_at,
        expires_at=lic.expires_at,
        max_devices=lic.max_devices,
        features=normalize_features(lic.features),
        created_at=lic.created_at,
        updated_at=lic.updated_at,
        customer_name=lic.customer.company_name if lic.customer else None,
        active_devices=active,
    )


def _get_license_by_key(db: Session, license_key: str) -> License | None:
    return db.scalar(
        select(License)
        .options(joinedload(License.customer), joinedload(License.devices))
        .where(License.license_key == license_key.upper().strip())
    )


def _build_validate_response(
    db: Session,
    lic: License | None,
    *,
    device_id: str | None = None,
    ok: bool,
    message: str,
) -> LicenseValidateResponse:
    if lic is None:
        return LicenseValidateResponse(ok=False, message=message)
    sync_license_expired_status(lic)
    active = count_active_devices(db, lic.id)
    return LicenseValidateResponse(
        ok=ok,
        license_key=lic.license_key,
        status=lic.status,
        plan=lic.plan,
        customer_name=lic.customer.company_name if lic.customer else None,
        expires_at=lic.expires_at,
        days_left=days_left(lic.expires_at),
        max_devices=lic.max_devices,
        active_devices=active,
        features=normalize_features(lic.features),
        message=message,
    )


# --- Admin license CRUD ---


@admin_router.post("", response_model=LicenseOut, status_code=status.HTTP_201_CREATED)
def create_license(
    body: LicenseCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseOut:
    customer = db.get(Customer, body.customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    starts = body.starts_at or utcnow()
    if body.expires_at:
        expires = body.expires_at
    elif body.plan == LicensePlan.demo:
        expires = demo_expiry(starts)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="expires_at is required for non-demo plans",
        )

    key = (body.license_key or ensure_unique_license_key(db)).upper().strip()
    if db.scalar(select(License.id).where(License.license_key == key)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="License key already exists")

    lic = License(
        license_key=key,
        customer_id=body.customer_id,
        plan=body.plan,
        status=LicenseStatus.active,
        starts_at=starts,
        expires_at=expires,
        max_devices=body.max_devices,
        features=normalize_features(body.features),
    )
    db.add(lic)
    db.commit()
    db.refresh(lic)
    lic = _get_license_by_key(db, lic.license_key)
    assert lic is not None
    return _license_to_out(db, lic)


@admin_router.get("", response_model=list[LicenseOut])
def list_licenses(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[LicenseOut]:
    rows = db.scalars(
        select(License).options(joinedload(License.customer)).order_by(License.id.desc())
    ).all()
    return [_license_to_out(db, lic) for lic in rows]


def _device_to_out(dev: LicenseDevice, license_key: str | None = None) -> LicenseDeviceOut:
    return LicenseDeviceOut(
        id=dev.id,
        license_id=dev.license_id,
        license_key=license_key,
        device_id=dev.device_id,
        device_name=dev.device_name,
        app_version=dev.app_version,
        first_activated_at=dev.first_activated_at,
        last_seen_at=dev.last_seen_at,
        is_active=dev.is_active,
    )


def _license_to_detail(db: Session, lic: License) -> LicenseDetailOut:
    base = _license_to_out(db, lic)
    return LicenseDetailOut(
        **base.model_dump(),
        devices=[_device_to_out(d, lic.license_key) for d in lic.devices],
    )


@devices_router.get("", response_model=list[LicenseDeviceOut])
def list_devices(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> list[LicenseDeviceOut]:
    rows = db.scalars(
        select(LicenseDevice)
        .join(License)
        .options(joinedload(LicenseDevice.license))
        .order_by(LicenseDevice.last_seen_at.desc())
    ).all()
    return [_device_to_out(d, d.license.license_key if d.license else None) for d in rows]


@admin_router.get("/{license_key}", response_model=LicenseDetailOut)
def get_license(
    license_key: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseDetailOut:
    lic = _get_license_by_key(db, license_key)
    if lic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")
    return _license_to_detail(db, lic)


@admin_router.put("/{license_key}", response_model=LicenseOut)
def update_license(
    license_key: str,
    body: LicenseUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseOut:
    lic = _get_license_by_key(db, license_key)
    if lic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")
    data = body.model_dump(exclude_unset=True)
    if "features" in data:
        data["features"] = normalize_features(data["features"])
    for key, value in data.items():
        setattr(lic, key, value)
    lic.updated_at = model_utcnow()
    sync_license_expired_status(lic)
    db.commit()
    db.refresh(lic)
    lic = _get_license_by_key(db, license_key)
    assert lic is not None
    return _license_to_out(db, lic)


@admin_router.post("/{license_key}/suspend", response_model=LicenseOut)
def suspend_license(
    license_key: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseOut:
    lic = _get_license_by_key(db, license_key)
    if lic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")
    lic.status = LicenseStatus.suspended
    lic.updated_at = model_utcnow()
    db.commit()
    lic = _get_license_by_key(db, license_key)
    assert lic is not None
    return _license_to_out(db, lic)


@admin_router.post("/{license_key}/cancel", response_model=LicenseOut)
def cancel_license(
    license_key: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseOut:
    lic = _get_license_by_key(db, license_key)
    if lic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")
    lic.status = LicenseStatus.cancelled
    lic.updated_at = model_utcnow()
    db.commit()
    lic = _get_license_by_key(db, license_key)
    assert lic is not None
    return _license_to_out(db, lic)


@admin_router.post("/{license_key}/renew", response_model=LicenseOut)
def renew_license(
    license_key: str,
    body: LicenseRenew,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseOut:
    from datetime import timedelta

    lic = _get_license_by_key(db, license_key)
    if lic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")

    now = utcnow()
    if body.expires_at:
        lic.expires_at = body.expires_at
    elif body.extend_days:
        base = lic.expires_at if lic.expires_at > now else now
        lic.expires_at = base + timedelta(days=body.extend_days)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide expires_at or extend_days",
        )

    if lic.expires_at > now and lic.status in (LicenseStatus.expired, LicenseStatus.suspended):
        lic.status = LicenseStatus.active
    elif lic.status == LicenseStatus.cancelled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot renew cancelled license")

    lic.updated_at = model_utcnow()
    sync_license_expired_status(lic)
    db.commit()
    lic = _get_license_by_key(db, license_key)
    assert lic is not None
    return _license_to_out(db, lic)


@admin_router.post("/{license_key}/reset-device", response_model=MessageOut)
def reset_devices(
    license_key: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> MessageOut:
    lic = _get_license_by_key(db, license_key)
    if lic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")
    for dev in lic.devices:
        dev.is_active = False
    lic.updated_at = model_utcnow()
    db.commit()
    return MessageOut(message="All devices deactivated for this license")


# --- Public API ---


@public_router.post("/activate", response_model=LicenseValidateResponse)
def activate_license(
    body: DeviceActivateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> LicenseValidateResponse:
    lic = _get_license_by_key(db, body.license_key)
    if lic is None:
        return LicenseValidateResponse(ok=False, message="License not found")

    now = utcnow()
    sync_license_expired_status(lic, now=now)

    if lic.status == LicenseStatus.suspended:
        return _build_validate_response(db, lic, ok=False, message="License is suspended")
    if lic.status == LicenseStatus.cancelled:
        return _build_validate_response(db, lic, ok=False, message="License is cancelled")
    from app.license_utils import ensure_aware

    if ensure_aware(lic.expires_at) <= now:
        lic.status = LicenseStatus.expired
        db.commit()
        return _build_validate_response(db, lic, ok=False, message="License has expired")

    device_id = body.device_id.strip()
    existing = db.scalar(
        select(LicenseDevice).where(
            LicenseDevice.license_id == lic.id,
            LicenseDevice.device_id == device_id,
        )
    )

    if existing:
        existing.is_active = True
        existing.device_name = body.device_name.strip() or existing.device_name
        existing.app_version = body.app_version
        existing.last_seen_at = now
        db.commit()
        db.refresh(lic)
        lic = _get_license_by_key(db, lic.license_key)
        assert lic is not None
        return _build_validate_response(db, lic, device_id=device_id, ok=True, message="Device re-activated")

    active_count = count_active_devices(db, lic.id)
    if active_count >= lic.max_devices:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Maximum devices ({lic.max_devices}) reached",
        )

    dev = LicenseDevice(
        license_id=lic.id,
        device_id=device_id,
        device_name=body.device_name.strip() or device_id,
        app_version=body.app_version,
        first_activated_at=now,
        last_seen_at=now,
        is_active=True,
    )
    db.add(dev)
    db.commit()
    lic = _get_license_by_key(db, lic.license_key)
    assert lic is not None
    return _build_validate_response(db, lic, device_id=device_id, ok=True, message="Device activated")


@public_router.post("/validate", response_model=LicenseValidateResponse)
def validate_license(
    body: DeviceValidateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> LicenseValidateResponse:
    lic = _get_license_by_key(db, body.license_key)
    if lic is None:
        return LicenseValidateResponse(ok=False, message="License not found")

    now = utcnow()
    sync_license_expired_status(lic, now=now)

    if lic.status == LicenseStatus.suspended:
        return _build_validate_response(db, lic, ok=False, message="License is suspended")
    if lic.status == LicenseStatus.cancelled:
        return _build_validate_response(db, lic, ok=False, message="License is cancelled")
    from app.license_utils import ensure_aware

    if ensure_aware(lic.expires_at) <= now:
        lic.status = LicenseStatus.expired
        db.commit()
        return _build_validate_response(db, lic, ok=False, message="License has expired")

    device_id = body.device_id.strip()
    dev = db.scalar(
        select(LicenseDevice).where(
            LicenseDevice.license_id == lic.id,
            LicenseDevice.device_id == device_id,
            LicenseDevice.is_active.is_(True),
        )
    )
    if dev is None:
        return _build_validate_response(
            db, lic, ok=False, message="Device not activated on this license"
        )

    dev.last_seen_at = now
    if body.app_version:
        dev.app_version = body.app_version
    db.commit()
    lic = _get_license_by_key(db, lic.license_key)
    assert lic is not None
    return _build_validate_response(db, lic, device_id=device_id, ok=True, message="License valid")

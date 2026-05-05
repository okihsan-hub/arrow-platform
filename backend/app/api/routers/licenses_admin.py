from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.db import get_db
from app.models.license import LicenseStatus
from app.models.license_event import LicenseEventType
from app.models.user import User, UserRole
from app.schemas.license import LicenseCreate, LicensePublic, LicenseStatusUpdate
from app.services import license_events
from app.services.licenses import create_license, get_license, list_licenses, reset_license_devices, set_license_status


router = APIRouter(prefix="/admin/licenses", tags=["licenses-admin"])


@router.post("", response_model=LicensePublic)
def admin_create_license(
    payload: LicenseCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> LicensePublic:
    if payload.expires_at <= payload.starts_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="expires_at must be after starts_at")

    lic = create_license(
        db,
        customer_id=payload.customer_id,
        reseller_id=payload.reseller_id,
        product_name=payload.product_name,
        starts_at=payload.starts_at,
        expires_at=payload.expires_at,
        max_devices=payload.max_devices,
    )
    return lic


@router.get("", response_model=list[LicensePublic])
def admin_list_licenses(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> list[LicensePublic]:
    return list_licenses(db)


@router.get("/{license_id}", response_model=LicensePublic)
def admin_get_license(
    license_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> LicensePublic:
    lic = get_license(db, license_id)
    if not lic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")
    return lic


@router.patch("/{license_id}/status", response_model=LicensePublic)
def admin_update_license_status(
    license_id: int,
    payload: LicenseStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> LicensePublic:
    lic = set_license_status(db, license_id, payload.status)
    if not lic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")
    return lic


@router.post("/{license_id}/reset-devices", response_model=LicensePublic)
def admin_reset_devices(
    license_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> LicensePublic:
    lic = reset_license_devices(db, license_id)
    if not lic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="License not found")

    license_events.log_license_event(
        db,
        event_type=LicenseEventType.admin_reset_devices,
        license_key=lic.license_key,
        device_id="admin",
        ip=None,
        success=True,
        reason="reset_devices",
    )
    return lic


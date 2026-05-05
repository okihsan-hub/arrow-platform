from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.license import (
    LicenseActivateRequest,
    LicenseValidateRequest,
    LicenseValidationResponse,
)
from app.models.license_event import LicenseEventType
from app.services import license_events
from app.services.license_signing import verify_activation_request_or_reason
from app.services.licenses import activate_license, validate_license_strict


router = APIRouter(prefix="/licenses", tags=["licenses-public"])


@router.post("/activate", response_model=LicenseValidationResponse)
def public_activate_license(
    payload: LicenseActivateRequest,
    request: Request,
    db: Session = Depends(get_db),
    x_timestamp: str | None = Header(default=None, alias="X-Timestamp"),
    x_nonce: str | None = Header(default=None, alias="X-Nonce"),
    x_signature: str | None = Header(default=None, alias="X-Signature"),
) -> LicenseValidationResponse:
    reason = verify_activation_request_or_reason(
        db,
        license_key=payload.license_key,
        device_id=payload.device_id,
        timestamp=x_timestamp,
        nonce=x_nonce,
        signature=x_signature,
    )
    if reason:
        ip = request.client.host if request.client else None
        license_events.log_license_event(
            db,
            event_type=LicenseEventType.activation,
            license_key=payload.license_key,
            device_id=payload.device_id,
            ip=ip,
            success=False,
            reason=reason,
        )
        return LicenseValidationResponse(valid=False, reason=reason)

    ip = request.client.host if request.client else None
    platform = request.headers.get("user-agent")

    ok, reason, lic = activate_license(
        db,
        license_key=payload.license_key,
        device_id=payload.device_id,
        device_name=payload.device_name,
        app_version=payload.app_version,
        ip=ip,
        platform=platform,
    )
    if not ok or not lic:
        license_events.log_license_event(
            db,
            event_type=LicenseEventType.activation,
            license_key=payload.license_key,
            device_id=payload.device_id,
            ip=ip,
            success=False,
            reason=reason,
        )
        return LicenseValidationResponse(valid=False, reason=reason)

    license_events.log_license_event(
        db,
        event_type=LicenseEventType.activation,
        license_key=payload.license_key,
        device_id=payload.device_id,
        ip=ip,
        success=True,
        reason=None,
    )
    return LicenseValidationResponse(
        valid=True,
        product_name=lic.product_name,
        expires_at=lic.expires_at,
        max_devices=lic.max_devices,
        device_count=len(lic.bound_devices or {}),
    )


@router.post("/validate", response_model=LicenseValidationResponse)
def public_validate_license(payload: LicenseValidateRequest, db: Session = Depends(get_db)) -> LicenseValidationResponse:
    ok, reason, lic = validate_license_strict(db, license_key=payload.license_key, device_id=payload.device_id)
    if not ok or not lic:
        # requirement: log fail reasons for validation checks
        license_events.log_license_event(
            db,
            event_type=LicenseEventType.validation,
            license_key=payload.license_key,
            device_id=payload.device_id,
            ip=None,
            success=False,
            reason=reason,
        )
        return LicenseValidationResponse(valid=False, reason=reason)

    return LicenseValidationResponse(
        valid=True,
        product_name=lic.product_name,
        expires_at=lic.expires_at,
        max_devices=lic.max_devices,
        device_count=len(lic.bound_devices or {}),
    )


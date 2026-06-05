from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser, LicenseRequest, LicenseRequestStatus
from app.schemas import (
    LicenseRequestCreate,
    LicenseRequestOut,
    LicenseRequestPublicResponse,
    LicenseRequestReject,
)
from app.security import get_current_admin
from app.services import license_requests as request_service

public_router = APIRouter(prefix="/public/license-requests", tags=["public-license-requests"])
admin_router = APIRouter(prefix="/admin/license-requests", tags=["license-requests"])


def _to_out(req: LicenseRequest) -> LicenseRequestOut:
    return LicenseRequestOut(
        id=req.id,
        request_code=req.request_code,
        status=req.status.value if hasattr(req.status, "value") else str(req.status),
        company_name=req.company_name,
        contact_name=req.contact_name,
        contact_position=req.contact_position,
        email=req.email,
        phone=req.phone,
        tax_number=req.tax_number,
        machine_code=req.machine_code,
        device_name=req.device_name,
        app_version=req.app_version,
        deployment_mode=req.deployment_mode.value if hasattr(req.deployment_mode, "value") else str(req.deployment_mode),
        requested_plan=req.requested_plan,
        notes=req.notes,
        license_key=req.license_key,
        customer_id=req.customer_id,
        rejection_reason=req.rejection_reason,
        created_at=req.created_at,
        updated_at=req.updated_at,
        reviewed_at=req.reviewed_at,
    )


# --- Public ---


@public_router.post("", response_model=LicenseRequestPublicResponse, status_code=status.HTTP_201_CREATED)
def create_license_request(
    body: LicenseRequestCreate,
    db: Annotated[Session, Depends(get_db)],
) -> LicenseRequestPublicResponse:
    try:
        req = request_service.create_license_request(db, body.model_dump(mode="json"))
    except ValueError as exc:
        if str(exc) == "invalid_requested_plan":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz plan") from exc
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return LicenseRequestPublicResponse(
        ok=True,
        request_code=req.request_code,
        status=req.status.value,
        message="Lisans talebi oluşturuldu",
    )


@public_router.get("/{request_code}/status", response_model=LicenseRequestPublicResponse)
def get_license_request_status(
    request_code: str,
    db: Annotated[Session, Depends(get_db)],
    machine_code: Annotated[str, Query(min_length=1, description="Talebi oluşturan cihazın machine_code değeri")],
) -> LicenseRequestPublicResponse:
    req, err = request_service.get_request_status(
        db,
        request_code=request_code,
        machine_code=machine_code,
    )
    if err == "request_not_found":
        return LicenseRequestPublicResponse(ok=False, message="Talep bulunamadı")
    if err == "machine_code_mismatch":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cihaz doğrulaması başarısız")
    assert req is not None
    st = req.status.value if hasattr(req.status, "value") else str(req.status)
    return LicenseRequestPublicResponse(
        ok=True,
        request_code=req.request_code,
        status=st,
        license_key=req.license_key if req.status == LicenseRequestStatus.approved else None,
        rejection_reason=req.rejection_reason if req.status == LicenseRequestStatus.rejected else None,
        message="Talep durumu",
    )


# --- Admin ---


@admin_router.get("", response_model=list[LicenseRequestOut])
def list_license_requests(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
    status: Annotated[
        Literal["pending", "approved", "rejected", "all"] | None,
        Query(description="Durum filtresi"),
    ] = "all",
) -> list[LicenseRequestOut]:
    rows = request_service.list_license_requests(db, status_filter=status or "all")
    return [_to_out(r) for r in rows]


@admin_router.get("/{request_id}", response_model=LicenseRequestOut)
def get_license_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseRequestOut:
    req = request_service.get_license_request(db, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talep bulunamadı")
    return _to_out(req)


@admin_router.post("/{request_id}/approve", response_model=LicenseRequestOut)
def approve_license_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseRequestOut:
    try:
        req = request_service.approve_license_request(db, request_id, admin)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talep bulunamadı") from exc
    except ValueError as exc:
        if str(exc) == "request_not_pending":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Talep zaten işlenmiş") from exc
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return _to_out(req)


@admin_router.post("/{request_id}/reject", response_model=LicenseRequestOut)
def reject_license_request(
    request_id: int,
    body: LicenseRequestReject,
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseRequestOut:
    try:
        req = request_service.reject_license_request(
            db,
            request_id,
            admin,
            rejection_reason=body.rejection_reason,
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talep bulunamadı") from exc
    except ValueError as exc:
        msg = str(exc)
        if msg == "request_not_pending":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Talep zaten işlenmiş") from exc
        if msg == "rejection_reason_required":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Red nedeni zorunludur") from exc
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg) from exc
    return _to_out(req)

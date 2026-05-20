from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.license_renew_utils import mask_license_key
from app.models import AdminUser, LicenseRenewRequest, LicenseRenewRequestStatus
from app.schemas import LicenseRenewRequestOut
from app.security import get_current_admin
from app.services import license_renew_requests as renew_service

router = APIRouter(prefix="/admin/license-renew-requests", tags=["license-renew-requests"])


def _to_out(req: LicenseRenewRequest, *, reveal_key: bool = False) -> LicenseRenewRequestOut:
    company = req.customer_name
    if not company and req.license and req.license.customer:
        company = req.license.customer.company_name
    full_key = req.license_key
    if not full_key and req.license:
        full_key = req.license.license_key
    return LicenseRenewRequestOut(
        id=req.id,
        external_id=req.external_id,
        status=req.status.value if hasattr(req.status, "value") else str(req.status),
        created_at=req.created_at,
        requested_period=req.requested_period,
        requested_period_label=req.requested_period_label,
        note=req.note,
        contact_phone=req.contact_phone,
        license_key_masked=req.license_key_masked or mask_license_key(full_key),
        license_key=full_key if reveal_key else None,
        license_id=req.license_id,
        customer_name=company,
        device_name=req.device_name,
        device_id=req.device_id,
        client_license_status=req.client_license_status,
        plan=req.plan,
        imported_at=req.imported_at,
        processed_at=req.processed_at,
    )


@router.get("", response_model=list[LicenseRenewRequestOut])
def list_license_renew_requests(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
    status: Annotated[
        Literal["pending", "approved", "rejected", "all"] | None,
        Query(description="Durum filtresi"),
    ] = "all",
) -> list[LicenseRenewRequestOut]:
    rows = renew_service.list_renew_requests(db, status_filter=status or "all")
    return [_to_out(r) for r in rows]


@router.post("/sync", response_model=dict[str, int])
def sync_license_renew_requests(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> dict[str, int]:
    return renew_service.sync_from_jsonl(db)


@router.get("/{request_id}", response_model=LicenseRenewRequestOut)
def get_license_renew_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseRenewRequestOut:
    req = renew_service.get_renew_request(db, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talep bulunamadı")
    return _to_out(req, reveal_key=True)


@router.post("/{request_id}/approve", response_model=LicenseRenewRequestOut)
def approve_license_renew_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseRenewRequestOut:
    try:
        req = renew_service.approve_renew_request(db, request_id, admin)
    except LookupError as exc:
        code = str(exc)
        if code == "request_not_found":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talep bulunamadı") from exc
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="İlişkili lisans bulunamadı. JSONL kaydında license_key veya eşleşen müşteri gereklidir.",
        ) from exc
    except ValueError as exc:
        msg = str(exc)
        if msg == "request_not_pending":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Talep zaten işlenmiş") from exc
        if msg == "license_cancelled":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="İptal edilmiş lisans uzatılamaz") from exc
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg) from exc
    return _to_out(req, reveal_key=True)


@router.post("/{request_id}/reject", response_model=LicenseRenewRequestOut)
def reject_license_renew_request(
    request_id: int,
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[AdminUser, Depends(get_current_admin)],
) -> LicenseRenewRequestOut:
    try:
        req = renew_service.reject_renew_request(db, request_id, admin)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talep bulunamadı") from exc
    except ValueError as exc:
        if str(exc) == "request_not_pending":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Talep zaten işlenmiş") from exc
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return _to_out(req, reveal_key=True)

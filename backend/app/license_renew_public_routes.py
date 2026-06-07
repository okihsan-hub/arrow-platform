from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LicenseRenewRequestStatus
from app.schemas import LicenseRenewRequestCreate, LicenseRenewRequestPublicResponse
from app.services import license_renew_requests as renew_service

public_router = APIRouter(prefix="/public/license-renew-requests", tags=["public-license-renew-requests"])


@public_router.post("", response_model=LicenseRenewRequestPublicResponse, status_code=status.HTTP_201_CREATED)
def create_public_renew_request(
    body: LicenseRenewRequestCreate,
    db: Annotated[Session, Depends(get_db)],
) -> LicenseRenewRequestPublicResponse:
    try:
        row, created = renew_service.create_renew_request_public(db, body.model_dump(mode="json"))
    except ValueError as exc:
        if str(exc) == "invalid_requested_period":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geçersiz talep süresi",
            ) from exc
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    st = row.status.value if hasattr(row.status, "value") else str(row.status)
    msg = "Süre uzatma talebiniz alındı." if created else "Süre uzatma talebiniz zaten kayıtlı."
    return LicenseRenewRequestPublicResponse(
        ok=True,
        request_id=row.id,
        external_id=row.external_id,
        status=st,
        message=msg,
    )

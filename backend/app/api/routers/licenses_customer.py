from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models.user import User
from app.schemas.license import LicensePublic
from app.services.licenses import list_customer_licenses


router = APIRouter(prefix="/licenses", tags=["licenses"])


@router.get("/me", response_model=list[LicensePublic])
def my_licenses(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[LicensePublic]:
    return list_customer_licenses(db, customer_id=user.id)


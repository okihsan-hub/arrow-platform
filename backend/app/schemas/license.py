from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.license import LicenseStatus


class LicenseCreate(BaseModel):
    customer_id: int
    reseller_id: int | None = None
    product_name: str = "Arrow Restaurant"
    starts_at: datetime
    expires_at: datetime
    max_devices: int = Field(default=1, ge=1)


class LicensePublic(BaseModel):
    id: int
    customer_id: int
    reseller_id: int | None
    product_name: str
    license_key: str
    status: LicenseStatus
    starts_at: datetime
    expires_at: datetime
    max_devices: int
    bound_devices: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LicenseStatusUpdate(BaseModel):
    status: LicenseStatus


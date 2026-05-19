from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field

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


class LicenseActivateRequest(BaseModel):
    license_key: str
    device_id: str
    device_name: str
    app_version: str


class LicenseValidateRequest(BaseModel):
    license_key: str
    device_id: str


class LicenseValidationSuccess(BaseModel):
    """Successful activation/validation: values come from the License row."""

    model_config = ConfigDict(extra="forbid")

    valid: Literal[True] = True
    reason: None = None
    product_name: str
    expires_at: datetime
    max_devices: int
    device_count: int


class LicenseValidationFailure(BaseModel):
    model_config = ConfigDict(extra="forbid")

    valid: Literal[False] = False
    reason: str
    product_name: None = None
    expires_at: None = None
    max_devices: None = None
    device_count: None = None


LicenseValidationResponse = Annotated[
    Union[LicenseValidationSuccess, LicenseValidationFailure],
    Field(discriminator="valid"),
]


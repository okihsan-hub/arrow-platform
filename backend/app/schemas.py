from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import AdminRole, LicensePlan, LicenseStatus


class MessageOut(BaseModel):
    message: str


# --- Auth ---


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: AdminRole
    is_active: bool
    created_at: datetime


# --- Customer ---


class CustomerCreate(BaseModel):
    company_name: str
    contact_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    tax_number: str | None = None
    notes: str | None = None


class CustomerUpdate(BaseModel):
    company_name: str | None = None
    contact_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    tax_number: str | None = None
    notes: str | None = None


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    contact_name: str | None
    email: str | None
    phone: str | None
    tax_number: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime


# --- License (admin) ---


class LicenseCreate(BaseModel):
    customer_id: int
    plan: LicensePlan
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    max_devices: int = Field(default=1, ge=1)
    features: dict[str, Any] | list[Any] | None = None
    license_key: str | None = None


class LicenseUpdate(BaseModel):
    plan: LicensePlan | None = None
    status: LicenseStatus | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    max_devices: int | None = Field(default=None, ge=1)
    features: dict[str, Any] | list[Any] | None = None


class LicenseRenew(BaseModel):
    expires_at: datetime | None = None
    extend_days: int | None = Field(default=None, ge=1)


class LicenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    license_key: str
    customer_id: int
    plan: LicensePlan
    status: LicenseStatus
    starts_at: datetime
    expires_at: datetime
    max_devices: int
    features: dict[str, Any] | list[Any] | None
    created_at: datetime
    updated_at: datetime
    customer_name: str | None = None
    active_devices: int | None = None


class LicenseDeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    license_id: int
    license_key: str | None = None
    device_id: str
    device_name: str
    app_version: str | None
    first_activated_at: datetime
    last_seen_at: datetime
    is_active: bool


class LicenseDetailOut(LicenseOut):
    devices: list[LicenseDeviceOut] = []


# --- Public license ---


class DeviceActivateRequest(BaseModel):
    license_key: str
    device_id: str
    device_name: str
    app_version: str | None = None


class DeviceValidateRequest(BaseModel):
    license_key: str
    device_id: str
    app_version: str | None = None


class LicenseValidateResponse(BaseModel):
    ok: bool
    license_key: str | None = None
    status: LicenseStatus | str | None = None
    plan: LicensePlan | str | None = None
    customer_name: str | None = None
    expires_at: datetime | None = None
    days_left: int | None = None
    max_devices: int | None = None
    active_devices: int | None = None
    features: dict[str, Any] | list[Any] | None = None
    message: str

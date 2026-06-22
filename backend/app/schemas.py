from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models import (
    AdminRole,
    DeploymentMode,
    LicensePlan,
    LicenseRenewRequestStatus,
    LicenseRequestStatus,
    LicenseStatus,
    ReleaseStatus,
)

SHA256_PATTERN = re.compile(r"^[a-fA-F0-9]{64}$")
ReleaseStatusLiteral = Literal["draft", "published", "archived"]


def _normalize_sha256(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    if not stripped:
        return None
    if not SHA256_PATTERN.match(stripped):
        raise ValueError("SHA256 must be 64 hexadecimal characters")
    return stripped.lower()


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


# --- License renew requests (admin) ---


class LicenseRenewRequestCreate(BaseModel):
    external_id: str | None = Field(None, max_length=64)
    requested_period: str = Field(..., min_length=1, max_length=32)
    requested_period_label: str | None = Field(None, max_length=64)
    note: str | None = None
    contact_phone: str | None = Field(None, max_length=64)
    license_key: str | None = Field(None, max_length=32)
    license_key_masked: str | None = Field(None, max_length=64)
    customer_name: str | None = Field(None, max_length=255)
    device_name: str | None = Field(None, max_length=255)
    device_id: str | None = Field(None, max_length=128)
    client_license_status: str | None = Field(None, max_length=64)
    plan: str | None = Field(None, max_length=64)
    created_at: datetime | None = None


class LicenseRenewRequestPublicResponse(BaseModel):
    ok: bool
    request_id: int | None = None
    external_id: str
    status: LicenseRenewRequestStatus | str
    message: str


class LicenseRenewRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: str
    status: LicenseRenewRequestStatus | str
    created_at: datetime
    requested_period: str
    requested_period_label: str | None = None
    note: str | None = None
    contact_phone: str | None = None
    license_key_masked: str | None = None
    license_key: str | None = None
    license_id: int | None = None
    customer_name: str | None = None
    device_name: str | None = None
    device_id: str | None = None
    client_license_status: str | None = None
    plan: str | None = None
    imported_at: datetime
    processed_at: datetime | None = None


# --- License requests (public + admin) ---


class LicenseRequestCreate(BaseModel):
    company_name: str
    contact_name: str
    contact_position: str | None = None
    email: EmailStr
    phone: str
    tax_number: str | None = None
    machine_code: str
    device_name: str
    app_version: str
    deployment_mode: DeploymentMode
    requested_plan: LicensePlan | None = None
    notes: str | None = None


class LicenseRequestPublicResponse(BaseModel):
    ok: bool
    request_code: str | None = None
    status: LicenseRequestStatus | str | None = None
    license_key: str | None = None
    rejection_reason: str | None = None
    message: str


class LicenseRequestReject(BaseModel):
    rejection_reason: str


class LicenseRequestUpdate(BaseModel):
    status: LicenseRequestStatus | None = None


class LicenseRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_code: str
    status: LicenseRequestStatus | str
    company_name: str
    contact_name: str
    contact_position: str | None = None
    email: str
    phone: str
    tax_number: str | None = None
    machine_code: str
    device_name: str
    app_version: str
    deployment_mode: DeploymentMode | str
    requested_plan: str | None = None
    notes: str | None = None
    license_key: str | None = None
    customer_id: int | None = None
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime
    reviewed_at: datetime | None = None


# --- Update releases (admin) ---


class UpdateReleaseCreate(BaseModel):
    app_name: str = Field(min_length=1, max_length=128)
    version: str = Field(min_length=1, max_length=64)
    channel: str = Field(default="stable", max_length=32)
    force_update: bool = False
    min_supported_version: str = Field(min_length=1, max_length=64)
    download_url: str = ""
    sha256: str = ""
    release_notes: str = ""
    uploaded_file_name: str = ""
    file_size_bytes: int | None = Field(default=None, ge=0)

    @field_validator("sha256")
    @classmethod
    def validate_sha256(cls, value: str) -> str:
        normalized = _normalize_sha256(value)
        return normalized or ""


class UpdateReleaseUpdate(BaseModel):
    app_name: str | None = Field(default=None, min_length=1, max_length=128)
    version: str | None = Field(default=None, min_length=1, max_length=64)
    channel: str | None = Field(default=None, max_length=32)
    force_update: bool | None = None
    min_supported_version: str | None = Field(default=None, min_length=1, max_length=64)
    download_url: str | None = None
    sha256: str | None = None
    release_notes: str | None = None
    uploaded_file_name: str | None = None
    file_size_bytes: int | None = Field(default=None, ge=0)
    release_status: ReleaseStatusLiteral | None = None

    @field_validator("sha256")
    @classmethod
    def validate_sha256(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _normalize_sha256(value)


class UpdateReleaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    app_name: str
    version: str
    channel: str
    force_update: bool
    min_supported_version: str
    download_url: str | None
    sha256: str | None
    release_notes: str | None
    uploaded_file_name: str | None
    file_size_bytes: int | None
    release_status: ReleaseStatus | str
    published_at: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UpdateReleaseUploadOut(BaseModel):
    uploaded: bool = True
    file_name: str
    file_size_bytes: int
    sha256: str
    download_url: str

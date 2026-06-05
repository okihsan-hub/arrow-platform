from __future__ import annotations

import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AdminRole(str, enum.Enum):
    super_admin = "super_admin"
    admin = "admin"


class LicensePlan(str, enum.Enum):
    demo = "demo"
    standard = "standard"
    pro = "pro"
    enterprise = "enterprise"


class LicenseStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    expired = "expired"
    cancelled = "cancelled"


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[AdminRole] = mapped_column(
        Enum(AdminRole, native_enum=False), nullable=False, default=AdminRole.admin
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    tax_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    licenses: Mapped[list["License"]] = relationship(back_populates="customer")


class License(Base):
    __tablename__ = "licenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    license_key: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False, index=True)
    plan: Mapped[LicensePlan] = mapped_column(Enum(LicensePlan, native_enum=False), nullable=False)
    status: Mapped[LicenseStatus] = mapped_column(
        Enum(LicenseStatus, native_enum=False), nullable=False, default=LicenseStatus.active
    )
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    max_devices: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    features: Mapped[dict | list | None] = mapped_column(JSON, nullable=True, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    customer: Mapped["Customer"] = relationship(back_populates="licenses")
    devices: Mapped[list["LicenseDevice"]] = relationship(back_populates="license", cascade="all, delete-orphan")


class LicenseDevice(Base):
    __tablename__ = "license_devices"
    __table_args__ = (UniqueConstraint("license_id", "device_id", name="uq_license_device"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    license_id: Mapped[int] = mapped_column(ForeignKey("licenses.id"), nullable=False, index=True)
    device_id: Mapped[str] = mapped_column(String(128), nullable=False)
    device_name: Mapped[str] = mapped_column(String(255), nullable=False)
    app_version: Mapped[str | None] = mapped_column(String(64), nullable=True)
    first_activated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    license: Mapped["License"] = relationship(back_populates="devices")


class LicenseRenewRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LicenseRenewRequest(Base):
    __tablename__ = "license_renew_requests"
    __table_args__ = (UniqueConstraint("external_id", name="uq_license_renew_external_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[LicenseRenewRequestStatus] = mapped_column(
        Enum(LicenseRenewRequestStatus, native_enum=False),
        nullable=False,
        default=LicenseRenewRequestStatus.pending,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    requested_period: Mapped[str] = mapped_column(String(32), nullable=False)
    requested_period_label: Mapped[str | None] = mapped_column(String(64), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    license_key_masked: Mapped[str | None] = mapped_column(String(64), nullable=True)
    license_key: Mapped[str | None] = mapped_column(String(32), nullable=True)
    license_id: Mapped[int | None] = mapped_column(ForeignKey("licenses.id"), nullable=True, index=True)
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    device_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    device_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    client_license_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    plan: Mapped[str | None] = mapped_column(String(64), nullable=True)
    imported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    processed_by_admin_id: Mapped[int | None] = mapped_column(ForeignKey("admin_users.id"), nullable=True)

    license: Mapped["License | None"] = relationship()


class LicenseRequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class DeploymentMode(str, enum.Enum):
    server = "server"
    client = "client"


class LicenseRequest(Base):
    __tablename__ = "license_requests"
    __table_args__ = (UniqueConstraint("request_code", name="uq_license_request_code"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    request_code: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    status: Mapped[LicenseRequestStatus] = mapped_column(
        Enum(LicenseRequestStatus, native_enum=False),
        nullable=False,
        default=LicenseRequestStatus.pending,
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_position: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    tax_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    machine_code: Mapped[str] = mapped_column(String(128), nullable=False)
    device_name: Mapped[str] = mapped_column(String(255), nullable=False)
    app_version: Mapped[str] = mapped_column(String(64), nullable=False)
    deployment_mode: Mapped[DeploymentMode] = mapped_column(
        Enum(DeploymentMode, native_enum=False), nullable=False
    )
    requested_plan: Mapped[str | None] = mapped_column(String(32), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    license_key: Mapped[str | None] = mapped_column(String(32), nullable=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id"), nullable=True, index=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by_admin_id: Mapped[int | None] = mapped_column(ForeignKey("admin_users.id"), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    customer: Mapped["Customer | None"] = relationship()

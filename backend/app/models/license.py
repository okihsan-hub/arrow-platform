from __future__ import annotations

import enum
import secrets
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class LicenseStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    expired = "expired"
    cancelled = "cancelled"


def generate_license_key() -> str:
    """
    Human-friendly key, still high-entropy.
    Format: AR-XXXX-XXXX-XXXX-XXXX (base32-ish, no confusing chars)
    """
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    parts: list[str] = []
    for _ in range(4):
        parts.append("".join(secrets.choice(alphabet) for _ in range(4)))
    return "AR-" + "-".join(parts)


class License(Base):
    __tablename__ = "licenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True, nullable=False)
    reseller_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)

    product_name: Mapped[str] = mapped_column(String(128), nullable=False, default="Arrow Restaurant")
    license_key: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)

    status: Mapped[LicenseStatus] = mapped_column(
        Enum(LicenseStatus, name="license_status"),
        nullable=False,
        default=LicenseStatus.active,
    )

    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    max_devices: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    bound_devices: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


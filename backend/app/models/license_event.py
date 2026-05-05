from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class LicenseEventType(str, enum.Enum):
    activation = "activation"
    validation = "validation"
    admin_reset_devices = "admin_reset_devices"


class LicenseEvent(Base):
    __tablename__ = "license_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[LicenseEventType] = mapped_column(Enum(LicenseEventType, name="license_event_type"), nullable=False)

    license_key_masked: Mapped[str] = mapped_column(String(64), nullable=False)
    device_id: Mapped[str] = mapped_column(String(128), nullable=False)
    ip: Mapped[str | None] = mapped_column(String(64), nullable=True)

    success: Mapped[bool] = mapped_column(Boolean, nullable=False)
    reason: Mapped[str | None] = mapped_column(String(64), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


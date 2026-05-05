from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class ActivationNonce(Base):
    __tablename__ = "activation_nonces"
    __table_args__ = (UniqueConstraint("nonce", name="uq_activation_nonces_nonce"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nonce: Mapped[str] = mapped_column(String(128), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.models.user import UserRole
from app.services.users import create_user, get_user_by_email


def seed_admin_if_configured() -> None:
    settings = get_settings()
    if not settings.seed_admin_email or not settings.seed_admin_password:
        return

    db: Session = SessionLocal()
    try:
        existing = get_user_by_email(db, settings.seed_admin_email)
        if existing:
            return
        create_user(db, email=settings.seed_admin_email, password=settings.seed_admin_password, role=UserRole.admin)
    finally:
        db.close()


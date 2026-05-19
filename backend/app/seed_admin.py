from __future__ import annotations

import sys

from sqlalchemy import select

from app.config import get_settings
from app.database import SessionLocal, init_db
from app.models import AdminRole, AdminUser
from app.security import hash_password


def main() -> None:
    settings = get_settings()
    email = (settings.admin_email or "").strip().lower()
    password = settings.admin_password or ""

    if not email or not password:
        print("ADMIN_EMAIL ve ADMIN_PASSWORD .env dosyasında tanımlanmalıdır.")
        sys.exit(1)

    init_db()
    db = SessionLocal()
    try:
        existing = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if existing:
            existing.password_hash = hash_password(password)
            existing.is_active = True
            db.commit()
            print(f"Admin şifresi güncellendi: {email}")
            return

        admin = AdminUser(
            email=email,
            password_hash=hash_password(password),
            full_name="Super Admin",
            role=AdminRole.super_admin,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"Super admin oluşturuldu: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

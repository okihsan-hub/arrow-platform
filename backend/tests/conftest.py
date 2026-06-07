from __future__ import annotations

import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# Uygulama import edilmeden önce test ortamı
os.environ["DATABASE_URL"] = f"sqlite:///{(Path(__file__).resolve().parent.parent / 'data' / 'test_platform.db').as_posix()}"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-pytest-only"
os.environ["ADMIN_EMAIL"] = "test-admin@arrowbilisim.com"
os.environ["ADMIN_PASSWORD"] = "TestAdmin123!"
os.environ["CORS_ORIGINS"] = "*"
os.environ["APP_ENV"] = "test"
os.environ["LICENSE_HMAC_SECRET"] = "test-hmac-secret-for-pytest-only-32chars"


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    from sqlalchemy import select

    from app.config import clear_settings_cache
    from app.database import Base, SessionLocal, engine, init_db
    from app.models import AdminRole, AdminUser
    from app.security import hash_password

    clear_settings_cache()
    data_dir = Path(__file__).resolve().parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    Base.metadata.drop_all(bind=engine)
    init_db()
    db = SessionLocal()
    try:
        existing = db.scalar(
            select(AdminUser).where(AdminUser.email == "test-admin@arrowbilisim.com")
        )
        if existing is None:
            db.add(
                AdminUser(
                    email="test-admin@arrowbilisim.com",
                    password_hash=hash_password("TestAdmin123!"),
                    full_name="Test Admin",
                    role=AdminRole.super_admin,
                    is_active=True,
                )
            )
            db.commit()
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def client():
    from app.config import clear_settings_cache
    from app.main import create_app

    clear_settings_cache()
    return TestClient(create_app())

from __future__ import annotations

import os
from pathlib import Path

# Uygulama import edilmeden önce test ortamı
os.environ["DATABASE_URL"] = f"sqlite:///{(Path(__file__).resolve().parent.parent / 'data' / 'test_platform.db').as_posix()}"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-pytest-only"
os.environ["ADMIN_EMAIL"] = "test-admin@arrowbilisim.com"
os.environ["ADMIN_PASSWORD"] = "TestAdmin123!"
os.environ["CORS_ORIGINS"] = "*"

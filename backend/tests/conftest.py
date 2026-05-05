from __future__ import annotations

import os


def pytest_configure() -> None:
    # Ensure Settings can load during import-time initialization.
    os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
    os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
    os.environ.setdefault("LICENSE_SIGNING_SECRET", "test-signing-secret")


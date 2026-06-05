from __future__ import annotations

import secrets
import string

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import LicenseRequest


def generate_request_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    parts = ["".join(secrets.choice(alphabet) for _ in range(4)) for _ in range(2)]
    return "LR-" + "-".join(parts)


def ensure_unique_request_code(db: Session, max_attempts: int = 20) -> str:
    for _ in range(max_attempts):
        code = generate_request_code()
        exists = db.scalar(select(LicenseRequest.id).where(LicenseRequest.request_code == code))
        if not exists:
            return code
    raise RuntimeError("Could not generate unique request code")

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import AdminUser

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def _jwt_config() -> tuple[str, str]:
    """Tek kaynak: create ve verify aynı ayarları kullanır."""
    settings = get_settings()
    secret = (settings.jwt_secret_key or "").strip()
    algorithm = (settings.jwt_algorithm or "HS256").strip()
    if not secret:
        raise RuntimeError("JWT_SECRET_KEY is empty")
    return secret, algorithm


def _secret_fingerprint(secret: str) -> str:
    if len(secret) <= 8:
        return "***"
    return f"{secret[:4]}…{secret[-4:]}"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(*, subject: str, expires_minutes: int | None = None) -> str:
    settings = get_settings()
    secret, algorithm = _jwt_config()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(
        minutes=expires_minutes if expires_minutes is not None else settings.jwt_expire_minutes
    )
    # python-jose: exp/iat mutlaka unix timestamp (int) olmalı
    payload = {
        "sub": subject.strip().lower(),
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
    }
    token = jwt.encode(payload, secret, algorithm=algorithm)
    logger.info(
        "[JWT CREATE] sub=%s alg=%s exp=%s fingerprint=%s",
        payload["sub"],
        algorithm,
        payload["exp"],
        _secret_fingerprint(secret),
    )
    return token


def decode_token(token: str) -> str:
    secret, algorithm = _jwt_config()
    raw = (token or "").strip().strip('"').strip("'")
    if raw.lower().startswith("bearer "):
        raw = raw[7:].strip()

    try:
        payload = jwt.decode(
            raw,
            secret,
            algorithms=[algorithm],
            options={"verify_aud": False},
        )
        logger.info(
            "[JWT VERIFY] ok sub=%s alg=%s fingerprint=%s",
            payload.get("sub"),
            algorithm,
            _secret_fingerprint(secret),
        )
    except JWTError as exc:
        logger.warning(
            "[JWT ERROR] %s alg=%s fingerprint=%s token_prefix=%s",
            exc,
            algorithm,
            _secret_fingerprint(secret),
            raw[:20] + "…" if len(raw) > 20 else raw,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        ) from exc

    sub = payload.get("sub")
    if not sub:
        logger.warning("[JWT ERROR] missing sub claim")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing sub")
    return str(sub).strip().lower()


def get_current_admin(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminUser:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    email = decode_token(creds.credentials)
    admin = db.scalar(select(AdminUser).where(AdminUser.email == email))
    if admin is None:
        logger.warning("[JWT VERIFY] admin not found for sub=%s", email)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not found")
    if not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive admin")
    return admin

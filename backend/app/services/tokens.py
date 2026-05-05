from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import TokenDecodeError, create_token, safe_decode
from app.models.refresh_token import RefreshToken
from app.models.user import User


settings = get_settings()


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(*, user: User) -> str:
    return create_token(
        subject=str(user.id),
        token_type="access",
        expires_delta=timedelta(minutes=settings.jwt_access_token_expires_minutes),
        extra={"role": user.role.value},
    )


def create_refresh_token(*, user: User) -> tuple[str, str, datetime]:
    token = create_token(
        subject=str(user.id),
        token_type="refresh",
        expires_delta=timedelta(days=settings.jwt_refresh_token_expires_days),
        extra={"role": user.role.value},
    )
    payload = safe_decode(token)
    jti = str(payload["jti"])
    exp = datetime.fromtimestamp(int(payload["exp"]), tz=timezone.utc)
    return token, jti, exp


def persist_refresh_token(db: Session, *, user_id: int, jti: str, expires_at: datetime) -> None:
    db.add(RefreshToken(user_id=user_id, jti=jti, expires_at=expires_at))
    db.commit()


def revoke_refresh_token(db: Session, *, jti: str) -> None:
    db.execute(delete(RefreshToken).where(RefreshToken.jti == jti))
    db.commit()


def is_refresh_token_active(db: Session, *, jti: str) -> bool:
    token = db.scalar(select(RefreshToken).where(RefreshToken.jti == jti))
    if not token:
        return False
    if token.expires_at <= _utc_now():
        return False
    return True


def decode_refresh_token(refresh_token: str) -> dict:
    payload = safe_decode(refresh_token)
    if payload.get("typ") != "refresh":
        raise TokenDecodeError("Not a refresh token")
    return payload


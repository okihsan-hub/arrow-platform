from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import TokenDecodeError
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest, TokenPair
from app.services.tokens import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    is_refresh_token_active,
    persist_refresh_token,
    revoke_refresh_token,
)
from app.services.users import authenticate_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    user = authenticate_user(db, email=payload.email, password=payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access = create_access_token(user=user)
    refresh, jti, exp = create_refresh_token(user=user)
    persist_refresh_token(db, user_id=user.id, jti=jti, expires_at=exp)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenPair:
    try:
        decoded = decode_refresh_token(payload.refresh_token)
    except (TokenDecodeError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    jti = str(decoded.get("jti") or "")
    user_id = decoded.get("sub")
    if not jti or not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if not is_refresh_token_active(db, jti=jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked/expired")

    # rotation: revoke current refresh token and issue a new pair
    revoke_refresh_token(db, jti=jti)
    user = db.get(User, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access = create_access_token(user=user)
    refresh_new, jti_new, exp_new = create_refresh_token(user=user)
    persist_refresh_token(db, user_id=user.id, jti=jti_new, expires_at=exp_new)
    return TokenPair(access_token=access, refresh_token=refresh_new)


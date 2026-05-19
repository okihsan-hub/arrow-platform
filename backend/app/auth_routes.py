from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser
from app.schemas import AdminUserOut, LoginRequest, TokenOut
from app.security import create_access_token, get_current_admin, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(body: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> TokenOut:
    admin = db.scalar(select(AdminUser).where(AdminUser.email == body.email.lower()))
    if admin is None or not admin.is_active or not verify_password(body.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=admin.email.lower())
    return TokenOut(access_token=token)


@router.get("/me", response_model=AdminUserOut)
def me(admin: Annotated[AdminUser, Depends(get_current_admin)]) -> AdminUser:
    return admin

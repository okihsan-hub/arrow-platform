from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


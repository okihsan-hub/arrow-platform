from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str

    jwt_secret_key: str
    jwt_access_token_expires_minutes: int = 15
    jwt_refresh_token_expires_days: int = 30

    license_signing_secret_key: str | None = None

    backend_cors_origins: str = "http://localhost:3000"
    bcrypt_rounds: int = 12

    seed_admin_email: str | None = None
    seed_admin_password: str | None = None

    def cors_origins_list(self) -> List[str]:
        raw = (self.backend_cors_origins or "").strip()
        if not raw:
            return []
        return [o.strip() for o in raw.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
# Önce üst .env, sonra backend/.env — SONRAKİ dosya öncelikli (backend kazanır)
_ENV_CANDIDATES = (_BACKEND_ROOT.parent / ".env", _BACKEND_ROOT / ".env")
_ENV_FILES = tuple(str(p) for p in _ENV_CANDIDATES if p.is_file()) or (str(_BACKEND_ROOT / ".env"),)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILES,
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    database_url: str = Field(
        default="sqlite:///./data/arrow_license.db",
        alias="DATABASE_URL",
    )
    jwt_secret_key: str = Field(
        default="dev-change-me-in-production",
        alias="JWT_SECRET_KEY",
    )
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=60 * 24, alias="JWT_EXPIRE_MINUTES")

    cors_origins: str = Field(default="*", alias="CORS_ORIGINS")

    admin_email: str | None = Field(default=None, alias="ADMIN_EMAIL")
    admin_password: str | None = Field(default=None, alias="ADMIN_PASSWORD")

    demo_license_days: int = Field(default=7, alias="DEMO_LICENSE_DAYS")

    # Arrow Restaurant jsonl — süre uzatma talepleri (import)
    license_renew_jsonl_path: str | None = Field(
        default=None,
        alias="LICENSE_RENEW_JSONL_PATH",
    )

    # Startup'ta create_all — varsayılan kapalı (Postgres'te takılmayı önler)
    init_db_on_startup: bool = Field(default=False, alias="INIT_DB_ON_STARTUP")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    logger.info(
        "[CONFIG] env_files=%s DATABASE_URL=%s JWT fingerprint=%s",
        _ENV_FILES,
        _mask_db_url(settings.database_url),
        _secret_fingerprint(settings.jwt_secret_key),
    )
    return settings


def clear_settings_cache() -> None:
    get_settings.cache_clear()


def _mask_db_url(url: str) -> str:
    if "@" in url and "://" in url:
        head, tail = url.split("://", 1)
        if "@" in tail:
            creds, host = tail.rsplit("@", 1)
            return f"{head}://***@{host}"
    return url


def _secret_fingerprint(secret: str) -> str:
    if not secret:
        return "empty"
    return f"{secret[:4]}…{secret[-4:]}" if len(secret) > 8 else "***"


def cors_origins_list() -> list[str]:
    raw = get_settings().cors_origins.strip()
    if raw == "*":
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]

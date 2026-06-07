"""Production güvenlik kontrolleri — startup."""
from __future__ import annotations

import logging

from app.config import Settings

logger = logging.getLogger(__name__)

_WEAK_HMAC_SECRETS = frozenset(
    {
        "",
        "change-me",
        "change-me-insecure-default-hmac-secret",
        "dev-change-me-in-production",
    }
)

_MIN_HMAC_SECRET_LEN = 32


def assert_license_hmac_secret_for_environment(settings: Settings) -> None:
    env = (settings.app_env or "development").strip().lower()
    secret = (settings.license_hmac_secret or "").strip()

    if env in {"development", "dev", "test", "testing", "local"}:
        if secret in _WEAK_HMAC_SECRETS or len(secret) < _MIN_HMAC_SECRET_LEN:
            logger.warning(
                "[STARTUP SECURITY] %s ortamında zayıf LICENSE_HMAC_SECRET kullanılıyor (geliştirme/test)",
                env,
            )
        return

    if env in {"production", "prod"}:
        if secret in _WEAK_HMAC_SECRETS or len(secret) < _MIN_HMAC_SECRET_LEN:
            raise RuntimeError(
                "LICENSE_HMAC_SECRET production ortamında en az 32 karakter olmalı ve "
                "varsayılan değer olmamalı."
            )
        return

    logger.warning("[STARTUP SECURITY] Bilinmeyen APP_ENV=%s — HMAC kontrolü atlandı", env)


def run_startup_security_checks(settings: Settings) -> None:
    assert_license_hmac_secret_for_environment(settings)

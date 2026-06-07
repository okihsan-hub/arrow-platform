"""PLATFORM-1 — production LICENSE_HMAC_SECRET guard."""
from __future__ import annotations

import pytest

from app.config import Settings, clear_settings_cache
from app.startup_checks import assert_license_hmac_secret_for_environment


DEFAULT_WEAK = "change-me-insecure-default-hmac-secret"


def test_production_default_hmac_secret_fails():
    settings = Settings(
        database_url="sqlite:///./data/test.db",
        jwt_secret_key="test-jwt",
        app_env="production",
        license_hmac_secret=DEFAULT_WEAK,
    )
    with pytest.raises(RuntimeError, match="LICENSE_HMAC_SECRET"):
        assert_license_hmac_secret_for_environment(settings)


def test_production_strong_hmac_secret_ok():
    settings = Settings(
        database_url="sqlite:///./data/test.db",
        jwt_secret_key="test-jwt",
        app_env="production",
        license_hmac_secret="x" * 32,
    )
    assert_license_hmac_secret_for_environment(settings)


def test_development_default_hmac_secret_allowed():
    settings = Settings(
        database_url="sqlite:///./data/test.db",
        jwt_secret_key="test-jwt",
        app_env="development",
        license_hmac_secret=DEFAULT_WEAK,
    )
    assert_license_hmac_secret_for_environment(settings)


def test_test_env_default_hmac_secret_allowed():
    settings = Settings(
        database_url="sqlite:///./data/test.db",
        jwt_secret_key="test-jwt",
        app_env="test",
        license_hmac_secret=DEFAULT_WEAK,
    )
    assert_license_hmac_secret_for_environment(settings)


def test_create_app_startup_production_weak_secret(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("LICENSE_HMAC_SECRET", DEFAULT_WEAK)
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./data/test_startup.db")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-jwt-key-for-startup-check")
    clear_settings_cache()

    from app.main import create_app

    try:
        with pytest.raises(RuntimeError, match="LICENSE_HMAC_SECRET"):
            create_app()
    finally:
        clear_settings_cache()

from __future__ import annotations

from app.config import clear_settings_cache, get_settings
from app.security import create_access_token, decode_token


def test_jwt_create_and_verify_same_secret():
    clear_settings_cache()
    secret_a = get_settings().jwt_secret_key

    token = create_access_token(subject="Admin@Arrowbilisim.com")
    assert decode_token(token) == "admin@arrowbilisim.com"

    clear_settings_cache()
    assert get_settings().jwt_secret_key == secret_a
    assert decode_token(token) == "admin@arrowbilisim.com"


def test_jwt_exp_is_int():
    from jose import jwt

    clear_settings_cache()
    settings = get_settings()
    token = create_access_token(subject="x@y.com")
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    assert isinstance(payload["exp"], int)
    assert isinstance(payload["iat"], int)

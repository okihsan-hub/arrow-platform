from __future__ import annotations

import logging
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

logger = logging.getLogger(__name__)

_BACKEND_ROOT = Path(__file__).resolve().parent.parent

_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


class Base(DeclarativeBase):
    pass


def get_engine() -> Engine:
    global _engine
    if _engine is not None:
        return _engine

    url = get_settings().database_url
    connect_args: dict = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        connect_args["timeout"] = 30
    elif url.startswith("postgresql"):
        connect_args["connect_timeout"] = 5

    _engine = create_engine(
        url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_timeout=5,
    )
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _session_factory


def __getattr__(name: str):
    if name == "engine":
        return get_engine()
    if name == "SessionLocal":
        return get_session_factory()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


def get_db() -> Generator[Session, None, None]:
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()


def _ensure_sqlite_directory(database_url: str) -> None:
    if not database_url.startswith("sqlite"):
        return
    raw = database_url.replace("sqlite:///", "")
    if not raw or raw.startswith(":"):
        return
    path = Path(raw)
    if not path.is_absolute():
        path = (_BACKEND_ROOT / raw).resolve()
    path.parent.mkdir(parents=True, exist_ok=True)


def ping_database() -> bool:
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.warning("[DATABASE] ping failed: %s", exc)
        return False


def init_db() -> None:
    from app import models  # noqa: F401

    settings = get_settings()
    _ensure_sqlite_directory(settings.database_url)
    Base.metadata.create_all(bind=get_engine(), checkfirst=True)
    logger.info("[DATABASE] create_all finished (checkfirst=True)")


def startup_database() -> None:
    settings = get_settings()
    url = settings.database_url
    _ensure_sqlite_directory(url)

    if url.startswith("sqlite"):
        init_db()
        return

    if settings.init_db_on_startup:
        init_db()
        return

    ping_database()

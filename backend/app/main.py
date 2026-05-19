from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth_routes import router as auth_router
from app.config import cors_origins_list, get_settings
from app.database import startup_database
from app.license_routes import admin_router as license_admin_router
from app.license_routes import customer_router
from app.license_routes import devices_router
from app.license_routes import public_router as license_public_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup bloklamaz; DB hazırlığı kısa ve güvenli."""
    logger.info("[STARTUP 1] loading settings")
    settings = get_settings()
    logger.info(
        "[STARTUP 1] settings ready dialect=%s init_db_on_startup=%s",
        settings.database_url.split("://")[0],
        settings.init_db_on_startup,
    )

    logger.info("[STARTUP 2] database preparing…")
    try:
        startup_database()
        logger.info("[STARTUP 2] database ready")
    except Exception as exc:
        logger.warning("[STARTUP 2] database skipped (non-fatal): %s", exc)

    logger.info("[STARTUP 3] routers ready")
    yield
    logger.info("[SHUTDOWN] complete")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Arrow Bilişim License Platform",
        description="Lisans yönetimi — license.arrowbilisim.com",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api = APIRouter(prefix="/api")
    api.include_router(auth_router)
    api.include_router(customer_router)
    api.include_router(license_admin_router)
    api.include_router(devices_router)
    api.include_router(license_public_router)

    @api.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "arrow-license-platform"}

    app.include_router(api)
    logger.info("[STARTUP DONE] application factory complete")
    return app


app = create_app()

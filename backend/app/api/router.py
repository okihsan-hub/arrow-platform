from fastapi import APIRouter

from app.api.routers import admin, auth, licenses_admin, licenses_customer, licenses_public, users


api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(admin.router)
api_router.include_router(licenses_admin.router)
api_router.include_router(licenses_customer.router)
api_router.include_router(licenses_public.router)


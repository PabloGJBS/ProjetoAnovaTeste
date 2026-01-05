from fastapi import APIRouter
from app.api.v1.endpoints.clients import router as clients_router
from app.api.v1.endpoints.titles import router as titles_router
from app.api.v1.endpoints.import_titles import router as import_router
from app.api.v1.endpoints.allocations import router as allocations_router
from app.api.v1.endpoints.auth import router as auth_router

api_router = APIRouter()
api_router.include_router(clients_router)
api_router.include_router(titles_router)
api_router.include_router(import_router)
api_router.include_router(allocations_router)
api_router.include_router(auth_router)

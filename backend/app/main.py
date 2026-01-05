from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.init_db import init_db
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield

tags_metadata = [
    {"name": "auth", "description": "Authentication and user management."},
    {"name": "clients", "description": "Clients CRUD and lookups."},
    {"name": "titles", "description": "Titles catalog endpoints."},
    {"name": "allocations", "description": "Allocations and portfolios."},
    {"name": "import", "description": "Admin-only import operations."},
    {"name": "health", "description": "Service health checks."},
]

app = FastAPI(
    title="Investment API",
    version="0.1.0",
    description=(
        "API for Projeto Financas. "
        "Admin endpoints require the X-ADMIN-KEY header."
    ),
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8001", "http://127.0.0.1:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get(
    "/health",
    tags=["health"],
    summary="Health check",
    description="Returns service health status.",
)
def health():
    return {"status": "ok"}

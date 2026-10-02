"""FastAPI application entry point."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .dependencies import get_engine
from .routers import auth, receipts, mileage, dashboard, export
from sqlmodel import SQLModel

def create_app() -> FastAPI:
    app = FastAPI(debug=False, title="Freelance Finance Tracker")
    # CORS configuration
    origins = []
    # Environment variable ALLOWED_ORIGINS can be comma-separated list
    env_origins = os.getenv("ALLOWED_ORIGINS", "")
    if env_origins:
        origins = [o.strip() for o in env_origins.split(",") if o.strip()]
    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    # Include routers
    app.include_router(auth.router)
    app.include_router(receipts.router, prefix="/receipts", tags=["receipts"])
    app.include_router(mileage.router, prefix="/mileage", tags=["mileage"])
    app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
    app.include_router(export.router, prefix="/export", tags=["export"])

    @app.on_event("startup")
    async def on_startup():
        # create tables
        engine = get_engine()
        SQLModel.metadata.create_all(engine)

    return app

app = create_app()

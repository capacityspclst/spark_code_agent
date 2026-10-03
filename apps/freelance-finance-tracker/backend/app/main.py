"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import config, database
from .routers import auth, receipts, mileage, dashboard, export

app = FastAPI(title="Freelance Finance Tracker API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(receipts.router)
app.include_router(mileage.router)
app.include_router(dashboard.router)
app.include_router(export.router)

# Create DB tables on startup
@app.on_event("startup")
def on_startup():
    database.Base.metadata.create_all(bind=database.engine)

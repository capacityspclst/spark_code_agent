"""FastAPI application entry point."""

from fastapi import FastAPI

from .database import engine, Base
from .routers import auth, receipts, mileage, dashboard, export

app = FastAPI(title="FinTrack API")

# Include routers
app.include_router(auth.router)
app.include_router(receipts.router)
app.include_router(mileage.router)
app.include_router(dashboard.router)
app.include_router(export.router)

# Create database tables on startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

import os
from fastapi import FastAPI
from .routers import auth as auth_router
from .routers import upload as upload_router

# Ensure the required env var is set (auth module already checks, but double‑check early)
if not os.getenv("JWT_SECRET_KEY"):
    raise RuntimeError("JWT_SECRET_KEY environment variable must be set")

app = FastAPI()

# Include routers
app.include_router(auth_router.router)
app.include_router(upload_router.router)

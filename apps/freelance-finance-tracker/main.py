"""FastAPI application entry point.
Sets up the FastAPI app, includes routers, and creates the database tables.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth_router, transaction_router

# Create all tables at import time.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance Tracker")

# CORS: allow only http://localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(transaction_router)

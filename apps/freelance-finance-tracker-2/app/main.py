import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .routers import auth as auth_router
from .routers import upload as upload_router
from .limit import limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

# Ensure the required env var is set (auth module already checks, but double‑check early)
if not os.getenv("JWT_SECRET_KEY"):
    raise RuntimeError("JWT_SECRET_KEY environment variable must be set")

app = FastAPI()

# Attach limiter to app state
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# Exception handler for rate limiting
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

# Include routers
app.include_router(auth_router.router)
app.include_router(upload_router.router)

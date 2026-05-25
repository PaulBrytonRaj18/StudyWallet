import logging
import signal
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, subjects, chapters, resources, pdfs, notes, search, analytics
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.middleware.error_handler import (
    validation_exception_handler,
    http_exception_handler,
    general_exception_handler,
    db_enum_exception_handler,
)

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s %(levelname)-8s [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("studywallet")

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

logger.info("Starting StudyWallet in %s mode", "production" if settings.PRODUCTION else "development")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    from app.constants.enums import check_enum_consistency
    check_enum_consistency(engine)

    yield
    logger.info("Shutting down gracefully...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Personal Study Management Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    contact={"name": "StudyWallet Team", "url": "https://studywallet.app"},
    license_info={"name": "MIT", "identifier": "MIT"},
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)

from sqlalchemy.exc import DataError
app.add_exception_handler(DataError, db_enum_exception_handler)

app.add_exception_handler(Exception, general_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
    max_age=600,
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(LoggingMiddleware)

app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(chapters.router)
app.include_router(resources.router)
app.include_router(pdfs.router)
app.include_router(notes.router)
app.include_router(search.router)
app.include_router(analytics.router)


@app.get("/api/health")
def health_check():
    db_ok = False
    try:
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "version": settings.VERSION,
        "app": settings.APP_NAME,
        "database": "connected" if db_ok else "disconnected",
        "environment": "production" if settings.PRODUCTION else "development",
    }


def handle_signal(sig, frame):
    logger.info("Received signal %s, shutting down...", sig)
    sys.exit(0)


signal.signal(signal.SIGTERM, handle_signal)
signal.signal(signal.SIGINT, handle_signal)

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.settings import settings
from app.api.v1.router import router as api_router
from app.core.logging import logging_middleware
from app.middleware.rate_limit import rate_limit

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App startup / shutdown events."""
    logger.info("🧠 Consensus Engine starting up...")
    # Add DB init here later once models are established
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} ready!")
    yield
    logger.info("👋 Consensus Engine shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Consensus Engine — Trusted Knowledge Infrastructure. "
        "A trust layer for AI-generated knowledge, enabling reliable learning, "
        "coding, and decision support across domains through multi-model consensus verification."
    ),
    lifespan=lifespan,
    dependencies=[Depends(rate_limit)]
)

app.middleware("http")(logging_middleware)

# ── CORS ──────────────────────────────────────────────────────────────
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global error handler ─────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            }
        },
    )


# ── Routers ───────────────────────────────────────────────────────────
app.include_router(api_router)


# ── Health check ──────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }

@app.get("/")
async def root():
    return {
        "name": "🧠 Consensus Engine — Trusted Knowledge Infrastructure",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }

"""FastAPI main application entrypoint for SentiScope AI."""
import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from backend.app.core.config import settings
from backend.app.core.errors import (
    AppException, app_exception_handler,
    validation_exception_handler, generic_exception_handler
)
from backend.app.db.init_db import init_db
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.analyze import router as analyze_router
from backend.app.api.v1.analytics import router as analytics_router
from backend.app.api.v1.models import router as models_router
from backend.app.api.v1.history import router as history_router
from backend.app.api.v1.reports import router as reports_router
from backend.app.api.v1.datasets import router as datasets_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="Production AI Sentiment Analysis & Social Media Intelligence Platform",
        version="2.0.0",
        docs_url="/api/docs" if settings.debug else None,
        redoc_url="/api/redoc" if settings.debug else None,
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Request ID and Latency Middleware
    @app.middleware("http")
    async def request_id_and_timing_middleware(request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-MS"] = f"{process_time:.2f}"
        return response

    # Exception Handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    if not settings.debug:
        app.add_exception_handler(Exception, generic_exception_handler)

    # Mount Routers under /api/v1
    app.include_router(health_router, prefix=settings.api_v1_prefix)
    app.include_router(analyze_router, prefix=settings.api_v1_prefix)
    app.include_router(analytics_router, prefix=settings.api_v1_prefix)
    app.include_router(models_router, prefix=settings.api_v1_prefix)
    app.include_router(history_router, prefix=settings.api_v1_prefix)
    app.include_router(reports_router, prefix=settings.api_v1_prefix)
    app.include_router(datasets_router, prefix=settings.api_v1_prefix)

    # Mount compiled React frontend if present
    frontend_dist = settings.data_dir.parent / "frontend" / "dist"
    if frontend_dist.exists():
        from fastapi.staticfiles import StaticFiles
        app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")

    # Startup event: initialize DB tables and seeds
    @app.on_event("startup")
    def on_startup():
        init_db()

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.api_host, port=settings.api_port, reload=settings.debug)

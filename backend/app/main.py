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
from backend.app.api.v1.dashboard import router as dashboard_router


class TimingAndRequestIdMiddleware:
    """Pure ASGI middleware for X-Request-ID and X-Response-Time-MS header injection."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        req_id = headers.get(b"x-request-id", b"").decode("latin-1")
        if not req_id:
            req_id = str(uuid.uuid4())

        scope.setdefault("state", {})["request_id"] = req_id
        start_time = time.time()

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                process_time = (time.time() - start_time) * 1000
                headers_list = list(message.get("headers", []))
                headers_list.append((b"x-request-id", req_id.encode("latin-1")))
                headers_list.append((b"x-response-time-ms", f"{process_time:.2f}".encode("latin-1")))
                message = dict(message)
                message["headers"] = headers_list
            await send(message)

        await self.app(scope, receive, send_wrapper)


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

    # Request ID and Latency Middleware (Pure ASGI to prevent AnyIO stream deadlocks in tests)
    app.add_middleware(TimingAndRequestIdMiddleware)

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
    app.include_router(dashboard_router, prefix=settings.api_v1_prefix)

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

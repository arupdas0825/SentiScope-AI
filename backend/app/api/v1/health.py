"""Health and readiness check endpoints."""
from fastapi import APIRouter
from backend.app.ml.registry import model_registry

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    """Truthful service health and model status check."""
    loaded_models = list(model_registry._loaded_engines.keys())
    return {
        "status": "healthy",
        "service": "SentiScope AI API",
        "version": "2.0.0",
        "loaded_models": loaded_models,
        "default_model": "tfidf-logreg"
    }


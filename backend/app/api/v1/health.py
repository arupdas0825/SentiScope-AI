"""Health and readiness check endpoints."""
import sys
import time
from fastapi import APIRouter
from backend.app.ml.registry import model_registry

router = APIRouter(tags=["Health"])

START_TIME = time.time()


@router.get("/health")
def get_health():
    """Truthful service health and deep subsystem status check."""
    loaded_models = list(model_registry._loaded_engines.keys())
    all_models = [m["model_id"] for m in model_registry.list_models()]
    uptime_sec = round(time.time() - START_TIME, 1)

    return {
        "status": "healthy",
        "service": "SentiScope AI API",
        "version": "2.0.0",
        "python_version": sys.version.split()[0],
        "uptime_seconds": uptime_sec,
        "default_model": "tfidf-logreg",
        "registered_models": all_models,
        "loaded_models": loaded_models,
        "capabilities": [
            "sentiment_classification",
            "scientific_model_comparison",
            "transformer_inference",
            "explainable_ai_shap_lime",
            "aspect_based_sentiment_analysis",
            "realworld_data_integration",
            "multilingual_bengali_hindi"
        ]
    }


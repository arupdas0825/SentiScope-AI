"""Model Registry and Evaluation router."""
from pathlib import Path
from typing import Dict, List
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.app.ml.registry import model_registry

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("", response_model=List[Dict])
def list_models():
    """List all registered sentiment models with their types and evaluation status."""
    return model_registry.list_models()


@router.get("/{model_id}/metrics")
def get_model_metrics(model_id: str):
    """Retrieve full evaluation report and confusion matrix for a trained model."""
    metrics = model_registry.get_metrics(model_id)
    if not metrics:
        raise HTTPException(status_code=404, detail=f"No evaluation metrics found for model '{model_id}'")
    return metrics


@router.get("/{model_id}/confusion-matrix-image")
def get_confusion_matrix_image(model_id: str):
    """Serve the generated Confusion Matrix PNG plot."""
    img_path = model_registry.artifacts_dir / model_id / "confusion_matrix.png"
    if not img_path.exists():
        raise HTTPException(status_code=404, detail="Confusion matrix plot not found")
    return FileResponse(img_path, media_type="image/png")


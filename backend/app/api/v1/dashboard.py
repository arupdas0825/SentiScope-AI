"""Dashboard summary endpoint aggregating analyses and model evaluations."""
from typing import Dict, List, Any
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import Prediction
from backend.app.ml.registry import model_registry

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Aggregate KPIs, sentiment breakdown, and trained model metrics."""
    total_count = db.query(Prediction).count()

    label_counts = dict(
        db.query(Prediction.label, func.count(Prediction.id))
        .group_by(Prediction.label)
        .all()
    )
    pos = label_counts.get("positive", 0)
    neu = label_counts.get("neutral", 0)
    neg = label_counts.get("negative", 0)

    pos_pct = round((pos / total_count * 100), 2) if total_count > 0 else 0.0
    neu_pct = round((neu / total_count * 100), 2) if total_count > 0 else 0.0
    neg_pct = round((neg / total_count * 100), 2) if total_count > 0 else 0.0

    # Models metrics
    models_summary = []
    registered = model_registry.list_models()
    for m in registered:
        metrics = m.get("metrics")
        if metrics:
            models_summary.append({
                "id": m.get("model_id"),
                "name": m.get("name"),
                "accuracy": round(metrics.get("accuracy", 0.0) * 100, 2),
                "macro_f1": round(metrics.get("macro_f1", 0.0), 4),
            })

    return {
        "total_analyses": total_count,
        "positive_count": pos,
        "neutral_count": neu,
        "negative_count": neg,
        "positive_pct": pos_pct,
        "neutral_pct": neu_pct,
        "negative_pct": neg_pct,
        "models": models_summary,
    }

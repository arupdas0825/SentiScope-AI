"""Schemas for model registry and evaluation."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class MetricReport(BaseModel):
    precision: float
    recall: float
    f1_score: float
    support: int


class ModelEvaluationMetrics(BaseModel):
    model_id: str
    model_version: str
    dataset_name: str
    accuracy: float
    macro_f1: float
    weighted_f1: float
    per_class: Dict[str, MetricReport]
    confusion_matrix: List[List[int]]
    classes: List[str]
    training_time_seconds: Optional[float] = None
    evaluated_at: str


class ModelRegistryItem(BaseModel):
    id: str
    model_id: str
    kind: str  # "trained", "lexicon", "pretrained"
    version: str
    supports_neutral: bool
    classes: List[str]
    is_default: bool = False
    metrics: Optional[ModelEvaluationMetrics] = None


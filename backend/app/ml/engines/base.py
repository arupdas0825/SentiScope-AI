"""Base sentiment engine protocol and data structures."""
from typing import Any, Dict, List, Literal, Optional, Sequence
from pydantic import BaseModel
import numpy as np


class EnginePrediction(BaseModel):
    label: str  # "positive", "neutral", "negative"
    confidence: float
    score: Optional[float] = None
    probabilities: Optional[Dict[str, float]] = None
    explanations: Optional[List[Dict[str, Any]]] = None


class BaseEngine:
    id: str
    kind: str  # "trained", "lexicon", "pretrained"
    version: str
    classes: List[str]
    supports_neutral: bool = True

    def predict(self, texts: Sequence[str]) -> List[EnginePrediction]:
        raise NotImplementedError

    def predict_proba(self, texts: Sequence[str]) -> Optional[np.ndarray]:
        raise NotImplementedError


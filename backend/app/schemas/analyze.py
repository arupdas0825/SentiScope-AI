"""Schemas for sentiment analysis requests and responses."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SingleTextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Input text to analyze")
    model_id: Optional[str] = Field("tfidf-logreg", description="Engine ID to use")
    explain: Optional[bool] = Field(False, description="Whether to include token-level attributions")
    language: Optional[str] = Field("auto", description="Language: auto, en, bn, hi")


class Probabilities(BaseModel):
    negative: float
    neutral: float
    positive: float


class ExplanationToken(BaseModel):
    token: str
    weight: float
    sentiment: str  # "positive", "negative", "neutral"


class PredictionResult(BaseModel):
    label: str  # "positive", "negative", "neutral"
    confidence: float
    score: Optional[float] = None
    probabilities: Optional[Probabilities] = None
    model_id: str
    model_version: str
    latency_ms: float
    explanations: Optional[List[ExplanationToken]] = None
    language: Optional[Dict[str, str]] = None
    influential_words: Optional[List[Dict[str, Any]]] = None
    explanation_summary: Optional[str] = None


class BulkTextRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=500, description="List of texts to analyze")
    model_id: Optional[str] = Field("tfidf-logreg", description="Engine ID to use")


class BulkItemResult(BaseModel):
    index: int
    text: str
    label: str
    confidence: float
    score: Optional[float] = None
    probabilities: Optional[Probabilities] = None


class SentimentCounts(BaseModel):
    positive: int = 0
    neutral: int = 0
    negative: int = 0
    total: int = 0


class BulkAnalysisResponse(BaseModel):
    results: List[BulkItemResult]
    summary: SentimentCounts
    model_id: str
    model_version: str
    run_id: Optional[str] = None
    total_time_ms: float


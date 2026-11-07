"""Text sentiment analysis router."""
from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.analyze import (
    SingleTextRequest, PredictionResult,
    BulkTextRequest, BulkAnalysisResponse
)
from backend.app.services.inference import InferenceService
from backend.app.services.explainability import ExplainabilityService
from backend.app.services.absa import AspectBasedSentimentService

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("", response_model=PredictionResult)
def analyze_single_text(request: SingleTextRequest, db: Session = Depends(get_db)):
    """Classify sentiment of a single comment or review with multilingual & XAI support."""
    return InferenceService.analyze_single(request, db)


@router.post("/bulk", response_model=BulkAnalysisResponse)
def analyze_bulk_texts(request: BulkTextRequest, db: Session = Depends(get_db)):
    """Classify sentiment across a batch of texts (up to 500 lines)."""
    return InferenceService.analyze_bulk(request, db)


@router.post("/explain")
def explain_prediction(request: SingleTextRequest):
    """Generate SHAP/LIME style token-level feature attributions and decision explanations."""
    model_id = request.model_id or "tfidf-logreg"
    return ExplainabilityService.explain_text(request.text, model_id=model_id)


@router.post("/aspects")
def analyze_aspects(request: SingleTextRequest):
    """Aspect-Based Sentiment Analysis (ABSA) for camera, battery, display, UI, and support."""
    model_id = request.model_id or "tfidf-logreg"
    return AspectBasedSentimentService.analyze_aspects(request.text, model_id=model_id)


@router.get("/languages")
def list_supported_languages():
    """List supported multilingual analysis languages."""
    return [
        {"code": "auto", "name": "Auto-Detect Script", "flag": "🌐", "description": "Automatically identifies English, Bengali, or Hindi script"},
        {"code": "en", "name": "English", "flag": "🇬🇧", "description": "English language (TweetEval & SST-2 benchmarked models)"},
        {"code": "bn", "name": "Bengali (বাংলা)", "flag": "🇧🇩", "description": "Native Bengali sentiment lexicon with contextual negation heuristics"},
        {"code": "hi", "name": "Hindi (हिन्दी)", "flag": "🇮🇳", "description": "Devanagari Hindi polarity lexicon with intensifier scaling"}
    ]



"""Text sentiment analysis router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.analyze import (
    SingleTextRequest, PredictionResult,
    BulkTextRequest, BulkAnalysisResponse
)
from backend.app.services.inference import InferenceService

router = APIRouter(prefix="/analyze", tags=["Analysis"])


@router.post("", response_model=PredictionResult)
def analyze_single_text(request: SingleTextRequest, db: Session = Depends(get_db)):
    """Classify sentiment of a single comment or review."""
    return InferenceService.analyze_single(request, db)


@router.post("/bulk", response_model=BulkAnalysisResponse)
def analyze_bulk_texts(request: BulkTextRequest, db: Session = Depends(get_db)):
    """Classify sentiment across a batch of texts (up to 500 lines)."""
    return InferenceService.analyze_bulk(request, db)


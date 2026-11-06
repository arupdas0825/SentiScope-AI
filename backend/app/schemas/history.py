"""Schemas for analysis history and past runs."""
import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class AnalysisRecordItem(BaseModel):
    id: int
    run_id: str
    text_preview: str
    label: str
    confidence: float
    platform: Optional[str] = None
    created_at: str


class HistoryListResponse(BaseModel):
    records: List[AnalysisRecordItem]
    total: int
    page: int
    page_size: int


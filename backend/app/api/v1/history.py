"""Analysis History router."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.history import HistoryListResponse
from backend.app.services.history import HistoryService

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=HistoryListResponse)
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sentiment: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve historical analysis records with pagination and filters."""
    return HistoryService.list_history(db, page=page, page_size=page_size, sentiment=sentiment, query_text=q)


@router.delete("/{record_id}")
def delete_history_item(record_id: int, db: Session = Depends(get_db)):
    """Delete an analysis record from history."""
    success = HistoryService.delete_record(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"status": "success", "deleted_id": record_id}


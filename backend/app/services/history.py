"""History service for managing past sentiment analysis records."""
from typing import Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session

from backend.app.db.models import Prediction
from backend.app.schemas.history import HistoryListResponse, AnalysisRecordItem


class HistoryService:
    @staticmethod
    def list_history(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        sentiment: Optional[str] = None,
        query_text: Optional[str] = None
    ) -> HistoryListResponse:
        q = db.query(Prediction)
        if sentiment:
            q = q.filter(Prediction.label == sentiment.lower())
        if query_text:
            q = q.filter(Prediction.text_preview.ilike(f"%{query_text}%"))

        total = q.count()
        rows = (
            q.order_by(desc(Prediction.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        items = [
            AnalysisRecordItem(
                id=r.id,
                run_id=r.run_id,
                text_preview=r.text_preview or "",
                label=r.label,
                confidence=round(r.confidence or 0.0, 3),
                platform=r.platform,
                created_at=r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else ""
            ) for r in rows
        ]

        return HistoryListResponse(
            records=items,
            total=total,
            page=page,
            page_size=page_size
        )

    @staticmethod
    def delete_record(db: Session, record_id: int) -> bool:
        record = db.query(Prediction).filter(Prediction.id == record_id).first()
        if record:
            db.delete(record)
            db.commit()
            return True
        return False


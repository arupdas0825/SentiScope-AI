"""Report generation and export service with CSV formula injection sanitization."""
import csv
import io
import json
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.db.models import Prediction


def sanitize_csv_cell(value: str) -> str:
    """Neutralize formula injection by prefixing formula trigger characters with a quote."""
    if not value:
        return ""
    str_val = str(value)
    if str_val and str_val[0] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + str_val
    return str_val


class ReportsService:
    @staticmethod
    def export_csv(db: Session, run_id: Optional[str] = None) -> str:
        q = db.query(Prediction)
        if run_id:
            q = q.filter(Prediction.run_id == run_id)

        rows = q.order_by(Prediction.created_at.desc()).limit(10000).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Timestamp", "Sentiment", "Confidence", "Platform", "Text Preview"])

        for r in rows:
            writer.writerow([
                r.id,
                r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
                r.label,
                r.confidence or "",
                sanitize_csv_cell(r.platform or "General"),
                sanitize_csv_cell(r.text_preview or "")
            ])

        return output.getvalue()

    @staticmethod
    def export_json(db: Session, run_id: Optional[str] = None) -> str:
        q = db.query(Prediction)
        if run_id:
            q = q.filter(Prediction.run_id == run_id)

        rows = q.order_by(Prediction.created_at.desc()).limit(5000).all()
        data = [
            {
                "id": r.id,
                "timestamp": r.created_at.isoformat() if r.created_at else None,
                "sentiment": r.label,
                "confidence": r.confidence,
                "platform": r.platform or "General",
                "text_preview": r.text_preview
            }
            for r in rows
        ]
        return json.dumps(data, indent=2)


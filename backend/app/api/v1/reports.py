"""Reports and Exports router."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.services.reports import ReportsService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/export/csv")
def export_csv_report(
    run_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Export analysis records as a sanitized CSV file."""
    csv_content = ReportsService.export_csv(db, run_id=run_id)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="sentiscope_analysis_report.csv"'}
    )


@router.get("/export/json")
def export_json_report(
    run_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Export analysis records as structured JSON."""
    json_content = ReportsService.export_json(db, run_id=run_id)
    return Response(
        content=json_content,
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="sentiscope_analysis_report.json"'}
    )


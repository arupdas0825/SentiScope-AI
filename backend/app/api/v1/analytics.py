"""Dynamic analytics and aggregated insights router."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.analytics import DashboardOverviewResponse, TrendPoint
from backend.app.services.analytics import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_analytics_overview(
    run_id: Optional[str] = Query(None, description="Optional run ID filter"),
    db: Session = Depends(get_db)
):
    """Retrieve full dashboard KPIs, distribution, time series trends, and top keywords."""
    return AnalyticsService.get_dashboard_overview(db, run_id=run_id)


@router.get("/trends", response_model=List[TrendPoint])
def get_sentiment_trends(
    days: int = Query(7, ge=1, le=365, description="Number of days lookback window"),
    db: Session = Depends(get_db)
):
    """Retrieve daily sentiment trends for the given day window."""
    return AnalyticsService.get_trends(db, days=days)



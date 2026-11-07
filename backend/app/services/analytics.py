"""Analytics service for aggregating sentiment metrics, trends, and keywords."""
from collections import Counter
import datetime
from typing import Dict, List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.db.models import Prediction, ModelVersion
from backend.app.schemas.analytics import (
    DashboardOverviewResponse, SentimentKPICard, DistributionItem,
    TrendPoint, PlatformBreakdownItem, KeywordItem
)
from ml.nlp.preprocessor import tokenize, STOPWORDS


class AnalyticsService:
    @staticmethod
    def get_dashboard_overview(db: Session, run_id: Optional[str] = None) -> DashboardOverviewResponse:
        query = db.query(Prediction)
        if run_id:
            query = query.filter(Prediction.run_id == run_id)

        total_count = query.count()

        if total_count == 0:
            return DashboardOverviewResponse(
                kpis=SentimentKPICard(
                    total_records=0,
                    positive_count=0,
                    positive_pct=0.0,
                    neutral_count=0,
                    neutral_pct=0.0,
                    negative_count=0,
                    negative_pct=0.0,
                    avg_confidence=0.0,
                    active_model="TF-IDF + Logistic Regression (v1.0)"
                ),
                distribution=[],
                trends=[],
                platforms=[],
                top_keywords=[],
                has_data=False
            )

        # Count per label
        label_counts = dict(
            db.query(Prediction.label, func.count(Prediction.id))
            .filter(Prediction.run_id == run_id if run_id else True)
            .group_by(Prediction.label)
            .all()
        )
        pos = label_counts.get("positive", 0)
        neu = label_counts.get("neutral", 0)
        neg = label_counts.get("negative", 0)

        avg_conf = db.query(func.avg(Prediction.confidence)).scalar() or 0.0

        kpis = SentimentKPICard(
            total_records=total_count,
            positive_count=pos,
            positive_pct=round((pos / total_count) * 100, 1),
            neutral_count=neu,
            neutral_pct=round((neu / total_count) * 100, 1),
            negative_count=neg,
            negative_pct=round((neg / total_count) * 100, 1),
            avg_confidence=round(float(avg_conf), 3),
            active_model="TF-IDF + Logistic Regression (v1.0)"
        )

        distribution = [
            DistributionItem(name="Positive", value=pos, color="#159A68"),
            DistributionItem(name="Neutral", value=neu, color="#D18A24"),
            DistributionItem(name="Negative", value=neg, color="#D94B55"),
        ]

        # Trends (group by item_date or created_at day)
        date_col = func.date(func.coalesce(Prediction.item_date, Prediction.created_at))
        trend_rows = (
            db.query(
                date_col.label("day"),
                Prediction.label,
                func.count(Prediction.id)
            )
            .group_by("day", Prediction.label)
            .order_by("day")
            .all()
        )

        trend_map: Dict[str, Dict[str, int]] = {}
        for day_str, label, count in trend_rows:
            if not day_str:
                continue
            if day_str not in trend_map:
                trend_map[day_str] = {"positive": 0, "neutral": 0, "negative": 0}
            trend_map[day_str][label] = count

        trends = []
        for day_str, counts in sorted(trend_map.items()):
            tot = counts["positive"] + counts["neutral"] + counts["negative"]
            trends.append(TrendPoint(
                date=day_str,
                positive=counts["positive"],
                neutral=counts["neutral"],
                negative=counts["negative"],
                total=tot
            ))

        # Platforms breakdown
        platform_rows = (
            db.query(
                func.coalesce(Prediction.platform, "General").label("plat"),
                Prediction.label,
                func.count(Prediction.id)
            )
            .group_by("plat", Prediction.label)
            .all()
        )

        plat_map: Dict[str, Dict[str, int]] = {}
        for plat, label, count in platform_rows:
            if plat not in plat_map:
                plat_map[plat] = {"positive": 0, "neutral": 0, "negative": 0}
            plat_map[plat][label] = count

        platforms = []
        for plat, counts in plat_map.items():
            tot = counts["positive"] + counts["neutral"] + counts["negative"]
            platforms.append(PlatformBreakdownItem(
                platform=plat,
                positive=counts["positive"],
                neutral=counts["neutral"],
                negative=counts["negative"],
                total=tot,
                pos_pct=round((counts["positive"] / tot * 100), 1) if tot > 0 else 0.0
            ))

        # Top keywords per sentiment
        predictions = db.query(Prediction.text_preview, Prediction.label).limit(500).all()
        kw_counters: Dict[str, Counter] = {"positive": Counter(), "neutral": Counter(), "negative": Counter()}

        for text, label in predictions:
            if not text:
                continue
            tokens = [t for t in tokenize(text) if t not in STOPWORDS and len(t) > 2]
            kw_counters[label].update(tokens)

        top_keywords = []
        for sentiment, counter in kw_counters.items():
            for word, cnt in counter.most_common(5):
                top_keywords.append(KeywordItem(word=word, count=cnt, sentiment=sentiment))

        return DashboardOverviewResponse(
            kpis=kpis,
            distribution=distribution,
            trends=trends,
            platforms=platforms,
            top_keywords=top_keywords,
            has_data=True
        )

    @staticmethod
    def get_trends(db: Session, days: int = 7) -> List[TrendPoint]:
        """Aggregate daily sentiment counts over the specified lookback days."""
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        date_col = func.date(func.coalesce(Prediction.item_date, Prediction.created_at))
        trend_rows = (
            db.query(
                date_col.label("day"),
                Prediction.label,
                func.count(Prediction.id)
            )
            .filter(func.coalesce(Prediction.item_date, Prediction.created_at) >= cutoff)
            .group_by("day", Prediction.label)
            .order_by("day")
            .all()
        )

        trend_map: Dict[str, Dict[str, int]] = {}
        for day_str, label, count in trend_rows:
            if not day_str:
                continue
            day_key = str(day_str)
            if day_key not in trend_map:
                trend_map[day_key] = {"positive": 0, "neutral": 0, "negative": 0}
            trend_map[day_key][label] = count

        trends = []
        for day_str, counts in sorted(trend_map.items()):
            tot = counts["positive"] + counts["neutral"] + counts["negative"]
            trends.append(TrendPoint(
                date=day_str,
                positive=counts["positive"],
                neutral=counts["neutral"],
                negative=counts["negative"],
                total=tot
            ))
        return trends



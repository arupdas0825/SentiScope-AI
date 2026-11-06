"""Schemas for dynamic analytics and dashboard insights."""
from typing import Dict, List, Optional
from pydantic import BaseModel


class SentimentKPICard(BaseModel):
    total_records: int
    positive_count: int
    positive_pct: float
    neutral_count: int
    neutral_pct: float
    negative_count: int
    negative_pct: float
    avg_confidence: float
    active_model: str


class DistributionItem(BaseModel):
    name: str
    value: int
    color: str


class TrendPoint(BaseModel):
    date: str
    positive: int
    neutral: int
    negative: int
    total: int


class PlatformBreakdownItem(BaseModel):
    platform: str
    positive: int
    neutral: int
    negative: int
    total: int
    pos_pct: float


class KeywordItem(BaseModel):
    word: str
    count: int
    sentiment: str


class DashboardOverviewResponse(BaseModel):
    kpis: SentimentKPICard
    distribution: List[DistributionItem]
    trends: List[TrendPoint]
    platforms: List[PlatformBreakdownItem]
    top_keywords: List[KeywordItem]
    has_data: bool


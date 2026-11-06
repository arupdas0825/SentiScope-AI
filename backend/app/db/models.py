"""SQLAlchemy ORM models for SentiScope AI."""
import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False, default="user_upload")
    license = Column(String(100), nullable=False, default="proprietary_or_private")
    sha256 = Column(String(64), nullable=False)
    n_rows = Column(Integer, nullable=False, default=0)
    column_map = Column(JSON, nullable=True)
    class_distribution = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    analysis_runs = relationship("AnalysisRun", back_populates="dataset", cascade="all, delete-orphan")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(120), primary_key=True)  # e.g., "tfidf-logreg-v1"
    model_id = Column(String(64), nullable=False)  # "tfidf-logreg", "keras-lstm", "vader"
    kind = Column(String(32), nullable=False)  # "trained", "lexicon", "pretrained"
    version = Column(String(64), nullable=False)
    metrics_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    analysis_runs = relationship("AnalysisRun", back_populates="model_version")


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)
    model_version_id = Column(String(120), ForeignKey("model_versions.id"), nullable=True)
    source_type = Column(String(32), nullable=False, default="single")  # "single", "bulk", "csv"
    params = Column(JSON, nullable=True)
    summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    dataset = relationship("Dataset", back_populates="analysis_runs")
    model_version = relationship("ModelVersion", back_populates="analysis_runs")
    predictions = relationship("Prediction", back_populates="run", cascade="all, delete-orphan")
    job = relationship("Job", back_populates="run", uselist=False, cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    row_index = Column(Integer, nullable=False, default=0)
    text_preview = Column(String(500), nullable=True)
    text_hash = Column(String(64), nullable=True, index=True)
    label = Column(String(16), nullable=False, index=True)  # "positive", "negative", "neutral"
    p_neg = Column(Float, nullable=True)
    p_neu = Column(Float, nullable=True)
    p_pos = Column(Float, nullable=True)
    score = Column(Float, nullable=True)  # Rule-based score or max prob
    confidence = Column(Float, nullable=True)  # Probability (0-1) or score strength
    item_date = Column(DateTime, nullable=True, index=True)
    platform = Column(String(64), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    run = relationship("AnalysisRun", back_populates="predictions")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=True)
    status = Column(String(32), nullable=False, default="queued")  # "queued", "running", "succeeded", "failed"
    progress = Column(Float, nullable=False, default=0.0)
    error_code = Column(String(64), nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    run = relationship("AnalysisRun", back_populates="job")


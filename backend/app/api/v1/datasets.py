"""CSV Dataset upload, validation, and batch analysis router."""
import hashlib
import io
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
import pandas as pd
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.errors import ValidationFailed, PayloadTooLarge
from backend.app.db.models import Dataset, AnalysisRun, Prediction
from backend.app.db.session import get_db
from backend.app.ml.registry import model_registry

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("/upload")
async def upload_and_analyze_csv(
    file: UploadFile = File(...),
    text_column: Optional[str] = Form(None),
    model_id: Optional[str] = Form("tfidf-logreg"),
    db: Session = Depends(get_db)
):
    """Upload a CSV dataset, validate columns, and run sentiment analysis."""
    if not file.filename.lower().endswith(".csv"):
        raise ValidationFailed("Only CSV (.csv) files are supported.")

    content = await file.read()
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise PayloadTooLarge(f"File size exceeds maximum allowed {settings.max_upload_mb} MB limit.")

    sha256 = hashlib.sha256(content).hexdigest()

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise ValidationFailed(f"Malformed CSV file. Could not parse: {str(e)}")

    if df.empty:
        raise ValidationFailed("Uploaded CSV file contains no data.")

    # Auto-detect text column if not specified
    if not text_column or text_column not in df.columns:
        possible_text_cols = [c for c in df.columns if c.lower() in ("text", "comment", "review", "content", "body", "tweet", "message")]
        if possible_text_cols:
            text_column = possible_text_cols[0]
        else:
            text_column = df.columns[0]

    # Check for optional date and platform columns
    date_col = next((c for c in df.columns if c.lower() in ("date", "created_at", "timestamp", "time")), None)
    platform_col = next((c for c in df.columns if c.lower() in ("platform", "channel", "source")), None)

    # Clean text column
    texts = df[text_column].dropna().astype(str).tolist()
    if not texts:
        raise ValidationFailed("No valid text found in selected text column.")

    # Limit to max rows
    texts = texts[:settings.max_csv_rows]

    # Save dataset entity
    dataset = Dataset(
        id=str(uuid.uuid4()),
        name=file.filename,
        source="csv_upload",
        license="user_provided",
        sha256=sha256,
        n_rows=len(texts),
        column_map={"text": text_column, "date": date_col, "platform": platform_col}
    )
    db.add(dataset)
    db.flush()

    # Run inference
    engine = model_registry.get_engine(model_id or "tfidf-logreg")
    preds = engine.predict(texts)

    run = AnalysisRun(
        id=str(uuid.uuid4()),
        dataset_id=dataset.id,
        model_version_id=f"{engine.id}-v1",
        source_type="csv",
        params={"filename": file.filename, "text_column": text_column, "rows": len(texts)}
    )
    db.add(run)
    db.flush()

    counts = {"positive": 0, "neutral": 0, "negative": 0}
    for idx, (t, p) in enumerate(zip(texts, preds)):
        counts[p.label] = counts.get(p.label, 0) + 1
        item_date = None
        if date_col and idx < len(df) and pd.notna(df.iloc[idx][date_col]):
            try:
                item_date = pd.to_datetime(df.iloc[idx][date_col]).to_pydatetime()
            except Exception:
                pass

        platform_val = None
        if platform_col and idx < len(df) and pd.notna(df.iloc[idx][platform_col]):
            platform_val = str(df.iloc[idx][platform_col])

        db.add(Prediction(
            run_id=run.id,
            row_index=idx,
            text_preview=t[:300],
            text_hash=hashlib.sha256(t.encode("utf-8")).hexdigest(),
            label=p.label,
            confidence=p.confidence,
            score=p.score,
            p_neg=p.probabilities.get("negative") if p.probabilities else None,
            p_neu=p.probabilities.get("neutral") if p.probabilities else None,
            p_pos=p.probabilities.get("positive") if p.probabilities else None,
            item_date=item_date,
            platform=platform_val
        ))

    run.summary = counts
    dataset.class_distribution = counts
    db.commit()

    return {
        "status": "success",
        "dataset_id": dataset.id,
        "run_id": run.id,
        "filename": file.filename,
        "rows_processed": len(texts),
        "text_column": text_column,
        "detected_date_column": date_col,
        "detected_platform_column": platform_col,
        "sentiment_summary": counts
    }


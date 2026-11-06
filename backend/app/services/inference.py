"""Inference service for orchestrating sentiment predictions and database persistence."""
import hashlib
import time
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.app.db.models import AnalysisRun, Prediction
from backend.app.ml.registry import model_registry
from backend.app.schemas.analyze import (
    SingleTextRequest, PredictionResult, Probabilities,
    BulkTextRequest, BulkAnalysisResponse, BulkItemResult, SentimentCounts,
    ExplanationToken
)


class InferenceService:
    @staticmethod
    def analyze_single(request: SingleTextRequest, db: Session) -> PredictionResult:
        t0 = time.time()
        engine = model_registry.get_engine(request.model_id or "tfidf-logreg")
        preds = engine.predict([request.text], explain=bool(request.explain))
        latency = (time.time() - t0) * 1000

        pred = preds[0]
        probs_obj = None
        if pred.probabilities:
            probs_obj = Probabilities(
                negative=pred.probabilities.get("negative", 0.0),
                neutral=pred.probabilities.get("neutral", 0.0),
                positive=pred.probabilities.get("positive", 0.0),
            )

        explanations = None
        if pred.explanations:
            explanations = [
                ExplanationToken(
                    token=e["token"],
                    weight=e["weight"],
                    sentiment=e["sentiment"]
                ) for e in pred.explanations
            ]

        # Record analysis into database
        run = AnalysisRun(
            model_version_id=f"{engine.id}-v1",
            source_type="single",
            params={"text_length": len(request.text), "model_id": engine.id},
            summary={"label": pred.label, "confidence": pred.confidence}
        )
        db.add(run)
        db.flush()

        text_hash = hashlib.sha256(request.text.encode("utf-8")).hexdigest()
        prediction_record = Prediction(
            run_id=run.id,
            row_index=0,
            text_preview=request.text[:300],
            text_hash=text_hash,
            label=pred.label,
            confidence=pred.confidence,
            score=pred.score,
            p_neg=probs_obj.negative if probs_obj else None,
            p_neu=probs_obj.neutral if probs_obj else None,
            p_pos=probs_obj.positive if probs_obj else None,
        )
        db.add(prediction_record)
        db.commit()

        return PredictionResult(
            label=pred.label,
            confidence=pred.confidence,
            score=pred.score,
            probabilities=probs_obj,
            model_id=engine.id,
            model_version=engine.version,
            latency_ms=round(latency, 2),
            explanations=explanations
        )

    @staticmethod
    def analyze_bulk(request: BulkTextRequest, db: Session) -> BulkAnalysisResponse:
        t0 = time.time()
        engine = model_registry.get_engine(request.model_id or "tfidf-logreg")
        preds = engine.predict(request.texts, explain=False)
        total_time = (time.time() - t0) * 1000

        counts = {"positive": 0, "neutral": 0, "negative": 0}
        items = []

        # Create Run record
        run = AnalysisRun(
            model_version_id=f"{engine.id}-v1",
            source_type="bulk",
            params={"batch_size": len(request.texts), "model_id": engine.id}
        )
        db.add(run)
        db.flush()

        for idx, (raw_text, pred) in enumerate(zip(request.texts, preds)):
            counts[pred.label] = counts.get(pred.label, 0) + 1
            probs_obj = None
            if pred.probabilities:
                probs_obj = Probabilities(
                    negative=pred.probabilities.get("negative", 0.0),
                    neutral=pred.probabilities.get("neutral", 0.0),
                    positive=pred.probabilities.get("positive", 0.0),
                )

            items.append(BulkItemResult(
                index=idx,
                text=raw_text,
                label=pred.label,
                confidence=pred.confidence,
                score=pred.score,
                probabilities=probs_obj
            ))

            text_hash = hashlib.sha256(raw_text.encode("utf-8")).hexdigest()
            db.add(Prediction(
                run_id=run.id,
                row_index=idx,
                text_preview=raw_text[:300],
                text_hash=text_hash,
                label=pred.label,
                confidence=pred.confidence,
                score=pred.score,
                p_neg=probs_obj.negative if probs_obj else None,
                p_neu=probs_obj.neutral if probs_obj else None,
                p_pos=probs_obj.positive if probs_obj else None,
            ))

        summary = SentimentCounts(
            positive=counts["positive"],
            neutral=counts["neutral"],
            negative=counts["negative"],
            total=len(request.texts)
        )
        run.summary = summary.dict()
        db.commit()

        return BulkAnalysisResponse(
            results=items,
            summary=summary,
            model_id=engine.id,
            model_version=engine.version,
            run_id=run.id,
            total_time_ms=round(total_time, 2)
        )


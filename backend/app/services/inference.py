"""Inference service for orchestrating sentiment predictions and database persistence."""
import hashlib
import logging
import time
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.app.core.errors import AppException, ModelUnavailable
from backend.app.db.models import AnalysisRun, Prediction, ModelVersion
from backend.app.ml.registry import model_registry
from backend.app.services.multilingual import MultilingualSentimentService
from backend.app.services.explainability import ExplainabilityService
from backend.app.schemas.analyze import (
    SingleTextRequest, PredictionResult, Probabilities,
    BulkTextRequest, BulkAnalysisResponse, BulkItemResult, SentimentCounts,
    ExplanationToken
)

logger = logging.getLogger("sentiscope.inference")


class InferenceService:
    @staticmethod
    def analyze_single(request: SingleTextRequest, db: Session) -> PredictionResult:
        t0 = time.time()
        model_id = request.model_id or "tfidf-logreg"
        
        # 1. Language detection & multilingual routing
        lang_info = MultilingualSentimentService.detect_language(request.text)
        is_indic = (request.language in ("bn", "hi")) or (request.language == "auto" and lang_info["code"] in ("bn", "hi"))
        target_lang = request.language if request.language in ("bn", "hi") else lang_info["code"]

        influential_words = []
        explanation_summary = None

        if is_indic and target_lang in ("bn", "hi"):
            indic_res = MultilingualSentimentService.analyze_indic_text(request.text, target_lang)
            engine_id = f"multilingual-{target_lang}"
            engine_version = f"indic-{target_lang}-v1.0"
            label = indic_res["label"]
            confidence = indic_res["confidence"]
            score = indic_res["score"]
            probs_dict = indic_res["probabilities"]
            influential_words = indic_res.get("influential_words", [])
            explanation_summary = (
                f"Classified using native {lang_info['name']} linguistic sentiment heuristics with "
                f"negation inversion and contextual intensifiers."
            )
        else:
            logger.info(f"Initiating single text inference with model: '{model_id}' (text_length={len(request.text)})")
            try:
                engine = model_registry.get_engine(model_id)
                preds = engine.predict([request.text], explain=bool(request.explain))
            except AppException:
                raise
            except Exception as exc:
                logger.error(f"Inference execution failed for model '{model_id}': {exc}", exc_info=True)
                raise ModelUnavailable(f"Model engine '{model_id}' failed during inference: {exc}") from exc

            pred = preds[0]
            engine_id = engine.id
            engine_version = engine.version
            label = pred.label
            confidence = pred.confidence
            score = pred.score
            probs_dict = pred.probabilities or {}
            influential_words = getattr(pred, "influential_words", [])

        latency = (time.time() - t0) * 1000

        probs_obj = Probabilities(
            negative=probs_dict.get("negative", 0.0),
            neutral=probs_dict.get("neutral", 0.0),
            positive=probs_dict.get("positive", 0.0),
        )

        # 2. XAI / Explanation generation if requested
        explanations = None
        if request.explain:
            try:
                xai_res = ExplainabilityService.explain_text(request.text, model_id=model_id)
                explanation_summary = xai_res.get("summary")
                explanations = [
                    ExplanationToken(
                        token=t["token"],
                        weight=t["score"],
                        sentiment=t["type"]
                    ) for t in xai_res.get("tokens", [])[:15]
                ]
            except Exception as xai_err:
                logger.warning(f"XAI explanation generation warning: {xai_err}")

        # Resolve ModelVersion foreign key
        mv = db.query(ModelVersion).filter(ModelVersion.model_id == engine_id).first()
        model_version_id = mv.id if mv else f"{engine_id}-v1"

        # Record analysis into database
        run = AnalysisRun(
            model_version_id=model_version_id,
            source_type="single",
            params={"text_length": len(request.text), "model_id": engine_id, "language": lang_info["code"]},
            summary={"label": label, "confidence": confidence}
        )
        db.add(run)
        db.flush()

        text_hash = hashlib.sha256(request.text.encode("utf-8")).hexdigest()
        prediction_record = Prediction(
            run_id=run.id,
            row_index=0,
            text_preview=request.text[:300],
            text_hash=text_hash,
            label=label,
            confidence=confidence,
            score=score,
            p_neg=probs_obj.negative if probs_obj else None,
            p_neu=probs_obj.neutral if probs_obj else None,
            p_pos=probs_obj.positive if probs_obj else None,
        )
        db.add(prediction_record)
        db.commit()

        logger.info(
            f"Completed single text inference: label={label}, conf={confidence:.4f}, lang={lang_info['code']}, latency={latency:.2f}ms"
        )

        return PredictionResult(
            label=label,
            confidence=confidence,
            score=score,
            probabilities=probs_obj,
            model_id=engine_id,
            model_version=engine_version,
            latency_ms=round(latency, 2),
            explanations=explanations,
            language=lang_info,
            influential_words=influential_words,
            explanation_summary=explanation_summary
        )

    @staticmethod
    def analyze_bulk(request: BulkTextRequest, db: Session) -> BulkAnalysisResponse:
        t0 = time.time()
        model_id = request.model_id or "tfidf-logreg"
        logger.info(f"Initiating bulk text inference with model: '{model_id}' (batch_size={len(request.texts)})")

        try:
            engine = model_registry.get_engine(model_id)
            preds = engine.predict(request.texts, explain=False)
        except AppException:
            raise
        except Exception as exc:
            logger.error(f"Bulk inference execution failed for model '{model_id}': {exc}", exc_info=True)
            raise ModelUnavailable(f"Model engine '{model_id}' failed during bulk inference: {exc}") from exc

        total_time = (time.time() - t0) * 1000

        counts = {"positive": 0, "neutral": 0, "negative": 0}
        items = []

        # Resolve ModelVersion foreign key
        mv = db.query(ModelVersion).filter(ModelVersion.model_id == engine.id).first()
        model_version_id = mv.id if mv else f"{engine.id}-v1"

        # Create Run record
        run = AnalysisRun(
            model_version_id=model_version_id,
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

        logger.info(
            f"Completed bulk text inference: {len(request.texts)} items, total_time={total_time:.2f}ms"
        )

        return BulkAnalysisResponse(
            results=items,
            summary=summary,
            model_id=engine.id,
            model_version=engine.version,
            run_id=run.id,
            total_time_ms=round(total_time, 2)
        )

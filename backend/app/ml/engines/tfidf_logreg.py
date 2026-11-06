"""TF-IDF + Logistic Regression sentiment engine for SentiScope AI."""
import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence
import joblib
import numpy as np

from backend.app.ml.engines.base import BaseEngine, EnginePrediction
from ml.nlp.preprocessor import preprocess_for_tfidf, tokenize


class TfidfLogRegEngine(BaseEngine):
    def __init__(self, artifact_path: Path):
        self.id = "tfidf-logreg"
        self.kind = "trained"
        self.version = "20261106-v1.0.0"
        self.classes = ["negative", "neutral", "positive"]
        self.supports_neutral = True
        self.artifact_path = artifact_path
        self.pipeline = None
        self._load_model()

    def _load_model(self):
        if not self.artifact_path.exists():
            raise FileNotFoundError(f"Model artifact not found at {self.artifact_path}")
        self.pipeline = joblib.load(self.artifact_path)
        self.classes = list(self.pipeline.classes_)

    def predict_proba(self, texts: Sequence[str]) -> np.ndarray:
        cleaned = [preprocess_for_tfidf(t) for t in texts]
        return self.pipeline.predict_proba(cleaned)

    def predict(self, texts: Sequence[str], explain: bool = False) -> List[EnginePrediction]:
        cleaned = [preprocess_for_tfidf(t) for t in texts]
        probs = self.pipeline.predict_proba(cleaned)
        preds = self.pipeline.predict(cleaned)

        results = []
        clf = self.pipeline.named_steps.get("clf")
        tfidf = self.pipeline.named_steps.get("tfidf")

        for idx, (raw_text, text_clean, pred_label, prob_row) in enumerate(zip(texts, cleaned, preds, probs)):
            prob_dict = {c: float(p) for c, p in zip(self.classes, prob_row)}
            confidence = float(prob_dict[pred_label])

            explanations = None
            if explain and clf is not None and tfidf is not None:
                explanations = self._explain_text(text_clean, pred_label, clf, tfidf)

            results.append(EnginePrediction(
                label=pred_label,
                confidence=round(confidence, 4),
                score=round(confidence, 4),
                probabilities=prob_dict,
                explanations=explanations
            ))

        return results

    def _explain_text(self, text_clean: str, pred_label: str, clf, tfidf) -> List[Dict[str, Any]]:
        tokens = tokenize(text_clean)
        feature_names = tfidf.get_feature_names_out()
        vocab_map = tfidf.vocabulary_

        # Find index of predicted class
        class_idx = list(clf.classes_).index(pred_label)
        coefficients = clf.coef_[class_idx]

        attributions = []
        for t in tokens:
            if t in vocab_map:
                feat_idx = vocab_map[t]
                weight = float(coefficients[feat_idx])
                attributions.append({
                    "token": t,
                    "weight": round(weight, 4),
                    "sentiment": "positive" if weight > 0 else "negative"
                })

        # Sort by absolute influence
        attributions.sort(key=lambda x: abs(x["weight"]), reverse=True)
        return attributions[:10]


"""Keras Bidirectional LSTM Sentiment Engine for SentiScope AI."""
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence
import numpy as np

# Set backend env before imports
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from backend.app.ml.engines.base import BaseEngine, EnginePrediction
from ml.nlp.preprocessor import preprocess_for_tfidf, tokenize


class KerasLSTMEngine(BaseEngine):
    def __init__(self, artifact_path: Path):
        self.id = "keras-lstm"
        self.kind = "deep_learning"
        self.version = "20261107-v1.0.0"
        self.classes = ["negative", "neutral", "positive"]
        self.supports_neutral = True
        self.artifact_path = artifact_path
        self.model = None
        self.vectorizer = None
        self._load_model()

    def _load_model(self):
        import tensorflow as tf
        from tensorflow import keras
        from keras import layers

        if not self.artifact_path.exists():
            raise FileNotFoundError(f"Model artifact not found at {self.artifact_path}")

        self.model = keras.models.load_model(self.artifact_path)

        vocab_path = self.artifact_path.parent / "vocab.json"
        if not vocab_path.exists():
            raise FileNotFoundError(f"Vocabulary file not found at {vocab_path}")

        with open(vocab_path, "r", encoding="utf-8") as f:
            vocab = json.load(f)

        self.vectorizer = layers.TextVectorization(
            max_tokens=len(vocab),
            output_mode="int",
            output_sequence_length=50
        )
        self.vectorizer.set_vocabulary(vocab)

    def predict_proba(self, texts: Sequence[str]) -> np.ndarray:
        cleaned = [preprocess_for_tfidf(t) for t in texts]
        seqs = self.vectorizer(cleaned).numpy()
        probs = self.model.predict(seqs, batch_size=min(len(texts), 128), verbose=0)
        return probs

    def predict(self, texts: Sequence[str], explain: bool = False) -> List[EnginePrediction]:
        cleaned = [preprocess_for_tfidf(t) for t in texts]
        seqs = self.vectorizer(cleaned).numpy()
        probs = self.model.predict(seqs, batch_size=min(len(texts), 128), verbose=0)
        preds = np.argmax(probs, axis=1)

        results = []
        for raw_text, text_clean, pred_idx, prob_row in zip(texts, cleaned, preds, probs):
            pred_label = self.classes[pred_idx]
            prob_dict = {c: round(float(p), 4) for c, p in zip(self.classes, prob_row)}
            confidence = float(prob_dict[pred_label])

            explanations = None
            if explain:
                tokens = tokenize(text_clean)
                explanations = [
                    {
                        "token": t,
                        "weight": round(float(prob_dict[pred_label] / max(len(tokens), 1)), 4),
                        "sentiment": pred_label
                    }
                    for t in tokens[:10]
                ]

            results.append(EnginePrediction(
                label=pred_label,
                confidence=round(confidence, 4),
                score=round(confidence, 4),
                probabilities=prob_dict,
                explanations=explanations
            ))

        return results

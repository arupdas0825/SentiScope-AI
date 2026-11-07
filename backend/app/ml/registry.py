"""Model Registry for discovering, verifying integrity, and loading sentiment engines."""
import hashlib
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
from backend.app.core.config import settings
from backend.app.core.errors import ModelUnavailable, AppException
from backend.app.ml.engines.base import BaseEngine
from backend.app.ml.engines.tfidf_logreg import TfidfLogRegEngine
from backend.app.ml.engines.vader import VaderEngine
from backend.app.ml.engines.distilbert import DistilBertEngine

logger = logging.getLogger("sentiscope.ml.registry")


class ModelRegistry:
    def __init__(self, artifacts_dir: Path):
        self.artifacts_dir = artifacts_dir
        self._loaded_engines: Dict[str, BaseEngine] = {}

    def get_engine(self, model_id: str) -> BaseEngine:
        if model_id in self._loaded_engines:
            return self._loaded_engines[model_id]

        if model_id == "tfidf-logreg":
            artifact_file = self.artifacts_dir / "tfidf-logreg" / "model.joblib"
            if not artifact_file.exists():
                raise ModelUnavailable(f"Trained model artifact for '{model_id}' is not yet built.")
            self._verify_checksum(artifact_file)
            engine = TfidfLogRegEngine(artifact_file)
            self._loaded_engines[model_id] = engine
            logger.info(f"Model engine '{model_id}' loaded and cached.")
            return engine

        elif model_id == "keras-lstm":
            try:
                artifact_file = self.artifacts_dir / "keras-lstm" / "model.keras"
                if not artifact_file.exists():
                    raise ModelUnavailable(f"Trained model artifact for '{model_id}' is not found.")
                self._verify_checksum(artifact_file)
                from backend.app.ml.engines.keras_lstm import KerasLSTMEngine
                engine = KerasLSTMEngine(artifact_file)
                self._loaded_engines[model_id] = engine
                logger.info(f"Model engine '{model_id}' loaded and cached.")
                return engine
            except AppException:
                raise
            except Exception as e:
                logger.error(f"Failed to load Keras LSTM engine: {e}", exc_info=True)
                raise ModelUnavailable(f"Keras Bidirectional LSTM engine failed to load: {e}") from e

        elif model_id == "vader":
            try:
                engine = VaderEngine()
                self._loaded_engines[model_id] = engine
                logger.info(f"Model engine '{model_id}' loaded and cached.")
                return engine
            except AppException:
                raise
            except Exception as e:
                logger.error(f"Failed to load VADER engine: {e}", exc_info=True)
                raise ModelUnavailable(f"VADER Lexicon engine failed to load: {e}") from e

        elif model_id == "distilbert":
            try:
                engine = DistilBertEngine()
                self._loaded_engines[model_id] = engine
                logger.info(f"Model engine '{model_id}' loaded and cached.")
                return engine
            except AppException:
                raise
            except Exception as e:
                logger.error(f"Failed to load DistilBERT engine: {e}", exc_info=True)
                raise ModelUnavailable(f"DistilBERT Transformer engine failed to load: {e}") from e

        raise ModelUnavailable(f"Model engine '{model_id}' is not registered.")

    def _verify_checksum(self, file_path: Path):
        manifest_path = file_path.parent / "SHA256SUMS"
        if not manifest_path.exists():
            return

        with open(file_path, "rb") as f:
            current_sha = hashlib.sha256(f.read()).hexdigest()

        with open(manifest_path, "r", encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 2 and parts[1] == file_path.name:
                    if parts[0] != current_sha:
                        raise ModelUnavailable(
                            f"Integrity check failed for {file_path.name}: checksum mismatch. Model load aborted."
                        )

    def list_models(self) -> List[Dict]:
        models = [
            {
                "id": "tfidf-logreg-v1",
                "model_id": "tfidf-logreg",
                "name": "TF-IDF + Logistic Regression",
                "kind": "trained",
                "architecture": "Classical Machine Learning (TF-IDF + LogReg)",
                "version": "20261106-v1.0.0",
                "supports_neutral": True,
                "classes": ["negative", "neutral", "positive"],
                "is_default": True,
                "metrics": self.get_metrics("tfidf-logreg")
            },
            {
                "id": "keras-lstm-v1",
                "model_id": "keras-lstm",
                "name": "Keras Bidirectional LSTM",
                "kind": "deep_learning",
                "architecture": "Deep Learning (Word Embedding + BiLSTM + Dense)",
                "version": "20261107-v1.0.0",
                "supports_neutral": True,
                "classes": ["negative", "neutral", "positive"],
                "is_default": False,
                "metrics": self.get_metrics("keras-lstm")
            },
            {
                "id": "vader-lexicon-v1",
                "model_id": "vader",
                "name": "VADER Lexicon Baseline",
                "kind": "lexicon",
                "architecture": "Rule-Based Lexicon & Sentiment Heuristics",
                "version": "vader-lexicon-3.3.2",
                "supports_neutral": True,
                "classes": ["negative", "neutral", "positive"],
                "is_default": False,
                "metrics": self.get_metrics("vader")
            },
            {
                "id": "distilbert-transformer-v1",
                "model_id": "distilbert",
                "name": "DistilBERT Fine-Tuned Transformer",
                "kind": "transformer",
                "architecture": "Transformer (DistilBERT 6-Layer Self-Attention)",
                "version": "distilbert-base-uncased-finetuned-v1",
                "supports_neutral": True,
                "classes": ["negative", "neutral", "positive"],
                "is_default": False,
                "metrics": self.get_metrics("distilbert")
            }
        ]
        return models

    def get_metrics(self, model_id: str) -> Optional[Dict]:
        metrics_file = self.artifacts_dir / model_id / "metrics.json"
        if metrics_file.exists():
            try:
                with open(metrics_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return None
        return None


model_registry = ModelRegistry(settings.artifacts_dir)

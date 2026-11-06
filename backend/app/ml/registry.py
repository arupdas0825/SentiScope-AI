"""Model Registry for discovering, verifying integrity, and loading sentiment engines."""
import hashlib
import json
from pathlib import Path
from typing import Dict, List, Optional
from backend.app.core.config import settings
from backend.app.core.errors import ModelUnavailable
from backend.app.ml.engines.base import BaseEngine
from backend.app.ml.engines.tfidf_logreg import TfidfLogRegEngine
from backend.app.ml.engines.vader import VaderEngine


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
            # Verify SHA256 integrity if manifest exists
            self._verify_checksum(artifact_file)
            engine = TfidfLogRegEngine(artifact_file)
            self._loaded_engines[model_id] = engine
            return engine

        elif model_id == "vader":
            engine = VaderEngine()
            self._loaded_engines[model_id] = engine
            return engine

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
                "kind": "trained",
                "version": "20261106-v1.0.0",
                "supports_neutral": True,
                "classes": ["negative", "neutral", "positive"],
                "is_default": True,
                "metrics": self.get_metrics("tfidf-logreg")
            },
            {
                "id": "vader-lexicon-v1",
                "model_id": "vader",
                "kind": "lexicon",
                "version": "vader-lexicon-3.3.2",
                "supports_neutral": True,
                "classes": ["negative", "neutral", "positive"],
                "is_default": False,
                "metrics": None
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


"""Keras Bidirectional LSTM Sentiment Engine for SentiScope AI."""
import io
import json
import logging
import os
import zipfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence
import numpy as np

# Set backend env before imports
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from backend.app.ml.engines.base import BaseEngine, EnginePrediction
from backend.app.core.errors import ModelUnavailable
from ml.nlp.preprocessor import preprocess_for_tfidf, tokenize

logger = logging.getLogger("sentiscope.engine.keras_lstm")


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.clip(x, -30.0, 30.0)))


def _softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e / np.sum(e, axis=-1, keepdims=True)


class NumpyBiLSTMRunner:
    """Exact mathematical forward-pass executor for the trained Keras BiLSTM network.
    
    Evaluates the exact trained weights from weights.npz or model.weights.h5 without requiring
    the bulky 500MB+ TensorFlow C++ runtime in memory-constrained cloud environments.
    """
    def __init__(self, artifact_path: Path, vocab_path: Path):
        self.artifact_path = artifact_path
        with open(vocab_path, "r", encoding="utf-8") as f:
            self.vocab = json.load(f)
        self.word2idx = {w: i for i, w in enumerate(self.vocab)}

        # 1. Prefer pure NumPy compressed archive (zero extra dependencies, fast & low memory)
        weights_npz = artifact_path.parent / "weights.npz"
        if weights_npz.exists():
            try:
                data = np.load(weights_npz)
                self.embed_weights = data["embed_weights"]
                self.f_kernel = data["f_kernel"]
                self.f_recurrent = data["f_recurrent"]
                self.f_bias = data["f_bias"]
                self.b_kernel = data["b_kernel"]
                self.b_recurrent = data["b_recurrent"]
                self.b_bias = data["b_bias"]
                self.d1_w = data["d1_w"]
                self.d1_b = data["d1_b"]
                self.d2_w = data["d2_w"]
                self.d2_b = data["d2_b"]
                logger.info("Loaded exact BiLSTM weights from weights.npz via pure NumPy.")
                return
            except Exception as e_npz:
                logger.warning(f"Could not load weights.npz ({e_npz}). Falling back to model.weights.h5...")

        # 2. Fallback to h5py extraction from model.keras zip archive
        try:
            import h5py
        except ImportError as e:
            raise ModelUnavailable("h5py or weights.npz is required for reading Keras model weights.") from e

        with zipfile.ZipFile(artifact_path, "r") as z:
            with h5py.File(io.BytesIO(z.read("model.weights.h5")), "r") as hf:
                self.embed_weights = np.array(hf["layers/embedding/vars/0"])
                self.f_kernel = np.array(hf["layers/bidirectional/forward_layer/cell/vars/0"])
                self.f_recurrent = np.array(hf["layers/bidirectional/forward_layer/cell/vars/1"])
                self.f_bias = np.array(hf["layers/bidirectional/forward_layer/cell/vars/2"])
                self.b_kernel = np.array(hf["layers/bidirectional/backward_layer/cell/vars/0"])
                self.b_recurrent = np.array(hf["layers/bidirectional/backward_layer/cell/vars/1"])
                self.b_bias = np.array(hf["layers/bidirectional/backward_layer/cell/vars/2"])
                self.d1_w = np.array(hf["layers/dense/vars/0"])
                self.d1_b = np.array(hf["layers/dense/vars/1"])
                self.d2_w = np.array(hf["layers/dense_1/vars/0"])
                self.d2_b = np.array(hf["layers/dense_1/vars/1"])

    @staticmethod
    def _lstm_step(x_t, h_prev, c_prev, kernel, recurrent, bias, units=32):
        gates = np.dot(x_t, kernel) + np.dot(h_prev, recurrent) + bias
        i = _sigmoid(gates[:units])
        f = _sigmoid(gates[units:2 * units])
        c_cand = np.tanh(gates[2 * units:3 * units])
        o = _sigmoid(gates[3 * units:])
        c = f * c_prev + i * c_cand
        h = o * np.tanh(c)
        return h, c

    def _tokenize_text(self, text: str) -> np.ndarray:
        words = text.split()[:50]
        ids = [self.word2idx.get(w, 1) for w in words]
        if len(ids) < 50:
            ids += [0] * (50 - len(ids))
        return np.array(ids, dtype=np.int32)

    def predict_proba(self, texts: Sequence[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, 3), dtype=np.float32)

        cleaned = [preprocess_for_tfidf(t) for t in texts]
        probs_list = []
        units = 32

        for clean_text in cleaned:
            token_ids = self._tokenize_text(clean_text)
            embeds = self.embed_weights[token_ids]

            h_f = np.zeros(units, dtype=np.float32)
            c_f = np.zeros(units, dtype=np.float32)
            for t in range(50):
                if token_ids[t] != 0:
                    h_f, c_f = self._lstm_step(embeds[t], h_f, c_f, self.f_kernel, self.f_recurrent, self.f_bias, units)

            h_b = np.zeros(units, dtype=np.float32)
            c_b = np.zeros(units, dtype=np.float32)
            for t in reversed(range(50)):
                if token_ids[t] != 0:
                    h_b, c_b = self._lstm_step(embeds[t], h_b, c_b, self.b_kernel, self.b_recurrent, self.b_bias, units)

            h_bi = np.concatenate([h_f, h_b])
            dense1 = np.maximum(0, np.dot(h_bi, self.d1_w) + self.d1_b)
            logits = np.dot(dense1, self.d2_w) + self.d2_b
            probs = _softmax(logits)
            probs_list.append(probs)

        return np.array(probs_list, dtype=np.float32)


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
        self.numpy_runner: Optional[NumpyBiLSTMRunner] = None
        self._load_model()

    def _load_model(self):
        if not self.artifact_path.exists():
            raise ModelUnavailable(f"LSTM model artifact not found at {self.artifact_path}")

        vocab_path = self.artifact_path.parent / "vocab.json"
        if not vocab_path.exists():
            raise ModelUnavailable(f"Vocabulary file not found at {vocab_path}")

        # Attempt 1: Load via official TensorFlow / Keras if installed
        try:
            import tensorflow as tf
            from tensorflow import keras
            from tensorflow.keras import layers

            self.model = keras.models.load_model(self.artifact_path)
            with open(vocab_path, "r", encoding="utf-8") as f:
                vocab = json.load(f)

            self.vectorizer = layers.TextVectorization(
                max_tokens=len(vocab),
                output_mode="int",
                output_sequence_length=50
            )
            self.vectorizer.set_vocabulary(vocab)
            logger.info("KerasLSTMEngine loaded successfully via TensorFlow/Keras runtime.")
            return
        except Exception as e_keras:
            logger.info(f"TensorFlow runtime unavailable ({e_keras}). Initializing lightweight NumPy weight executor...")

        # Attempt 2: Load via exact NumPy mathematical runner
        try:
            self.numpy_runner = NumpyBiLSTMRunner(self.artifact_path, vocab_path)
            logger.info("KerasLSTMEngine loaded successfully via NumPyBiLSTM runner.")
        except Exception as e_runner:
            logger.error(f"Failed to initialize NumPyBiLSTMRunner: {e_runner}", exc_info=True)
            raise ModelUnavailable(f"Keras LSTM model could not be loaded: {e_runner}") from e_runner

    def predict_proba(self, texts: Sequence[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, len(self.classes)), dtype=np.float32)

        if self.model and self.vectorizer:
            cleaned = [preprocess_for_tfidf(t) for t in texts]
            seqs = self.vectorizer(cleaned).numpy()
            batch_size = max(1, min(len(texts), 128))
            return self.model.predict(seqs, batch_size=batch_size, verbose=0)

        if self.numpy_runner:
            return self.numpy_runner.predict_proba(texts)

        raise ModelUnavailable("LSTM model runner is not initialized.")

    def predict(self, texts: Sequence[str], explain: bool = False) -> List[EnginePrediction]:
        if not texts:
            return []

        probs = self.predict_proba(texts)
        preds = np.argmax(probs, axis=1)

        results = []
        for raw_text, pred_idx, prob_row in zip(texts, preds, probs):
            pred_label = self.classes[pred_idx]
            prob_dict = {c: round(float(p), 4) for c, p in zip(self.classes, prob_row)}
            confidence = float(prob_dict[pred_label])

            explanations = None
            if explain:
                cleaned = preprocess_for_tfidf(raw_text)
                tokens = tokenize(cleaned)
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

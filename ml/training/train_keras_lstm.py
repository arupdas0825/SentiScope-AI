"""Offline training and evaluation script for Model B (Keras BiLSTM).
Trains strictly on train.csv, validates with early stopping on val.csv,
and evaluates once on held-out test.csv.
Saves model.keras, vocab.json, metrics.json, metadata.json, confusion_matrix.png, and SHA256SUMS.
"""
import hashlib
import json
import os
from pathlib import Path
import sys
import time

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Silence noisy TF logging and set local matplotlib cache
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".cache" / "matplotlib")
(PROJECT_ROOT / ".cache" / "matplotlib").mkdir(parents=True, exist_ok=True)

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.utils.class_weight import compute_class_weight
import tensorflow as tf
from tensorflow import keras
from keras import layers

from ml.nlp.preprocessor import preprocess_for_tfidf

DATA_DIR = PROJECT_ROOT / "data" / "processed"
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts" / "models" / "keras-lstm"
CLASSES = ["negative", "neutral", "positive"]
CLASS_TO_IDX = {c: i for i, c in enumerate(CLASSES)}
IDX_TO_CLASS = {i: c for i, c in enumerate(CLASSES)}

MAX_TOKENS = 12000
MAX_LEN = 50
EMBEDDING_DIM = 64
LSTM_UNITS = 32
BATCH_SIZE = 128
EPOCHS = 6
RANDOM_SEED = 42


def compute_sha256(filepath: Path) -> str:
    with open(filepath, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def train_and_evaluate():
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    tf.random.set_seed(RANDOM_SEED)
    np.random.seed(RANDOM_SEED)

    print("Loading TweetEval processed splits...")
    train_df = pd.read_csv(DATA_DIR / "train.csv")
    val_df = pd.read_csv(DATA_DIR / "val.csv")
    test_df = pd.read_csv(DATA_DIR / "test.csv")

    print(f"Train samples: {len(train_df)}, Val samples: {len(val_df)}, Test samples: {len(test_df)}")

    # Preprocess text
    print("Applying text cleaning...")
    t0 = time.time()
    train_texts = [preprocess_for_tfidf(t) for t in train_df["text"]]
    val_texts = [preprocess_for_tfidf(t) for t in val_df["text"]]
    test_texts = [preprocess_for_tfidf(t) for t in test_df["text"]]
    print(f"Text cleaning done in {time.time() - t0:.2f}s.")

    y_train = np.array([CLASS_TO_IDX[s] for s in train_df["sentiment"]])
    y_val = np.array([CLASS_TO_IDX[s] for s in val_df["sentiment"]])
    y_test = np.array([CLASS_TO_IDX[s] for s in test_df["sentiment"]])

    # Adapt TextVectorization strictly on train_texts
    print(f"Fitting TextVectorization layer (max_tokens={MAX_TOKENS}, max_len={MAX_LEN})...")
    vectorizer = layers.TextVectorization(
        max_tokens=MAX_TOKENS,
        output_mode="int",
        output_sequence_length=MAX_LEN
    )
    vectorizer.adapt(train_texts)
    vocab = vectorizer.get_vocabulary()
    vocab_size = len(vocab)
    print(f"Vocabulary fitted with {vocab_size} tokens.")

    # Vectorize datasets into integer sequences
    X_train_seq = vectorizer(train_texts).numpy()
    X_val_seq = vectorizer(val_texts).numpy()
    X_test_seq = vectorizer(test_texts).numpy()

    # Compute balanced class weights to handle natural Twitter sentiment skew
    raw_class_weights = compute_class_weight("balanced", classes=np.array([0, 1, 2]), y=y_train)
    class_weights_dict = {i: float(w) for i, w in enumerate(raw_class_weights)}
    print("Computed Class Weights:", class_weights_dict)

    # Build Bidirectional LSTM Architecture
    print("Constructing Bidirectional LSTM network...")
    inputs = keras.Input(shape=(MAX_LEN,), dtype="int32", name="token_ids")
    x = layers.Embedding(
        input_dim=vocab_size,
        output_dim=EMBEDDING_DIM,
        mask_zero=True,
        name="embedding"
    )(inputs)
    x = layers.SpatialDropout1D(0.2, name="spatial_dropout")(x)
    x = layers.Bidirectional(
        layers.LSTM(LSTM_UNITS, return_sequences=False, dropout=0.2, recurrent_dropout=0.0),
        name="bilstm"
    )(x)
    x = layers.Dense(32, activation="relu", name="dense_features")(x)
    x = layers.Dropout(0.3, name="dense_dropout")(x)
    outputs = layers.Dense(3, activation="softmax", name="sentiment_probabilities")(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name="sentiscope_bilstm")
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.summary()

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=2,
            restore_best_weights=True,
            verbose=1
        )
    ]

    print("Beginning model training...")
    t_train_start = time.time()
    history = model.fit(
        X_train_seq,
        y_train,
        validation_data=(X_val_seq, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        class_weight=class_weights_dict,
        callbacks=callbacks,
        verbose=1
    )
    train_duration = time.time() - t_train_start
    print(f"Model training finished in {train_duration:.2f}s.")

    # Validation evaluation
    val_probs = model.predict(X_val_seq, batch_size=BATCH_SIZE)
    val_preds = np.argmax(val_probs, axis=1)
    val_f1 = f1_score(y_val, val_preds, average="macro")
    print(f"Validation Macro-F1: {val_f1:.4f}")

    # Official Held-out Test Set Evaluation
    print("Evaluating on official held-out test split (12,284 samples)...")
    test_probs = model.predict(X_test_seq, batch_size=BATCH_SIZE)
    test_preds = np.argmax(test_probs, axis=1)

    test_labels_str = [IDX_TO_CLASS[i] for i in test_preds]
    true_labels_str = [IDX_TO_CLASS[i] for i in y_test]

    acc = float(accuracy_score(y_test, test_preds))
    macro_f1 = float(f1_score(y_test, test_preds, average="macro"))
    weighted_f1 = float(f1_score(y_test, test_preds, average="weighted"))

    print(f"Test Accuracy: {acc:.4f}, Test Macro-F1: {macro_f1:.4f}, Weighted-F1: {weighted_f1:.4f}")

    report_dict = classification_report(true_labels_str, test_labels_str, target_names=CLASSES, output_dict=True)
    per_class_metrics = {}
    for c in CLASSES:
        per_class_metrics[c] = {
            "precision": round(float(report_dict[c]["precision"]), 4),
            "recall": round(float(report_dict[c]["recall"]), 4),
            "f1_score": round(float(report_dict[c]["f1-score"]), 4),
            "support": int(report_dict[c]["support"])
        }

    cm = confusion_matrix(true_labels_str, test_labels_str, labels=CLASSES)
    cm_list = cm.tolist()

    # Generate Confusion Matrix Heatmap figure
    plt.figure(figsize=(7, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Purples",
        xticklabels=[c.capitalize() for c in CLASSES],
        yticklabels=[c.capitalize() for c in CLASSES]
    )
    plt.title(f"Confusion Matrix — Keras Bidirectional LSTM\n(Accuracy: {acc*100:.1f}%, Macro-F1: {macro_f1:.3f})")
    plt.xlabel("Predicted Sentiment")
    plt.ylabel("Ground Truth Sentiment")
    plt.tight_layout()

    cm_png_path = ARTIFACTS_DIR / "confusion_matrix.png"
    cm_svg_path = ARTIFACTS_DIR / "confusion_matrix.svg"
    plt.savefig(cm_png_path, dpi=300)
    plt.savefig(cm_svg_path)
    plt.close()
    print(f"Saved confusion matrix plot to {cm_png_path}")

    # Save trained Keras model
    model_path = ARTIFACTS_DIR / "model.keras"
    model.save(model_path)
    print(f"Saved Keras model to {model_path}")

    # Save vocab.json
    vocab_path = ARTIFACTS_DIR / "vocab.json"
    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(vocab, f, indent=2)
    print(f"Saved vocabulary to {vocab_path}")

    # Save metrics.json
    metrics_data = {
        "model_id": "keras-lstm",
        "model_version": "20261107-v1.0.0",
        "kind": "deep_learning",
        "architecture": "Bidirectional LSTM + Dense",
        "dataset_name": "TweetEval Sentiment (SemEval-2017 Task 4)",
        "accuracy": round(acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "classes": CLASSES,
        "per_class": per_class_metrics,
        "confusion_matrix": cm_list,
        "training_time_seconds": round(train_duration, 2),
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "test_sample_count": len(test_df),
        "total_parameters": int(model.count_params())
    }

    metrics_path = ARTIFACTS_DIR / "metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    # Save metadata.json
    metadata = {
        "model_id": "keras-lstm",
        "version": "20261107-v1.0.0",
        "framework": "TensorFlow / Keras",
        "hyperparameters": {
            "max_tokens": MAX_TOKENS,
            "max_length": MAX_LEN,
            "embedding_dim": EMBEDDING_DIM,
            "lstm_units": LSTM_UNITS,
            "batch_size": BATCH_SIZE,
            "optimizer": "adam",
            "learning_rate": 0.001
        },
        "artifacts": {
            "model": "model.keras",
            "vocab": "vocab.json",
            "metrics": "metrics.json",
            "confusion_matrix_png": "confusion_matrix.png",
            "confusion_matrix_svg": "confusion_matrix.svg"
        }
    }
    with open(ARTIFACTS_DIR / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Compute and save SHA256SUMS
    sha_manifest = []
    for fpath in [model_path, vocab_path, metrics_path, cm_png_path, cm_svg_path]:
        sha = compute_sha256(fpath)
        sha_manifest.append(f"{sha}  {fpath.name}")

    with open(ARTIFACTS_DIR / "SHA256SUMS", "w", encoding="utf-8") as f:
        f.write("\n".join(sha_manifest) + "\n")

    print("Phase 8 Model B (Keras BiLSTM) training, evaluation, and artifact generation complete.")
    return metrics_data


if __name__ == "__main__":
    train_and_evaluate()


"""Offline training and evaluation script for Model A (TF-IDF + Logistic Regression).
Trains strictly on train.csv, tunes on val.csv, evaluates once on test.csv.
Saves model artifacts, metrics.json, confusion_matrix.png, and SHA256SUMS.
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

os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".cache" / "matplotlib")
(PROJECT_ROOT / ".cache" / "matplotlib").mkdir(parents=True, exist_ok=True)

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
from sklearn.pipeline import Pipeline

from ml.nlp.preprocessor import preprocess_for_tfidf

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "processed"
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts" / "models" / "tfidf-logreg"


def compute_sha256(filepath: Path) -> str:
    with open(filepath, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def train_and_evaluate():
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    print("Loading TweetEval processed splits...")

    train_df = pd.read_csv(DATA_DIR / "train.csv")
    val_df = pd.read_csv(DATA_DIR / "val.csv")
    test_df = pd.read_csv(DATA_DIR / "test.csv")

    print(f"Train samples: {len(train_df)}, Val samples: {len(val_df)}, Test samples: {len(test_df)}")

    # Preprocessing
    print("Applying preprocessing to texts...")
    t0 = time.time()
    X_train = [preprocess_for_tfidf(t) for t in train_df["text"]]
    y_train = train_df["sentiment"].values

    X_val = [preprocess_for_tfidf(t) for t in val_df["text"]]
    y_val = val_df["sentiment"].values

    X_test = [preprocess_for_tfidf(t) for t in test_df["text"]]
    y_test = test_df["sentiment"].values
    prep_time = time.time() - t0
    print(f"Preprocessing completed in {prep_time:.2f}s.")

    # Model pipeline
    print("Fitting TF-IDF Vectorizer & Logistic Regression pipeline...")
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=25000,
            sublinear_tf=True,
            min_df=2
        )),
        ("clf", LogisticRegression(
            C=1.0,
            class_weight="balanced",
            max_iter=1000,
            random_state=42,
            solver="lbfgs"
        ))
    ])

    t_train_start = time.time()
    pipeline.fit(X_train, y_train)
    train_duration = time.time() - t_train_start
    print(f"Model training completed in {train_duration:.2f}s.")

    # Validation evaluation (for verification)
    val_preds = pipeline.predict(X_val)
    val_f1 = f1_score(y_val, val_preds, average="macro")
    print(f"Validation Macro-F1: {val_f1:.4f}")

    # Official Test Evaluation (Strictly Held-Out)
    print("Evaluating on official held-out test split...")
    test_preds = pipeline.predict(X_test)
    test_probs = pipeline.predict_proba(X_test)

    classes = list(pipeline.classes_)  # e.g. ["negative", "neutral", "positive"]
    acc = float(accuracy_score(y_test, test_preds))
    macro_f1 = float(f1_score(y_test, test_preds, average="macro"))
    weighted_f1 = float(f1_score(y_test, test_preds, average="weighted"))

    report_dict = classification_report(y_test, test_preds, target_names=classes, output_dict=True)
    per_class_metrics = {}
    for c in classes:
        per_class_metrics[c] = {
            "precision": round(float(report_dict[c]["precision"]), 4),
            "recall": round(float(report_dict[c]["recall"]), 4),
            "f1_score": round(float(report_dict[c]["f1-score"]), 4),
            "support": int(report_dict[c]["support"])
        }

    cm = confusion_matrix(y_test, test_preds, labels=classes)
    cm_list = cm.tolist()

    print(f"Test Accuracy: {acc:.4f}, Test Macro-F1: {macro_f1:.4f}")

    # Plot and save Confusion Matrix figure (PNG + SVG)
    plt.figure(figsize=(7, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=[c.capitalize() for c in classes],
        yticklabels=[c.capitalize() for c in classes]
    )
    plt.title(f"Confusion Matrix — TF-IDF + Logistic Regression\n(Accuracy: {acc*100:.1f}%, Macro-F1: {macro_f1:.3f})")
    plt.xlabel("Predicted Sentiment")
    plt.ylabel("Ground Truth Sentiment")
    plt.tight_layout()

    cm_png_path = ARTIFACTS_DIR / "confusion_matrix.png"
    cm_svg_path = ARTIFACTS_DIR / "confusion_matrix.svg"
    plt.savefig(cm_png_path, dpi=300)
    plt.savefig(cm_svg_path)
    plt.close()
    print(f"Saved confusion matrix plot to {cm_png_path}")

    # Save serialized model artifact
    model_artifact_path = ARTIFACTS_DIR / "model.joblib"
    joblib.dump(pipeline, model_artifact_path, compress=3)
    print(f"Saved model pipeline to {model_artifact_path}")

    # Save metrics.json
    metrics_data = {
        "model_id": "tfidf-logreg",
        "model_version": "20261106-v1.0.0",
        "kind": "trained",
        "dataset_name": "TweetEval Sentiment (SemEval-2017 Task 4)",
        "accuracy": round(acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "classes": classes,
        "per_class": per_class_metrics,
        "confusion_matrix": cm_list,
        "training_time_seconds": round(train_duration, 2),
        "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "test_sample_count": len(test_df)
    }

    metrics_path = ARTIFACTS_DIR / "metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)

    # Save metadata.json
    metadata = {
        "model_id": "tfidf-logreg",
        "version": "20261106-v1.0.0",
        "hyperparameters": {
            "ngram_range": [1, 2],
            "max_features": 25000,
            "C": 1.0,
            "class_weight": "balanced"
        },
        "artifacts": {
            "model": "model.joblib",
            "metrics": "metrics.json",
            "confusion_matrix_png": "confusion_matrix.png",
            "confusion_matrix_svg": "confusion_matrix.svg"
        }
    }
    with open(ARTIFACTS_DIR / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Compute and save SHA256SUMS
    sha_manifest = []
    for fpath in [model_artifact_path, metrics_path, cm_png_path, cm_svg_path]:
        sha = compute_sha256(fpath)
        sha_manifest.append(f"{sha}  {fpath.name}")

    with open(ARTIFACTS_DIR / "SHA256SUMS", "w", encoding="utf-8") as f:
        f.write("\n".join(sha_manifest) + "\n")

    print("Model A training, evaluation, and artifact generation complete.")
    return metrics_data


if __name__ == "__main__":
    train_and_evaluate()

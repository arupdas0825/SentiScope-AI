"""Reproducible dataset downloader for SentiScope AI.
Downloads the official TweetEval (SemEval-2017 Task 4) sentiment benchmark dataset.
"""
import hashlib
import json
import os
from pathlib import Path
import urllib.request
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"

TWEETEVAL_BASE_URL = "https://raw.githubusercontent.com/cardiffnlp/tweeteval/main/datasets/sentiment"
FILES = [
    "train_text.txt", "train_labels.txt",
    "val_text.txt", "val_labels.txt",
    "test_text.txt", "test_labels.txt",
    "mapping.txt"
]

LABEL_MAP = {
    0: "negative",
    1: "neutral",
    2: "positive"
}


def download_file(url: str, dest: Path) -> str:
    print(f"Downloading {url} -> {dest}...")
    urllib.request.urlretrieve(url, dest)
    with open(dest, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()
    return sha256


def download_and_prepare_dataset():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    checksums = {}
    for filename in FILES:
        url = f"{TWEETEVAL_BASE_URL}/{filename}"
        dest = RAW_DIR / filename
        if not dest.exists():
            checksum = download_file(url, dest)
            checksums[filename] = checksum
        else:
            with open(dest, "rb") as f:
                checksums[filename] = hashlib.sha256(f.read()).hexdigest()

    # Process into clean DataFrames
    splits = {}
    for split in ["train", "val", "test"]:
        text_path = RAW_DIR / f"{split}_text.txt"
        label_path = RAW_DIR / f"{split}_labels.txt"

        with open(text_path, "r", encoding="utf-8") as f:
            texts = [line.strip() for line in f]

        with open(label_path, "r", encoding="utf-8") as f:
            labels = [int(line.strip()) for line in f]

        df = pd.DataFrame({
            "text": texts,
            "label_id": labels,
            "sentiment": [LABEL_MAP[l] for l in labels]
        })

        # Remove empty rows
        df = df[df["text"].str.len() > 0].reset_index(drop=True)
        csv_dest = PROCESSED_DIR / f"{split}.csv"
        df.to_csv(csv_dest, index=False)
        splits[split] = len(df)
        print(f"Prepared {split}.csv with {len(df)} samples.")

    metadata = {
        "dataset_name": "TweetEval Sentiment (SemEval-2017 Task 4)",
        "source": "https://github.com/cardiffnlp/tweeteval",
        "license": "Research and academic use (SemEval-2017 Task 4 benchmark)",
        "classes": ["negative", "neutral", "positive"],
        "splits": splits,
        "checksums": checksums
    }

    with open(PROCESSED_DIR / "dataset_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("Dataset download and preparation complete.")
    return metadata


if __name__ == "__main__":
    download_and_prepare_dataset()

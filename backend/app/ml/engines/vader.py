"""VADER sentiment engine wrapper (Rule-based lexicon comparison baseline)."""
from typing import Any, Dict, List, Optional, Sequence
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from backend.app.ml.engines.base import BaseEngine, EnginePrediction


class VaderEngine(BaseEngine):
    def __init__(self):
        self.id = "vader"
        self.kind = "lexicon"
        self.version = "vader-lexicon-3.3.2"
        self.classes = ["negative", "neutral", "positive"]
        self.supports_neutral = True
        self.analyzer = SentimentIntensityAnalyzer()

    def predict(self, texts: Sequence[str], explain: bool = False) -> List[EnginePrediction]:
        results = []
        for text in texts:
            scores = self.analyzer.polarity_scores(text or "")
            compound = float(scores["compound"])

            # Standard VADER thresholds
            if compound >= 0.05:
                label = "positive"
            elif compound <= -0.05:
                label = "negative"
            else:
                label = "neutral"

            # Per RULES.md and ARCHITECTURE.md: score is strength, NOT calibrated probability
            results.append(EnginePrediction(
                label=label,
                confidence=round(abs(compound), 4),
                score=round(compound, 4),
                probabilities={
                    "negative": round(float(scores["neg"]), 4),
                    "neutral": round(float(scores["neu"]), 4),
                    "positive": round(float(scores["pos"]), 4),
                },
                explanations=None
            ))

        return results

    def predict_proba(self, texts: Sequence[str]) -> Optional[Any]:
        # Lexicon engines do not produce calibrated probabilities
        return None


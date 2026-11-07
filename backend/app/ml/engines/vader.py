"""VADER sentiment engine wrapper (Rule-based lexicon comparison baseline)."""
import logging
from typing import Any, Dict, List, Optional, Sequence
from backend.app.ml.engines.base import BaseEngine, EnginePrediction
from backend.app.core.errors import ModelUnavailable

logger = logging.getLogger("sentiscope.engine.vader")


class VaderEngine(BaseEngine):
    def __init__(self):
        self.id = "vader"
        self.kind = "lexicon"
        self.version = "vader-lexicon-3.3.2"
        self.classes = ["negative", "neutral", "positive"]
        self.supports_neutral = True
        self.analyzer = self._init_analyzer()

    def _init_analyzer(self):
        # 1. Try NLTK SentimentIntensityAnalyzer
        try:
            import nltk
            try:
                nltk.data.find("sentiment/vader_lexicon.zip")
            except (LookupError, AttributeError):
                logger.info("Downloading NLTK vader_lexicon...")
                nltk.download("vader_lexicon", quiet=True)
            from nltk.sentiment.vader import SentimentIntensityAnalyzer
            analyzer = SentimentIntensityAnalyzer()
            logger.info("VADER engine successfully initialized via NLTK.")
            return analyzer
        except Exception as e_nltk:
            logger.warning(f"NLTK VADER initialization skipped/failed: {e_nltk}. Attempting fallback...")

        # 2. Try standalone vaderSentiment package
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            analyzer = SentimentIntensityAnalyzer()
            logger.info("VADER engine successfully initialized via vaderSentiment package.")
            return analyzer
        except Exception as e_vader:
            logger.error(f"vaderSentiment initialization failed: {e_vader}")
            raise ModelUnavailable(
                f"VADER lexicon engine could not be initialized. Missing NLTK lexicon and vaderSentiment."
            )

    def predict(self, texts: Sequence[str], explain: bool = False) -> List[EnginePrediction]:
        results = []
        for text in texts:
            safe_text = str(text or "")
            scores = self.analyzer.polarity_scores(safe_text)
            compound = float(scores.get("compound", 0.0))

            # Standard VADER threshold classification
            if compound >= 0.05:
                label = "positive"
            elif compound <= -0.05:
                label = "negative"
            else:
                label = "neutral"

            # Confidence is absolute compound polarity; score is signed strength [-1.0, 1.0]
            confidence = round(abs(compound), 4)
            if confidence == 0.0 and label == "neutral":
                confidence = round(float(scores.get("neu", 1.0)), 4)

            results.append(EnginePrediction(
                label=label,
                confidence=confidence,
                score=round(compound, 4),
                probabilities={
                    "negative": round(float(scores.get("neg", 0.0)), 4),
                    "neutral": round(float(scores.get("neu", 0.0)), 4),
                    "positive": round(float(scores.get("pos", 0.0)), 4),
                },
                explanations=None
            ))

        return results

    def predict_proba(self, texts: Sequence[str]) -> Optional[Any]:
        # Lexicon engines do not produce calibrated probabilities
        return None

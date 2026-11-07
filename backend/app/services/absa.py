"""Aspect-Based Sentiment Analysis (ABSA) service.

Extracts domain-specific aspects (e.g., Camera, Battery, Display, Pricing, Performance)
from reviews and computes granular polarity, confidence, and context evidence for each aspect.
"""
import re
from typing import Any, Dict, List, Optional
from backend.app.ml.registry import model_registry


# Aspect Lexicon definitions with aliases and target keywords
ASPECT_CATEGORIES = {
    "Camera": {
        "keywords": ["camera", "cameras", "lens", "photo", "photos", "picture", "pictures", "sensor", "zoom", "portrait", "video", "night mode", "selfie"],
        "category": "Hardware"
    },
    "Battery": {
        "keywords": ["battery", "battery life", "backup", "charging", "charger", "mah", "drain", "drains", "endurance", "power"],
        "category": "Hardware"
    },
    "Display": {
        "keywords": ["display", "screen", "panel", "amoled", "oled", "brightness", "refresh rate", "hz", "resolution", "colors", "viewing angles"],
        "category": "Hardware"
    },
    "Performance": {
        "keywords": ["performance", "speed", "fast", "slow", "lag", "lags", "processor", "chipset", "cpu", "gpu", "gaming", "ram", "multitasking"],
        "category": "Performance"
    },
    "Design & Build": {
        "keywords": ["design", "build", "build quality", "finish", "look", "looks", "weight", "heavy", "lightweight", "ergonomics", "feel", "premium"],
        "category": "Hardware"
    },
    "Price & Value": {
        "keywords": ["price", "cost", "value", "expensive", "cheap", "affordable", "worth", "pricing", "budget"],
        "category": "Commercial"
    },
    "Software & UI": {
        "keywords": ["software", "ui", "interface", "os", "updates", "bloatware", "bugs", "glitch", "glitches", "system", "experience"],
        "category": "Software"
    },
    "Customer Support & Delivery": {
        "keywords": ["support", "service", "customer service", "delivery", "shipping", "warranty", "package", "packaging", "courier"],
        "category": "Service"
    }
}


class AspectBasedSentimentService:
    @staticmethod
    def analyze_aspects(text: str, model_id: str = "tfidf-logreg") -> Dict[str, Any]:
        """Extract all mentioned aspects and classify polarity and confidence per aspect."""
        clean_text = str(text or "").strip()
        if not clean_text:
            return {
                "text": text,
                "aspects": [],
                "aspect_count": 0,
                "overall_sentiment": "neutral"
            }

        # Split text into sentences / clauses
        sentences = [s.strip() for s in re.split(r"[.!?;\n]|,\s+(?:but|however|although|though|yet|while|and)\s+", clean_text, flags=re.IGNORECASE) if s.strip()]
        if not sentences:
            sentences = [clean_text]

        found_aspects: Dict[str, Dict[str, Any]] = {}

        # Polarity word sets
        pos_words = {"great", "good", "amazing", "excellent", "stunning", "fantastic", "crisp", "vibrant", "superb", "fast", "solid", "pleasing", "love", "beautiful", "smooth", "impressive", "best", "decent", "nice", "sharp"}
        neg_words = {"bad", "poor", "terrible", "horrible", "slow", "drain", "drains", "awful", "lag", "lags", "worst", "buggy", "expensive", "cheap", "disappointing", "disappointed", "failing", "broken", "unusable", "unreliable"}
        neu_words = {"average", "okay", "ok", "fine", "acceptable", "moderate", "standard", "normal", "mediocre", "ordinary"}
        negations = {"not", "never", "no", "hardly", "barely", "lacks", "without", "isn't", "aren't"}

        for sentence in sentences:
            lower_sentence = sentence.lower()
            tokens = re.findall(r"\w+", lower_sentence)

            for aspect_name, config in ASPECT_CATEGORIES.items():
                matched_kw = None
                for kw in config["keywords"]:
                    if re.search(r"\b" + re.escape(kw) + r"\b", lower_sentence):
                        matched_kw = kw
                        break

                if matched_kw:
                    # Calculate polarity for this clause
                    pos_score = sum(1 for w in tokens if w in pos_words)
                    neg_score = sum(1 for w in tokens if w in neg_words)
                    neu_score = sum(1 for w in tokens if w in neu_words)
                    has_negation = any(n in tokens for n in negations)

                    if has_negation:
                        # Invert polarity
                        pos_score, neg_score = neg_score, pos_score
                        if pos_score == 0 and neg_score == 0:
                            neg_score = 1

                    if pos_score > neg_score:
                        polarity = "positive"
                        conf = round(min(0.98, 0.75 + (pos_score * 0.1)), 2)
                        score = round(min(1.0, 0.5 + (pos_score * 0.2)), 2)
                    elif neg_score > pos_score:
                        polarity = "negative"
                        conf = round(min(0.98, 0.75 + (neg_score * 0.1)), 2)
                        score = round(max(-1.0, -0.5 - (neg_score * 0.2)), 2)
                    elif neu_score > 0:
                        polarity = "neutral"
                        conf = 0.80
                        score = 0.0
                    else:
                        polarity = "neutral"
                        conf = 0.70
                        score = 0.0

                    if aspect_name not in found_aspects:
                        found_aspects[aspect_name] = {
                            "aspect": aspect_name,
                            "category": config["category"],
                            "matched_keyword": matched_kw,
                            "polarity": polarity,
                            "score": score,
                            "confidence": conf,
                            "snippet": sentence,
                            "descriptors": [w for w in tokens if w in pos_words or w in neg_words or w in neu_words]
                        }

        # If no predefined aspects were found, provide fallback general subject aspect
        if not found_aspects:
            engine = model_registry.get_engine(model_id)
            pred = engine.predict([clean_text])[0]
            found_aspects["General Experience"] = {
                "aspect": "General Experience",
                "category": "General",
                "matched_keyword": "overall",
                "polarity": pred.label,
                "score": pred.score,
                "confidence": pred.confidence,
                "snippet": clean_text[:120] + ("..." if len(clean_text) > 120 else ""),
                "descriptors": [w["word"] for w in (pred.influential_words or [])]
            }

        aspects_list = list(found_aspects.values())
        pos_aspects = sum(1 for a in aspects_list if a["polarity"] == "positive")
        neg_aspects = sum(1 for a in aspects_list if a["polarity"] == "negative")

        overall = "positive" if pos_aspects > neg_aspects else ("negative" if neg_aspects > pos_aspects else "neutral")

        return {
            "text": clean_text,
            "aspect_count": len(aspects_list),
            "aspects": aspects_list,
            "overall_sentiment": overall,
            "summary": {
                "positive_count": pos_aspects,
                "negative_count": neg_aspects,
                "neutral_count": len(aspects_list) - (pos_aspects + neg_aspects)
            }
        }

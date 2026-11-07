"""Multilingual Sentiment Analysis Service (English, Bengali, Hindi).

Provides script-based language identification and native sentiment classification
for English, Bengali (বাংলা), and Hindi (हिन्दी) with negation and intensifier support.
"""
import re
from typing import Any, Dict, List, Optional
from backend.app.ml.engines.base import EnginePrediction


class MultilingualSentimentService:
    # Unicode script ranges
    BENGALI_REGEX = re.compile(r"[\u0980-\u09FF]")
    DEVANAGARI_REGEX = re.compile(r"[\u0900-\u097F]")

    # Bengali Lexicon
    BENGALI_POS = {
        "ভালো": 1.5, "ভাল": 1.5, "সুন্দর": 1.6, "অসাধারণ": 2.2, "চমৎকার": 2.0, "দারুণ": 2.0,
        "সেরা": 2.3, "দ্রুত": 1.3, "খুশি": 1.5, "পছন্দ": 1.4, "উপকারী": 1.6, "নির্ভরযোগ্য": 1.8,
        "নিখুঁত": 2.1, "উন্নত": 1.4, "সহজ": 1.2, "অপূর্ব": 2.0, "ধন্যবাদ": 1.2, "প্রশংসা": 1.5,
        "লাভজনক": 1.4, "তৃপ্ত": 1.6, "সেরা": 2.2, "ভালোবাসি": 2.1
    }
    BENGALI_NEG = {
        "খারাপ": -1.8, "বাজে": -1.9, "ধীর": -1.3, "ধীরগতি": -1.6, "ত্রুটি": -1.5, "অপছন্দ": -1.6,
        "সমস্যা": -1.5, "জঘন্য": -2.4, "ব্যর্থ": -2.0, "রাগ": -1.6, "বিরক্ত": -1.8, "ধোঁকা": -2.5,
        "ভুল": -1.4, "অকেজো": -2.2, "নষ্ট": -2.0, "লোকসান": -1.8, "অখুশি": -1.9, "ঘৃণা": -2.3,
        "হতাশ": -2.0, "মারাত্মক": -1.5, "ঠকিয়েছে": -2.4, "বিরক্তিকর": -2.0
    }
    BENGALI_NEGATIONS = {"না", "নয়", "নয়", "নেই", "কখনও না", "কখনো না", "মোটেই না"}
    BENGALI_INTENSIFIERS = {"খুব": 1.5, "অনেক": 1.3, "অত্যন্ত": 1.8, "দারুণ": 1.4, "একদম": 1.6, "ভীষণ": 1.7}

    # Hindi Lexicon
    HINDI_POS = {
        "अच्छा": 1.5, "अच्छी": 1.5, "बढ़िया": 1.8, "शानदार": 2.1, "बेहतरीन": 2.3, "तेज़": 1.3,
        "तेज": 1.3, "खुश": 1.6, "पसंद": 1.4, "सुंदर": 1.6, "उत्तम": 2.0, "आसान": 1.2,
        "सटीक": 1.7, "मज़ेदार": 1.8, "सस्ता": 1.2, "लाजवाब": 2.2, "धन्यवाद": 1.2, "प्यार": 2.0,
        "उपयोगी": 1.5, "संतुष्ट": 1.8, "विश्वसनीय": 1.9, "सही": 1.3
    }
    HINDI_NEG = {
        "खराब": -1.8, "बेकार": -2.1, "धीमा": -1.4, "बुरा": -1.7, "बुरी": -1.7, "घटिया": -2.4,
        "समस्या": -1.5, "त्रुटि": -1.6, "गुस्सा": -1.8, "निराशा": -1.9, "धोखा": -2.5, "गलत": -1.5,
        "नुकसान": -1.7, "नापसंद": -1.6, "कठिन": -1.2, "बकवास": -2.3, "व्यर्थ": -1.9, "ठग": -2.4,
        "नष्ट": -2.0, "कष्ट": -1.6, "नाराज": -1.8, "दोष": -1.5
    }
    HINDI_NEGATIONS = {"नहीं", "नही", "ना", "मत", "बिल्कुल नहीं"}
    HINDI_INTENSIFIERS = {"बहुत": 1.5, "काफ़ी": 1.4, "काफी": 1.4, "अत्यधिक": 1.8, "एकदम": 1.6, "ज़्यादा": 1.4, "ज्यादा": 1.4}

    @classmethod
    def detect_language(cls, text: str) -> Dict[str, str]:
        """Detect language based on Unicode script frequency."""
        if not text:
            return {"code": "en", "name": "English", "flag": "🇬🇧"}

        bengali_count = len(cls.BENGALI_REGEX.findall(text))
        hindi_count = len(cls.DEVANAGARI_REGEX.findall(text))

        if bengali_count > 2 and bengali_count >= hindi_count:
            return {"code": "bn", "name": "Bengali (বাংলা)", "flag": "🇧🇩"}
        elif hindi_count > 2:
            return {"code": "hi", "name": "Hindi (हिन्दी)", "flag": "🇮🇳"}
        return {"code": "en", "name": "English", "flag": "🇬🇧"}

    @classmethod
    def analyze_indic_text(cls, text: str, lang_code: str) -> Dict[str, Any]:
        """Classify Bengali or Hindi text using native polarity lexicon with contextual rules."""
        tokens = re.findall(r"\S+", text)
        clean_tokens = [re.sub(r"[^\w\u0980-\u09FF\u0900-\u097F]", "", t) for t in tokens if t.strip()]

        if lang_code == "bn":
            pos_dict, neg_dict = cls.BENGALI_POS, cls.BENGALI_NEG
            negations, intensifiers = cls.BENGALI_NEGATIONS, cls.BENGALI_INTENSIFIERS
        else:
            pos_dict, neg_dict = cls.HINDI_POS, cls.HINDI_NEG
            negations, intensifiers = cls.HINDI_NEGATIONS, cls.HINDI_INTENSIFIERS

        pos_score = 0.0
        neg_score = 0.0
        influential = []

        window_negation = False
        window_intensity = 1.0

        for tok in clean_tokens:
            if not tok:
                continue

            if tok in negations:
                window_negation = True
                continue

            if tok in intensifiers:
                window_intensity = intensifiers[tok]
                continue

            p_val = pos_dict.get(tok, 0.0)
            n_val = neg_dict.get(tok, 0.0)

            if p_val > 0:
                score = p_val * window_intensity
                if window_negation:
                    neg_score += score * 0.95
                    influential.append({"word": f"না {tok}" if lang_code == 'bn' else f"नहीं {tok}", "score": -round(score * 0.95, 2)})
                else:
                    pos_score += score
                    influential.append({"word": tok, "score": round(score, 2)})
                window_negation = False
                window_intensity = 1.0
            elif n_val < 0:
                score = abs(n_val) * window_intensity
                if window_negation:
                    pos_score += score * 0.85
                    influential.append({"word": f"না {tok}" if lang_code == 'bn' else f"नहीं {tok}", "score": round(score * 0.85, 2)})
                else:
                    neg_score += score
                    influential.append({"word": tok, "score": -round(score, 2)})
                window_negation = False
                window_intensity = 1.0

        # Probabilities via softmax over pos, neg, neu
        import math
        scale = 1.6
        logit_pos = pos_score * scale
        logit_neg = neg_score * scale
        logit_neu = 1.0 if (pos_score == 0 and neg_score == 0) else max(0.2, 2.0 - (pos_score + neg_score))

        max_l = max(logit_pos, logit_neg, logit_neu)
        ep = math.exp(logit_pos - max_l)
        en = math.exp(logit_neg - max_l)
        eu = math.exp(logit_neu - max_l)
        s = ep + en + eu

        p_pos = round(ep / s, 4)
        p_neg = round(en / s, 4)
        p_neu = round(eu / s, 4)

        probs = {"negative": p_neg, "neutral": p_neu, "positive": p_pos}
        top_label = max(probs, key=probs.get)
        conf = probs[top_label]
        signed_score = round(p_pos - p_neg, 4)

        return {
            "label": top_label,
            "confidence": conf,
            "score": signed_score,
            "probabilities": probs,
            "influential_words": influential[:6]
        }

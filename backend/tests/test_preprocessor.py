"""Unit tests for the shared NLP Preprocessor (ml/nlp/preprocessor.py).
Validates normalization, token masking, hashtag splitting, and negation preservation.
"""
import pytest
from ml.nlp.preprocessor import (
    normalize_text,
    split_camel_case,
    tokenize,
    preprocess_for_tfidf,
    preprocess_for_lstm,
    PRESERVED_TOKENS,
    STOPWORDS,
)


def test_url_masking():
    raw = "Check out this website https://t.co/xyz123 and http://example.com/test!"
    cleaned = normalize_text(raw)
    assert "<url>" in cleaned
    assert "https://" not in cleaned
    assert "http://" not in cleaned


def test_user_mention_masking():
    raw = "Hey @elonmusk and @TwitterSupport, this service is amazing!"
    cleaned = normalize_text(raw)
    assert "<user>" in cleaned
    assert "@elonmusk" not in cleaned
    assert "@TwitterSupport" not in cleaned


def test_camelcase_hashtag_splitting():
    assert split_camel_case("MachineLearning") == "Machine Learning"
    assert split_camel_case("SentiScopeAI") == "Senti Scope AI"
    # normalize_text extracts and splits hashtags
    raw = "Loving #MachineLearning and #SentiScopeAI"
    normalized = normalize_text(raw)
    assert "Machine Learning" in normalized
    assert "Senti Scope AI" in normalized


def test_character_squeezing():
    raw = "This is soooooooo coooolllll and goooood!"
    squeezed = normalize_text(raw)
    assert "soooo" not in squeezed
    assert "soo" in squeezed
    assert "cooll" in squeezed


def test_negation_preservation():
    # Negations are critical for sentiment polarity and must not be eliminated as generic stopwords
    assert "not" in PRESERVED_TOKENS
    assert "never" in PRESERVED_TOKENS
    assert "no" in PRESERVED_TOKENS
    assert "hardly" in PRESERVED_TOKENS

    # And they should NOT be in filtered STOPWORDS
    assert "not" not in STOPWORDS
    assert "never" not in STOPWORDS
    assert "no" not in STOPWORDS

    sample = "The food was not good and never fresh"
    processed = preprocess_for_tfidf(sample)
    tokens = tokenize(processed)
    assert "not" in tokens
    assert "never" in tokens


def test_nfkc_unicode_normalization():
    # Full-width characters
    raw = "Ｔｈｉｓ ｉｓ ａ ｔｅｓｔ"
    cleaned = normalize_text(raw)
    assert "This is a test" in cleaned


def test_empty_and_whitespace_input():
    assert normalize_text("") == ""
    assert normalize_text("   \n\t  ") == ""
    assert tokenize("") == []
    assert preprocess_for_tfidf("") == ""
    assert preprocess_for_lstm("") == ""

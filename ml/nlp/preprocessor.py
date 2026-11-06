"""Single-source NLP preprocessing module for SentiScope AI.
Used by both offline training and online real-time inference.
"""
import re
import unicodedata
from typing import List, Set

# Negations and intensifiers that must NEVER be removed
PRESERVED_TOKENS: Set[str] = {
    "not", "no", "never", "none", "neither", "nor", "nowhere",
    "hardly", "scarcely", "barely", "without",
    "very", "too", "extremely", "really", "so", "quite", "especially",
    "but", "however", "although", "except"
}

# Standard English stopwords (fallback if NLTK stopwords package not yet downloaded)
FALLBACK_STOPWORDS: Set[str] = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she",
    "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
    "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
    "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
    "the", "and", "if", "or", "because", "as", "until", "while", "of", "at",
    "by", "for", "with", "about", "against", "between", "into", "through",
    "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "any", "both", "each",
    "few", "more", "most", "other", "some", "such", "only", "own", "same", "than"
}


def get_stopwords() -> Set[str]:
    """Retrieve filtered stopwords that preserve negations and sentiment intensifiers."""
    try:
        import nltk
        from nltk.corpus import stopwords
        raw_stopwords = set(stopwords.words("english"))
    except Exception:
        raw_stopwords = FALLBACK_STOPWORDS

    # Remove all preserved negation/intensifier terms
    return raw_stopwords - PRESERVED_TOKENS


STOPWORDS: Set[str] = get_stopwords()

# Regex patterns
URL_PATTERN = re.compile(r"https?://\S+|www\.\S+")
MENTION_PATTERN = re.compile(r"@\w+")
HASHTAG_PATTERN = re.compile(r"#(\w+)")
REPEAT_PATTERN = re.compile(r"(.)\1{2,}")


def split_camel_case(text: str) -> str:
    """Split CamelCase words, e.g. #BadService -> Bad Service."""
    return re.sub(r"([a-z])([A-Z])", r"\1 \2", text)


def normalize_text(text: str) -> str:
    """Apply deterministic Unicode normalization and entity substitutions."""
    if not text:
        return ""

    # NFKC Unicode normalization
    text = unicodedata.normalize("NFKC", str(text))

    # Replace URLs with <url>
    text = URL_PATTERN.sub("<url>", text)

    # Replace mentions with <user>
    text = MENTION_PATTERN.sub("<user>", text)

    # Process hashtags: keep word and split CamelCase
    def replace_hashtag(match):
        raw_tag = match.group(1)
        return split_camel_case(raw_tag)

    text = HASHTAG_PATTERN.sub(replace_hashtag, text)

    # Squeeze repeated characters: e.g. soooo -> soo
    text = REPEAT_PATTERN.sub(r"\1\1", text)

    # Normalize whitespace
    text = " ".join(text.split())

    return text


def tokenize(text: str) -> List[str]:
    """Tokenize text using tweet/sentiment aware word boundaries."""
    normalized = normalize_text(text).lower()

    # Match words, contractions (don't, can't), or special tokens (<url>, <user>)
    tokens = re.findall(r"<[a-z]+>|[a-z]+(?:'[a-z]+)?", normalized)
    return tokens


def preprocess_for_tfidf(text: str) -> str:
    """Clean, tokenize, remove non-sentiment stopwords, and rejoin for TF-IDF."""
    tokens = tokenize(text)
    filtered = [t for t in tokens if t not in STOPWORDS and len(t) > 1 or t in {"no"}]
    return " ".join(filtered)


def preprocess_for_lstm(text: str) -> str:
    """LSTM benefits from keeping sentence structure and function words."""
    tokens = tokenize(text)
    return " ".join(tokens)


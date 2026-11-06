"""Configuration management for SentiScope AI."""
import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

# Root directory of backend and project
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent


class Settings(BaseModel):
    app_name: str = "SentiScope AI"
    app_env: str = os.getenv("APP_ENV", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() in ("true", "1", "yes")

    # API Server
    api_host: str = os.getenv("API_HOST", "127.0.0.1")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_v1_prefix: str = "/api/v1"
    cors_origins: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
        ).split(",")
        if origin.strip()
    ]

    # Limits & Constraints
    max_text_length: int = int(os.getenv("MAX_TEXT_LENGTH", "2000"))
    max_bulk_items: int = int(os.getenv("MAX_BULK_ITEMS", "500"))
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "10"))
    max_csv_rows: int = int(os.getenv("MAX_CSV_ROWS", "10000"))
    rate_limit_per_minute: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    api_key: str = os.getenv("API_KEY", "")

    # Paths
    database_url: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BACKEND_DIR / 'sentiscope.db'}"
    )
    artifacts_dir: Path = Path(os.getenv("ARTIFACTS_DIR", str(PROJECT_ROOT / "artifacts" / "models")))
    data_dir: Path = Path(os.getenv("DATA_DIR", str(PROJECT_ROOT / "data")))

    # Model defaults
    default_model_id: str = os.getenv("DEFAULT_MODEL_ID", "tfidf-logreg")
    warmup_models: bool = os.getenv("WARMUP_MODELS", "false").lower() in ("true", "1", "yes")


settings = Settings()


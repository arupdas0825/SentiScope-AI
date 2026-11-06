"""SentiScope AI - Production Server Entry Point.
Runs the FastAPI backend and serves the compiled React frontend simultaneously.
"""
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import uvicorn
from backend.app.core.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.app_name} on http://{settings.api_host}:{settings.api_port}")
    uvicorn.run(
        "backend.app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False
    )


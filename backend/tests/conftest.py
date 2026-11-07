"""Pytest fixtures and environment configuration.
Isolates test database from the live server to avoid SQLite file locking on Windows.
"""
import os
import sys
from pathlib import Path
import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Set isolated test database path before any backend modules are loaded
TEST_DB_PATH = PROJECT_ROOT / "backend" / "test_sentiscope.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

# Import after env is configured
from backend.app.main import app
from backend.app.db.init_db import init_db
from backend.app.db.session import engine, Base

# Initialize test database tables and seeds
init_db()


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    yield
    # Cleanup test db after test session if needed
    try:
        engine.dispose()
        if TEST_DB_PATH.exists():
            TEST_DB_PATH.unlink()
    except Exception:
        pass

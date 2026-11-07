"""Automated security, validation, and edge-case integration tests.
Tests bounds, formula injection escaping, empty inputs, and model integrity.
"""
import io
import sys
from pathlib import Path
import httpx
import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app
from backend.app.services.reports import ReportsService


@pytest.mark.asyncio
async def test_empty_string_rejection():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/analyze", json={"text": "", "model_id": "tfidf-logreg"})
        assert res.status_code == 422
        data = res.json()
        assert "error" in data
        assert data["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_oversized_string_rejection():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Limit is 2000 chars per PRD & Pydantic schema
        oversized = "a" * 2500
        res = await client.post("/api/v1/analyze", json={"text": oversized, "model_id": "tfidf-logreg"})
        assert res.status_code == 422
        data = res.json()
        assert "error" in data
        assert data["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_bulk_limit_enforcement():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Empty bulk array
        res = await client.post("/api/v1/analyze/bulk", json={"texts": [], "model_id": "tfidf-logreg"})
        assert res.status_code == 422
        assert "error" in res.json()

        # Exceeds max 500 items
        too_many = ["Sample comment"] * 505
        res = await client.post("/api/v1/analyze/bulk", json={"texts": too_many, "model_id": "tfidf-logreg"})
        assert res.status_code == 422
        assert "error" in res.json()


@pytest.mark.asyncio
async def test_unregistered_model_rejection():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/analyze", json={
            "text": "Valid text input for analysis",
            "model_id": "non-existent-fake-model"
        })
        assert res.status_code in (400, 404, 422, 503)
        data = res.json()
        assert "error" in data


@pytest.mark.asyncio
async def test_keras_lstm_model_inference():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/analyze", json={
            "text": "The battery life on this laptop is incredible, very satisfied!",
            "model_id": "keras-lstm",
            "explain": True
        })
        assert res.status_code == 200
        data = res.json()
        assert data["label"] == "positive"
        assert data["model_id"] == "keras-lstm"
        assert "probabilities" in data
        assert data["probabilities"]["positive"] > 0.5


def test_csv_formula_injection_sanitization():
    """Verify that dangerous CSV formula characters (=, +, -, @) are properly escaped with leading apostrophe."""
    malicious_inputs = [
        "=SUM(A1:A10)",
        "+cmd|' /C calc'!A0",
        "-2+3*10",
        "@SUM(B1:B5)",
        "=HYPERLINK('http://malicious.com','Click Me')"
    ]
    for bad_text in malicious_inputs:
        escaped = ReportsService._sanitize_csv_cell(bad_text)
        assert escaped.startswith("'"), f"Failed to escape dangerous cell: {bad_text} -> {escaped}"

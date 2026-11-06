"""Smoke tests for FastAPI backend routes and model inference using httpx AsyncClient."""
import asyncio
import sys
from pathlib import Path
import httpx

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app
from backend.app.db.init_db import init_db

# Ensure DB initialized
init_db()


async def main():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("Testing /api/v1/health...", flush=True)
        res = await client.get("/api/v1/health")
        assert res.status_code == 200, f"Health failed: {res.text}"
        data = res.json()
        assert data["status"] == "healthy"
        print("Health check PASSED:", data, flush=True)

        print("Testing /api/v1/models...", flush=True)
        res = await client.get("/api/v1/models")
        assert res.status_code == 200, f"Models failed: {res.text}"
        models = res.json()
        assert len(models) >= 1
        assert models[0]["model_id"] == "tfidf-logreg"
        print("Models check PASSED. Default model:", models[0]["model_id"], "Accuracy:", models[0]["metrics"]["accuracy"], flush=True)

        print("Testing /api/v1/analyze...", flush=True)
        res = await client.post("/api/v1/analyze", json={
            "text": "Antigravity AI is absolutely incredible and very fast!",
            "model_id": "tfidf-logreg",
            "explain": True
        })
        assert res.status_code == 200, f"Analyze failed: {res.text}"
        pred = res.json()
        assert pred["label"] in ("positive", "negative", "neutral")
        assert pred["confidence"] > 0
        print("Prediction PASSED. Label:", pred["label"], "Confidence:", pred["confidence"], flush=True)

        print("Testing /api/v1/analytics/overview...", flush=True)
        res = await client.get("/api/v1/analytics/overview")
        assert res.status_code == 200, f"Analytics failed: {res.text}"
        analytics = res.json()
        assert "kpis" in analytics
        print("Analytics check PASSED. Total records:", analytics["kpis"]["total_records"], flush=True)

        print("\n>>> ALL BACKEND API SMOKE TESTS PASSED SUCCESSFULLY! <<<", flush=True)


if __name__ == "__main__":
    asyncio.run(main())

"""Database initialization and schema creation."""
import datetime
from backend.app.db.session import engine, Base, SessionLocal
from backend.app.db.models import ModelVersion


def init_db():
    Base.metadata.create_all(bind=engine)

    # Seed baseline model versions if they don't already exist
    db = SessionLocal()
    try:
        existing_models = {m.id: m for m in db.query(ModelVersion).all()}

        default_versions = [
            ModelVersion(
                id="tfidf-logreg-v1",
                model_id="tfidf-logreg",
                kind="trained",
                version="20261106-v1.0.0",
                metrics_path="artifacts/models/tfidf-logreg/metrics.json",
                created_at=datetime.datetime.utcnow(),
            ),
            ModelVersion(
                id="keras-lstm-v1",
                model_id="keras-lstm",
                kind="trained",
                version="20261106-v1.0.0",
                metrics_path="artifacts/models/keras-lstm/metrics.json",
                created_at=datetime.datetime.utcnow(),
            ),
            ModelVersion(
                id="vader-v1",
                model_id="vader",
                kind="lexicon",
                version="vader-lexicon-3.3.2",
                metrics_path=None,
                created_at=datetime.datetime.utcnow(),
            ),
            ModelVersion(
                id="vader-lexicon-v1",
                model_id="vader",
                kind="lexicon",
                version="vader-lexicon-3.3.2",
                metrics_path=None,
                created_at=datetime.datetime.utcnow(),
            ),
        ]

        for mv in default_versions:
            if mv.id not in existing_models:
                db.add(mv)

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("Database tables and seed records initialized successfully.")


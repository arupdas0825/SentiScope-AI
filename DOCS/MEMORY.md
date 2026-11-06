# SentiScope AI — Project Memory & Working Context

This file is the persistent project context for the AI coding agent. It records decisions that must remain consistent throughout development.

## 1. Project identity

- **Name:** SentiScope AI
- **Tagline:** Intelligent Sentiment & Social Analytics
- **Purpose:** A new AI-powered sentiment-analysis web application for single text, batch text, and CSV dataset analysis.
- **Primary delivery context:** Academic AI/ML project with a professional portfolio-quality interface.

## 2. Absolute clean-start instruction

**Create SentiScope AI entirely from scratch.**

There is no existing application to inspect or migrate. The agent must not:
- Ask for or search for an old project ZIP.
- Open, extract, inspect, analyse, or compare any previous source-code archive or repository.
- Search the workspace for legacy application code to reuse.
- Copy modules, assets, model files, datasets, configuration, or code from another project.
- Make the success of this project depend on a previous implementation.

The only project inputs are the seven SentiScope AI documentation files and any new datasets/assets explicitly provided for this project. If the workspace contains unrelated files, ignore them. Create a clean `SentiScope-AI` project directory or use the explicitly designated empty project directory.

## 3. Confirmed technology decisions

### Frontend
- React
- Vite
- JavaScript / JSX (not TypeScript unless separately approved)
- Tailwind CSS
- React Router
- TanStack Query
- Recharts
- Framer Motion
- Lucide React

### Backend
- Python 3.11+
- FastAPI
- Pydantic
- SQLAlchemy
- SQLite baseline database

### AI / ML
- scikit-learn
- pandas
- NumPy
- NLTK where useful
- TensorFlow/Keras for an advanced LSTM model when feasible

### Testing
- Pytest
- Vitest
- React Testing Library

## 4. Confirmed product behaviour

- Required sentiment labels: positive, negative, neutral.
- The application must run genuine model inference.
- The initial ML baseline is TF-IDF + Logistic Regression.
- LSTM is an advanced model, subject to dataset and environment feasibility.
- Evaluation must use a held-out test set.
- Macro-F1, precision, recall, accuracy, weighted-F1, classification report, and confusion matrix are required.
- Analytics must be derived from actual predictions or evaluation results.
- Dataset analysis is not live social media monitoring.
- No fake sample metrics or fabricated real-time activity.

## 5. Design decisions

- Light theme is primary and the default.
- Dark theme is secondary and must be complete.
- Design should feel like a refined modern analytics SaaS product.
- Use clear typography, disciplined spacing, restrained colour, accessible contrast, polished charts, and responsive layouts.
- Use subtle motion only.
- Do not imitate a reference screenshot pixel-for-pixel.
- Do not let visual effects compromise speed or accessibility.

## 6. Privacy and data decisions

- Do not store raw user text by default.
- If raw-text history is implemented, make it an explicit setting and explain retention.
- Validate CSV uploads and impose file/row/column limits.
- Do not log sensitive raw text or credentials.
- Do not put secrets in frontend environment variables.
- Do not accept untrusted serialized model files.

## 7. Development rules

- Treat PRD.md as the product requirement source.
- Treat ARCHITECTURE.md as the technical structure source.
- Treat DESIGN.md as the visual system source.
- Treat PHASES.md as the implementation sequence.
- Treat RULES.md as engineering standards.
- Treat SECURITY.md as mandatory security guidance.
- If documents conflict, stop and report the conflict; do not silently choose.
- Do not mark a feature complete until it works and its acceptance checks pass.
- Build the smallest complete academic MVP before optional features.
- Update this file when an approved architectural or product decision changes.

## 8. Current implementation status

Status as of 2026-11-06 (Complete Application Implemented):
- **Documentation baseline:** Updated and aligned with SentiScope AI specifications.
- **Frontend:** Fully implemented with React 18, Vite 6, Tailwind CSS, TanStack Query v5, Recharts, and Lucide React. Production build compiled cleanly to `frontend/dist/`.
- **Backend:** Modular FastAPI application under `/api/v1` with Pydantic v2 schemas, central error envelopes, and request ID tracking.
- **ML pipeline:** Fully implemented in `ml/`. TweetEval (SemEval-2017 Task 4) benchmark dataset downloaded and prepared (45,615 train / 2,000 val / 12,284 test). Model A (`TF-IDF + Logistic Regression`) trained and evaluated on the official held-out test split (Accuracy: 58.6%, Macro-F1: 0.584). `metrics.json` and official plotted `confusion_matrix.png` generated and verified with SHA-256 manifests.
- **Database:** SQLite with WAL mode via SQLAlchemy 2.x initialized with schemas for `datasets`, `model_versions`, `analysis_runs`, `predictions`, and `jobs`.
- **Modules Implemented:**
  1. Executive Dashboard (KPIs, donut distribution, time trends, recent analyses, model profile).
  2. Text Analysis (Single prediction, probability bars, token coefficient explainability).
  3. Batch Analysis (Multiline paste + drag-and-drop CSV processing).
  4. Analytics (Sentiment share, time series, platform breakdown, keyword frequencies).
  5. Model Evaluation (Metrics dashboard, classification report, confusion matrix grid, plotted heatmap viewer).
  6. Analysis History (Search, filter by class, pagination, deletion).
  7. Reports & Exports (Sanitized CSV with formula injection prevention, structured JSON).
  8. Platform Settings (Light/Dark themes, input limits, academic attribution).
- **Tests:** Backend smoke tests passing (`backend/tests/test_api_smoke.py`).
- **Production Server:** Unified server entry point `run_server.py` serving API and compiled frontend concurrently.

## 9. Explicitly deferred capabilities

Unless later approved and implemented, do not claim:
- Live social media ingestion.
- Automatic scraping of social platforms.
- Real-time monitoring or alerting.
- Production-scale multi-tenant SaaS.
- Guaranteed sentiment correctness.
- Support for every language or domain.

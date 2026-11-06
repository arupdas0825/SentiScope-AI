# SentiScope AI — Development Phases & Milestones

## Execution rule

Build SentiScope AI from a clean slate. Do not inspect, request, extract, or reuse any previous project ZIP, repository, or codebase. The seven SentiScope AI specification files are the project baseline.

Work phase by phase. Do not claim completion without running the relevant checks. Prioritise a reliable academic MVP before optional advanced features.

## Phase 0 — Specification and project setup

Tasks:
- Read all seven documentation files.
- Identify contradictions or missing decisions.
- Confirm React + Vite frontend and Python + FastAPI backend.
- Create a new `SentiScope-AI` directory.
- Establish `.gitignore`, `.env.example`, README skeleton, and dependency manifests.
- Create clean frontend, backend, and ML package structures.

Acceptance:
- No legacy code or archive has been inspected or imported.
- Frontend and backend install independently.
- Project setup commands are documented.

## Phase 1 — Frontend foundation and design system

Tasks:
- Configure React + Vite + JavaScript.
- Configure Tailwind CSS and routing.
- Build AppShell, sidebar, topbar, page header, theme system, and shared components.
- Implement light theme as default and complete dark theme.
- Add responsive breakpoints and accessible interaction states.

Acceptance:
- All main routes render.
- Theme toggle works and persists appropriately.
- Layout works on desktop, tablet, and mobile.
- No page relies on fake analytics.

## Phase 2 — Backend foundation

Tasks:
- Configure FastAPI application.
- Add `/api/v1` routing.
- Add Pydantic schemas, settings, structured errors, logging, and CORS configuration.
- Configure SQLAlchemy and SQLite.
- Add health endpoint and backend tests.

Acceptance:
- Backend starts successfully.
- Health endpoint responds.
- Validation and error handling tests pass.

## Phase 3 — Dataset preparation and baseline ML

Tasks:
- Select a suitable permitted three-class sentiment dataset.
- Document its source, licence, fields, label mapping, and limitations.
- Validate records and label distribution.
- Implement reproducible split with fixed random seed.
- Implement TF-IDF + Logistic Regression pipeline.
- Save model pipeline and metadata securely.

Acceptance:
- All three labels are represented.
- Training is reproducible.
- Preprocessing does not leak test information.
- Model artifact loads in the trusted inference service.

## Phase 4 — Single-text analysis

Tasks:
- Implement prediction service.
- Implement `POST /api/v1/analysis/predict`.
- Build Text Analysis UI.
- Display predicted label, supported score information, and model metadata.
- Add input validation, loading, empty, and error states.

Acceptance:
- User can submit text and receive a genuine prediction.
- Unsupported/empty input is rejected clearly.
- API and UI tests pass.

## Phase 5 — Batch and CSV analysis

Tasks:
- Implement batch prediction.
- Add safe CSV validation and bounded processing.
- Allow text-column selection.
- Return per-row predictions and row-level errors.
- Add export of processed results.

Acceptance:
- Valid CSV can be processed.
- Invalid files are rejected safely.
- Row counts and aggregate results match the output.
- Upload limits are enforced.

## Phase 6 — Analytics dashboard

Tasks:
- Implement overview and analytics endpoints.
- Build KPI cards, distribution charts, trend charts, and supported breakdowns.
- Add filters and empty states.
- Ensure every chart is populated from API data.

Acceptance:
- KPI values reconcile with underlying records.
- Trends appear only when valid dates exist.
- No fake real-time monitoring or fabricated activity appears.

## Phase 7 — Model evaluation and registry

Tasks:
- Calculate accuracy, macro precision, macro recall, macro F1, weighted F1, and classification report.
- Generate confusion matrix from held-out test data.
- Implement model metadata registry.
- Build Model Performance and Model Registry pages.

Acceptance:
- Metrics are reproducible from the evaluation run.
- Confusion matrix labels and values are correct.
- Only trusted, available models are selectable.

## Phase 8 — Advanced LSTM model (conditional)

Proceed only if dataset size, available compute, and remaining schedule make it reasonable.

Tasks:
- Implement tokenizer and sequence pipeline.
- Train an LSTM with validation and early stopping.
- Save model and preprocessing assets.
- Evaluate with the same held-out protocol.
- Compare against baseline using macro-F1 and class-level metrics.

Acceptance:
- Model trains and loads successfully.
- Preprocessing at inference matches training.
- Comparison uses the same test split.
- If not feasible, document the reason and retain the baseline as the completed model.

## Phase 9 — History, reports, and settings

Tasks:
- Implement privacy-aware history.
- Avoid raw-text storage by default.
- Add deletion and pagination if history is enabled.
- Add report generation and exports.
- Complete settings UI.

Acceptance:
- Retention behaviour matches the setting.
- Deletion works.
- Exports contain correct source/model metadata.
- No private text is exposed unintentionally.

## Phase 10 — Testing, security, and refinement

Tasks:
- Run backend, ML, and frontend tests.
- Test invalid input, oversized files, malformed CSV, and unavailable model.
- Review CORS, environment variables, file handling, logging, and artifact loading.
- Fix accessibility and responsive issues.
- Check performance and dependency consistency.

Acceptance:
- Critical tests pass.
- No known critical security issue remains.
- Main flows work end-to-end.

## Phase 11 — Documentation, academic evidence, and release

Tasks:
- Complete README with setup, training, inference, testing, and limitations.
- Document API endpoints.
- Capture genuine application screenshots.
- Record actual training/evaluation settings and results.
- Prepare architecture and workflow diagrams.
- Prepare report-ready methodology and results notes.
- Verify clean installation from documented steps.

Acceptance:
- A new user can run the project from README.
- Evidence reflects the actual implementation.
- No fabricated results, references, or claims are included.
- Final repository is clean and submission-ready.

## Priority guidance

**P0 — Must complete:** setup, baseline three-class model, single prediction, CSV analysis, real dashboard metrics, held-out evaluation, confusion matrix, README, tests.

**P1 — Strongly recommended:** model registry, history with privacy controls, exports, responsive polish, dark theme.

**P2 — Conditional enhancements:** LSTM/BiLSTM comparison, topic analysis, advanced keyword exploration, additional dataset formats.

If time is limited, finish P0 reliably before attempting P1 or P2.

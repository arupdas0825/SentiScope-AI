# SentiScope AI — Product Requirements Document (PRD)

**Product name:** SentiScope AI  
**Tagline:** Intelligent Sentiment & Social Analytics  
**Document status:** Project baseline  
**Product type:** AI-powered sentiment analysis and text analytics web application

## 1. Product vision

SentiScope AI is a new, independently designed sentiment-analysis platform. It allows users to analyse individual text entries and uploaded datasets, classify text into positive, negative, or neutral sentiment, and explore the results through clear analytics and model-performance views.

**This project must be created from a clean slate.** Do not inspect, open, extract, analyse, import, copy, migrate, or depend on any previous project, source-code directory, repository, archive, ZIP file, or existing implementation. No legacy codebase is part of this project. Build the application and its documentation independently from these seven specification files.

## 2. Goals

- Deliver a functional academic AI/ML project with a polished, professional interface.
- Implement a real three-class sentiment classification pipeline.
- Support single-text and batch/CSV analysis.
- Show transparent analytics derived from actual model predictions and stored analysis records.
- Evaluate models with reproducible metrics and a confusion matrix.
- Provide clear setup, usage, testing, and project-report documentation.
- Keep the architecture modular enough to extend after the academic submission.

## 3. Non-goals and constraints

- No live social-network scraping or live social listening in the initial release.
- No claim that the application monitors social platforms in real time.
- No fabricated prediction, dataset, dashboard, model-accuracy, or benchmark data.
- No paid external AI API is required for core functionality.
- Do not build user accounts, multi-tenant billing, or enterprise access control unless explicitly approved as a later extension.
- Do not inspect or reuse any previous project or ZIP.

## 4. Target users

1. **Student / project evaluator:** wants to run the application, inspect the ML workflow, and verify results.
2. **Researcher / analyst:** wants to analyse text datasets and compare sentiment patterns.
3. **General user:** wants to enter text and understand its predicted sentiment and confidence.

## 5. Core user journeys

### 5.1 Single-text analysis
1. User opens the Text Analysis page.
2. User enters text and submits it.
3. Backend validates the input and runs the selected trained model.
4. UI displays predicted class, confidence/probability information where calibrated and meaningful, and a concise explanation of the result.
5. If history is enabled, the result is stored according to the privacy settings.

### 5.2 CSV analysis
1. User opens Dataset Analysis and uploads a CSV.
2. UI/backend validates file type, size, row count, encoding, and selected text column.
3. User selects the text column and optionally a date/category column if supported.
4. Backend processes rows in batches and returns per-row predictions and aggregate statistics.
5. User reviews results and downloads an output file or report.

### 5.3 Model evaluation
1. User opens Model Performance.
2. User selects an available trained model and evaluation run.
3. UI displays metrics calculated from a held-out test set.
4. UI displays the confusion matrix and class-level precision, recall, and F1.

## 6. Functional requirements

### FR-01 — Overview dashboard
- Show the number of records analysed from actual stored records.
- Show positive, negative, and neutral counts and percentages.
- Show sentiment distribution and time trends only when valid timestamps exist.
- Show recent analyses and dataset summaries when data exists.
- Show meaningful empty states when there is no data.

### FR-02 — Single-text prediction
- Accept plain text.
- Reject empty or whitespace-only input.
- Enforce configurable maximum text length.
- Return one of: `positive`, `negative`, `neutral`.
- Return model identifier and prediction metadata.
- Never invent confidence values. Explain that a model score is not a guarantee of correctness.

### FR-03 — Batch prediction
- Accept multiple text entries with configurable batch limits.
- Validate each row and report row-level errors without silently dropping records.
- Return prediction for each valid row.
- Provide aggregate counts and percentages derived from returned predictions.

### FR-04 — CSV upload
- Accept CSV only in the initial release.
- Let the user select the text column.
- Validate file size, row count, column count, encoding, and empty values.
- Reject malformed or unsafe input with actionable messages.
- Provide downloadable results with predictions.

### FR-05 — Analytics
- Show sentiment distribution, class proportions, and supported breakdowns.
- Show trends only when source data contains usable dates.
- Show category/platform breakdown only when the uploaded data contains an appropriate column.
- Clearly label dataset-derived results and never imply live platform monitoring.

### FR-06 — Model management
- Display available model names, versions, training date, supported labels, and evaluation metadata.
- Allow selection among models that are actually installed and loadable.
- Do not expose arbitrary file paths or permit untrusted model uploads.

### FR-07 — Model evaluation
- Calculate accuracy, macro precision, macro recall, macro F1, weighted F1, and a classification report.
- Generate a confusion matrix from a held-out test set.
- Record dataset provenance, split strategy, random seed, preprocessing, and model configuration.
- Do not hardcode benchmark scores.

### FR-08 — History
- Store analysis records only according to the configured retention/privacy policy.
- Allow filtering and pagination.
- Provide deletion of stored records if history is enabled.
- Avoid storing raw text by default unless the user explicitly enables it.

### FR-09 — Reports and exports
- Export analysed CSV results.
- Export a concise report containing dataset details, model details, metrics, and analysis summaries.
- Distinguish prediction results from ground-truth evaluation results.

### FR-10 — Settings
- Provide light and dark themes.
- Light theme is the default.
- Provide model selection and privacy/history settings where implemented.
- Settings must persist safely and predictably.

## 7. Machine-learning requirements

### 7.1 Labels
The required label set is exactly:
- `negative`
- `neutral`
- `positive`

The training dataset must contain all three classes. If the selected dataset does not, the training pipeline must stop with a clear explanation rather than silently inventing or mapping labels.

### 7.2 Baseline model
Implement a reproducible baseline using:
- Text preprocessing appropriate to the dataset.
- TF-IDF vectorization.
- Logistic Regression or another documented classical classifier.
- A stratified train/validation/test split where class distribution permits.

The vectorizer and classifier must be saved together as a single trusted pipeline artifact where practical.

### 7.3 Advanced model
Implement an LSTM-based model using TensorFlow/Keras only if the dataset size, environment, and project schedule support it. It must use a consistent tokenizer/sequence preprocessing pipeline, validation data, early stopping, and saved preprocessing assets.

A BiLSTM may be added only if justified and evaluated. Do not add models merely to inflate feature count.

### 7.4 Evaluation integrity
- Keep test data isolated until final evaluation.
- Prevent preprocessing leakage by fitting transformations on training data only.
- Use a fixed random seed and record it.
- Report class imbalance and dataset limitations.
- Include macro-F1 because it is useful for imbalanced multi-class evaluation.
- Never claim the model understands sarcasm, context, or domain-specific language unless tested.

## 8. UI/UX requirements

- React + Vite frontend.
- Premium, clean analytics-SaaS visual language.
- Light theme as the primary/default theme.
- Dark theme as a fully supported secondary theme.
- Responsive desktop, tablet, and mobile layouts.
- Consistent typography, spacing, colour tokens, forms, cards, tables, and chart styling.
- Accessible contrast, keyboard focus, labels, and semantic controls.
- Subtle transitions only; animation must not obstruct usability.
- Avoid excessive gradients, glass effects, decorative clutter, and oversized empty hero sections.

### Main navigation
- Overview
- Text Analysis
- Dataset Analysis
- Analytics
- Model Performance
- Model Registry
- Analysis History
- Reports
- Settings

Only expose a navigation item as active functionality when its feature is implemented. Clearly mark planned features or keep them out of the active navigation.

## 9. Technical architecture

- **Frontend:** React, Vite, JavaScript/JSX, Tailwind CSS, React Router, TanStack Query, Recharts, Framer Motion, Lucide React.
- **Backend:** Python 3.11+, FastAPI, Pydantic, SQLAlchemy.
- **ML/NLP:** scikit-learn, pandas, NumPy, NLTK as needed, TensorFlow/Keras for the optional advanced model.
- **Database:** SQLite for the academic/local deployment baseline.
- **Testing:** Pytest for backend/ML; Vitest and React Testing Library for frontend.
- **API:** versioned REST endpoints under `/api/v1`.

The frontend must communicate with the backend through documented HTTP APIs. Do not embed model inference or secret credentials in browser code.

## 10. Quality requirements

- A new developer can install and run the project by following README instructions.
- Backend and frontend start independently and communicate successfully.
- Core flows have automated tests.
- Invalid inputs produce safe, understandable errors.
- All displayed analytics are derived from real data.
- No secrets, private datasets, or generated model artifacts are committed unless explicitly intended and documented.
- Provide `.env.example` with placeholders only.

## 11. Acceptance criteria

The initial release is accepted when:
1. The application starts locally using documented commands.
2. The light theme loads by default and the dark theme works.
3. A user can submit text and receive a real three-class model prediction.
4. A valid CSV can be uploaded and analysed.
5. Invalid files and malformed rows are handled safely.
6. Dashboard values match backend data.
7. Model evaluation metrics and confusion matrix are generated from a held-out test set.
8. Tests cover critical API, validation, ML, and frontend flows.
9. README explains setup, data requirements, training, inference, testing, and limitations.
10. The project contains no dependency on any previous codebase or ZIP.

## 12. Academic report support

The project should generate enough reproducible evidence for a report:
- Problem statement and objectives.
- Literature/background section references to be added by the student.
- Dataset description and licence/source.
- Methodology and architecture.
- Preprocessing and model design.
- Experimental setup.
- Evaluation metrics and confusion matrix.
- Results, limitations, and future scope.

Do not fabricate citations, dataset provenance, experiments, or results.

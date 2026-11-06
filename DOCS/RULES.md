# SentiScope AI — Engineering Rules

These rules are mandatory for all implementation work.

## 1. Clean-slate rule

- Build a completely new project.
- Do not inspect, request, open, extract, analyse, copy, migrate, or reuse any previous codebase, repository, ZIP, or archive.
- Do not search the workspace for old application source.
- Ignore unrelated files in the workspace.
- Use only the seven SentiScope AI specification files and new resources explicitly provided for this project.
- Do not claim that legacy code was audited or reused.

## 2. Architecture rules

- Frontend: React + Vite + JavaScript/JSX.
- Backend: Python + FastAPI.
- ML logic must be separate from API route handlers.
- Frontend communicates with backend through documented REST APIs.
- Use versioned API routes under `/api/v1`.
- Keep dependencies and responsibilities clear.
- Avoid premature abstraction and unnecessary packages.

## 3. Python rules

- Use clear, typed Python functions where practical.
- Follow PEP 8.
- Use a consistent formatter and linter.
- Keep configuration outside source code.
- Use Pydantic for API validation.
- Use SQLAlchemy for database access.
- Do not use broad exception handling that hides errors.
- Add meaningful tests for preprocessing, training, inference, and validation.

## 4. Frontend rules

- Use functional React components and hooks.
- Keep components focused and reusable.
- Use feature-based folders.
- Keep API calls outside presentation components.
- Use TanStack Query for server state.
- Handle loading, error, empty, and success states.
- Use semantic HTML and accessible form labels.
- Avoid direct DOM manipulation unless a library requires it.
- Keep theme colours and spacing in shared tokens.
- Do not hardcode analytics or pretend API data is real.

## 5. Machine-learning rules

- Required classes: positive, negative, neutral.
- Confirm label mapping before training.
- Do not silently convert unknown labels.
- Use train/validation/test separation.
- Fit vectorizers and preprocessing only on training data.
- Keep test data isolated until final evaluation.
- Use fixed seeds where possible.
- Save model and preprocessing as compatible artifacts.
- Record dataset source, licence, configuration, split, and model version.
- Report macro-F1 and class-level metrics.
- Never fabricate accuracy or evaluation results.
- Do not claim confidence is calibrated unless calibration has been performed and evaluated.

## 6. Data rules

- Validate uploaded files and input values.
- Enforce file size, row count, column count, and text length limits.
- Report invalid rows transparently.
- Do not silently discard records.
- Do not store raw text by default.
- Do not include private datasets in Git unless authorised and licensed.
- Use synthetic examples only when clearly labelled as examples.

## 7. API rules

- Use consistent request and response schemas.
- Return appropriate HTTP status codes.
- Validate pagination and filtering parameters.
- Keep routes thin.
- Do not expose internal paths, stack traces, or secrets.
- Add tests for success and failure cases.
- Document every implemented endpoint.

## 8. UI/UX rules

- Light theme is primary and default.
- Dark theme is secondary and complete.
- Follow DESIGN.md.
- Maintain responsive behaviour.
- Use sentiment colours consistently and pair them with text labels/icons.
- Respect reduced-motion settings.
- Avoid visual effects that reduce readability or performance.

## 9. Testing rules

- Add tests with each meaningful feature.
- Backend and ML: Pytest.
- Frontend: Vitest and React Testing Library.
- Test normal, boundary, and invalid inputs.
- Do not mock away the core ML inference in integration tests intended to verify inference.
- Run relevant tests before marking a phase complete.
- Report skipped tests and reasons.

## 10. Git and repository rules

- Keep `.env`, secrets, local databases, private datasets, caches, and unnecessary model binaries out of version control.
- Provide `.env.example` with placeholders.
- Use meaningful commit messages.
- Keep README and dependency manifests current.
- Do not commit generated files unless required and documented.

## 11. Agent communication rules

Before each phase, state the goal and planned files.
After each phase, report:
- What was implemented.
- Files created or changed.
- Commands/tests executed.
- Actual test results.
- Known issues and next steps.

Never say “done”, “working”, “secure”, or “production-ready” without evidence.

If a requirement is unclear or documents conflict, stop and ask for a decision rather than inventing a requirement.

## 12. Scope discipline

- Complete P0 requirements before optional features.
- Do not add features solely to make the project appear larger.
- Do not add live social scraping to the initial scope.
- Do not add a feature to navigation before it works.
- Prefer a smaller reliable product over a broad incomplete one.

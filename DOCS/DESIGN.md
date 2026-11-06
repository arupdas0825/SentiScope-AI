# SentiScope AI — UI/UX Design System

## 1. Design vision

Create a premium, modern sentiment analytics SaaS interface. The product should feel calm, precise, data-focused, and trustworthy—not like a generic admin template.

**Primary theme:** Light  
**Secondary theme:** Dark  
**Default appearance:** Light

Design from scratch for SentiScope AI. Do not copy a screenshot or an existing product pixel-for-pixel.

## 2. Visual principles

- Clarity before decoration.
- Strong information hierarchy.
- Consistent spacing and alignment.
- Charts that communicate real data accurately.
- Restrained use of colour.
- Responsive layouts.
- Accessible text contrast and focus states.
- Fast, purposeful interactions.

Avoid:
- Excessive gradients.
- Heavy glassmorphism.
- Large decorative illustrations in data-dense views.
- Unnecessary animation.
- Fake metrics or sample activity presented as real.

## 3. Colour tokens

Use CSS variables/design tokens so themes can be changed centrally.

### Light theme
- App background: `#F6F8FC`
- Surface: `#FFFFFF`
- Elevated surface: `#FFFFFF`
- Primary text: `#172033`
- Secondary text: `#667085`
- Border: `#E6EAF0`
- Primary accent: `#4169E1`
- Primary hover: `#3155C7`
- Positive: `#16A36A`
- Negative: `#E05252`
- Neutral: `#D99A2B`
- Info: `#3985C8`

### Dark theme
- App background: `#0D1422`
- Surface: `#141E30`
- Elevated surface: `#1A2740`
- Primary text: `#F2F5FA`
- Secondary text: `#A6B2C5`
- Border: `#29364B`
- Primary accent: `#86A7FF`
- Positive: `#43C98A`
- Negative: `#FF7777`
- Neutral: `#F0BD58`
- Info: `#69B5EF`

Check contrast for all combinations. Do not rely on colour alone to communicate sentiment.

## 4. Typography

Use a clean sans-serif family such as Inter or a system fallback. Establish a clear scale:
- Page title: 24–30px, semibold.
- Section title: 16–20px, semibold.
- Card metric: 26–34px, semibold.
- Body: 14–16px.
- Supporting labels: 12–13px.

Use tabular numerals for KPI values where supported. Avoid overly small text.

## 5. Layout

### Desktop
- Collapsible left sidebar.
- Top header with page title/breadcrumb, theme toggle, and relevant actions.
- Main content with a consistent max-width and grid.
- KPI row near the top of overview.
- Charts and tables arranged according to information priority.

### Tablet
- Sidebar collapses to icon rail or drawer.
- KPI cards reflow to two columns.
- Charts use a single-column layout when needed.

### Mobile
- Use a compact navigation drawer or mobile navigation pattern.
- One-column content.
- Tables become horizontally scrollable or card-based.
- Forms and primary actions remain easy to use.
- Avoid tiny chart labels and dense multi-column layouts.

## 6. Navigation

Recommended items:
1. Overview
2. Text Analysis
3. Dataset Analysis
4. Analytics
5. Model Performance
6. Model Registry
7. Analysis History
8. Reports
9. Settings

Only show implemented features as active. A planned feature must not look functional if it is not.

## 7. Page design requirements

### Overview
- KPI cards for analysed records and sentiment counts.
- Sentiment distribution chart.
- Trend chart only if timestamps exist.
- Recent analysis/dataset summary.
- Clear first-use empty state.

### Text Analysis
- Large, clearly labelled text area.
- Character count and input validation.
- Model selector only for available models.
- Analyse action with loading state.
- Result panel with label, score explanation, and model metadata.
- Do not overstate prediction certainty.

### Dataset Analysis
- Drag/drop and browse upload affordance.
- CSV requirements and limits visible before upload.
- Column selector.
- Processing progress and row-level error summary.
- Preview and downloadable result.

### Analytics
- Filters based on real fields.
- Distribution, trend, and breakdown charts.
- Clear sample size and date range.
- Empty states when a breakdown cannot be calculated.

### Model Performance
- Accuracy, macro precision, macro recall, macro F1, weighted F1.
- Confusion matrix with axis labels.
- Classification report.
- Dataset/split/model metadata.
- No placeholder performance numbers.

### Model Registry
- Model name/version/type/status.
- Supported classes.
- Training date and evaluation summary.
- Only registered trusted models can be selected.

### History
- Search/filter/pagination.
- Respect privacy and retention settings.
- Do not show raw text if it was not stored.

### Reports
- Export controls and report details.
- Explain which dataset and model produced the report.

### Settings
- Light/dark theme.
- Privacy/history options.
- Application configuration that is safe for the client.

## 8. Components

Build reusable components:
- AppShell
- Sidebar
- Topbar
- PageHeader
- KpiCard
- ChartCard
- SentimentBadge
- DataTable
- EmptyState
- LoadingState
- ErrorState
- ConfirmDialog
- FileUpload
- FormField
- ThemeToggle
- Toast/notification

Use consistent variants and avoid one-off styling.

## 9. Charts

Use Recharts with:
- Legible axes and tooltips.
- Consistent sentiment colours.
- Responsive containers.
- Empty and loading states.
- Accessible labels/legends.
- No 3D charts or misleading axes.
- Chart values must come from API responses.

Sentiment colour mapping:
- Positive: green.
- Negative: red.
- Neutral: amber.

## 10. Motion

Use Framer Motion sparingly:
- Short page transitions.
- Small hover/press feedback.
- Subtle card entrance only where useful.
- Respect reduced-motion preferences.
- Avoid animated charts that delay reading or cause performance issues.

## 11. Accessibility

- Keyboard navigation for all controls.
- Visible focus indicators.
- Semantic headings and buttons.
- Associated labels and validation messages.
- Adequate contrast in both themes.
- Charts must have text summaries or accessible labels.
- Do not use colour as the only indicator.

## 12. Design acceptance criteria

- Light theme is the initial theme.
- Dark theme covers every major component.
- Layout works at desktop, tablet, and mobile widths.
- No overlapping, clipped, or unreadable content.
- Forms, tables, charts, and navigation have consistent styling.
- Loading, empty, success, and error states are designed.
- All visualised data is real or explicitly labelled as non-production demo data.

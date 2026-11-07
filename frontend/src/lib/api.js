/**
 * SentiScope AI - Production REST API Client
 * Centralized HTTP client connecting frontend to FastAPI backend.
 */

// Production fallback Render backend URL
const DEFAULT_PROD_URL = "https://sentiscope-api-qiug.onrender.com";

// Resolve Base URL from Vite environment variables or production fallback
const rawUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_URL : "")
).trim();

// Strip any trailing slashes and any accidental '/api/v1' or '/api/v1/' suffix
const cleanRoot = rawUrl.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "");

// Centralized API Base: guarantees /api/v1 is appended exactly once
export const API_BASE = cleanRoot ? `${cleanRoot}/api/v1` : "/api/v1";

/**
 * Robust JSON fetcher with safe error handling and non-JSON response detection.
 */
async function fetchJSON(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr) {
    throw new Error(`Failed to reach SentiScope AI backend: ${netErr.message || "Network error"}`);
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    let details = [];

    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.detail || errorMessage;
        details = errorData.error?.details || [];
      } catch {
        // Fallback
      }
    } else {
      try {
        const rawText = await response.text();
        const cleanText = rawText.replace(/<[^>]*>?/gm, "").trim().slice(0, 150);
        if (cleanText) {
          errorMessage = `${errorMessage}: ${cleanText}`;
        }
      } catch {
        // Fallback
      }
    }

    const err = new Error(errorMessage);
    err.status = response.status;
    err.details = details;
    throw err;
  }

  if (!isJson) {
    const rawText = await response.text();
    const cleanText = rawText.replace(/<[^>]*>?/gm, "").trim().slice(0, 150);
    throw new Error(
      `Received non-JSON response from server (expected JSON, got ${contentType || "unknown"}): ${cleanText || "Empty response"}`
    );
  }

  return response.json();
}

export const api = {
  // Health & Operational Status
  getHealth: () => fetchJSON("/health"),

  // Single Text Sentiment Analysis
  analyzeSingle: (text, modelId = "tfidf-logreg", explain = true, language = "auto") =>
    fetchJSON("/analyze", {
      method: "POST",
      body: JSON.stringify({ text, model_id: modelId, explain, language }),
    }),

  // Explainable AI (SHAP / LIME Token Attributions)
  explainPrediction: (text, modelId = "tfidf-logreg") =>
    fetchJSON("/analyze/explain", {
      method: "POST",
      body: JSON.stringify({ text, model_id: modelId }),
    }),

  // Aspect-Based Sentiment Analysis (ABSA)
  analyzeAspects: (text, modelId = "tfidf-logreg") =>
    fetchJSON("/analyze/aspects", {
      method: "POST",
      body: JSON.stringify({ text, model_id: modelId }),
    }),

  // Supported Multilingual Languages
  getLanguages: () => fetchJSON("/analyze/languages"),

  // Real-world Dataset Presets
  getSampleDatasets: () => fetchJSON("/datasets/samples"),
  getSampleDatasetDetail: (datasetId) => fetchJSON(`/datasets/samples/${datasetId}`),

  // Bulk Text Sentiment Analysis
  analyzeBulk: (texts, modelId = "tfidf-logreg") =>
    fetchJSON("/analyze/bulk", {
      method: "POST",
      body: JSON.stringify({ texts, model_id: modelId }),
    }),

  // CSV Dataset Upload & Batch Analysis
  uploadCSV: async (file, textColumn, modelId = "tfidf-logreg") => {
    const formData = new FormData();
    formData.append("file", file);
    if (textColumn) formData.append("text_column", textColumn);
    if (modelId) formData.append("model_id", modelId);

    let res;
    try {
      res = await fetch(`${API_BASE}/datasets/upload`, {
        method: "POST",
        body: formData,
      });
    } catch (netErr) {
      throw new Error(`Failed to upload dataset: ${netErr.message || "Network error"}`);
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const isJson = contentType.includes("application/json");

    if (!res.ok) {
      let msg = `Upload failed (HTTP ${res.status})`;
      if (isJson) {
        try {
          const errData = await res.json();
          msg = errData.error?.message || errData.detail || msg;
        } catch {}
      } else {
        const text = await res.text().catch(() => "");
        const clean = text.replace(/<[^>]*>?/gm, "").trim().slice(0, 150);
        if (clean) msg = `${msg}: ${clean}`;
      }
      throw new Error(msg);
    }

    if (!isJson) {
      throw new Error("Invalid response format from server (expected JSON)");
    }

    return res.json();
  },

  // Dashboard & Analytics
  getDashboardSummary: () => fetchJSON("/dashboard/summary"),
  getOverview: (runId) =>
    fetchJSON(`/analytics/overview${runId ? `?run_id=${encodeURIComponent(runId)}` : ""}`),
  getTrends: (days = 7) => fetchJSON(`/analytics/trends?days=${days}`),

  // Model Evaluation & Registry
  listModels: () => fetchJSON("/models"),
  getModelMetrics: (modelId) => fetchJSON(`/models/${modelId}/metrics`),
  getConfusionMatrixUrl: (modelId) => `${API_BASE}/models/${modelId}/confusion-matrix-image`,

  // History & Record Management
  getHistory: (page = 1, pageSize = 20, sentiment, q) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (sentiment) params.append("sentiment", sentiment);
    if (q) params.append("q", q);
    return fetchJSON(`/history?${params.toString()}`);
  },
  deleteHistoryItem: (id) =>
    fetchJSON(`/history/${id}`, { method: "DELETE" }),

  // Data Export Endpoints
  getExportCSVUrl: (runId) =>
    `${API_BASE}/reports/export/csv${runId ? `?run_id=${encodeURIComponent(runId)}` : ""}`,
  getExportJSONUrl: (runId) =>
    `${API_BASE}/reports/export/json${runId ? `?run_id=${encodeURIComponent(runId)}` : ""}`,
};

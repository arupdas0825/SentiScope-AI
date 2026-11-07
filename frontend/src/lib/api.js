/**
 * SentiScope AI - REST API Client
 */

const API_BASE = "/api/v1";

async function fetchJSON(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      // Fallback
    }
    const message = errorData.error?.message || errorData.detail || `HTTP Error ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.details = errorData.error?.details || [];
    throw err;
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => fetchJSON("/health"),

  // Analysis
  analyzeSingle: (text, modelId = "tfidf-logreg", explain = true) =>
    fetchJSON("/analyze", {
      method: "POST",
      body: JSON.stringify({ text, model_id: modelId, explain }),
    }),

  analyzeBulk: (texts, modelId = "tfidf-logreg") =>
    fetchJSON("/analyze/bulk", {
      method: "POST",
      body: JSON.stringify({ texts, model_id: modelId }),
    }),

  // CSV Datasets
  uploadCSV: async (file, textColumn, modelId = "tfidf-logreg") => {
    const formData = new FormData();
    formData.append("file", file);
    if (textColumn) formData.append("text_column", textColumn);
    if (modelId) formData.append("model_id", modelId);

    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Failed to process CSV file");
    }
    return res.json();
  },

  // Dashboard & Analytics
  getDashboardSummary: () => fetchJSON("/dashboard/summary"),
  getOverview: (runId) =>
    fetchJSON(`/analytics/overview${runId ? `?run_id=${encodeURIComponent(runId)}` : ""}`),
  getTrends: (days = 7) => fetchJSON(`/analytics/trends?days=${days}`),

  // Models
  listModels: () => fetchJSON("/models"),
  getModelMetrics: (modelId) => fetchJSON(`/models/${modelId}/metrics`),
  getConfusionMatrixUrl: (modelId) => `${API_BASE}/models/${modelId}/confusion-matrix-image`,

  // History
  getHistory: (page = 1, pageSize = 20, sentiment, q) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (sentiment) params.append("sentiment", sentiment);
    if (q) params.append("q", q);
    return fetchJSON(`/history?${params.toString()}`);
  },
  deleteHistoryItem: (id) =>
    fetchJSON(`/history/${id}`, { method: "DELETE" }),

  // Exports
  getExportCSVUrl: (runId) =>
    `${API_BASE}/reports/export/csv${runId ? `?run_id=${encodeURIComponent(runId)}` : ""}`,
  getExportJSONUrl: (runId) =>
    `${API_BASE}/reports/export/json${runId ? `?run_id=${encodeURIComponent(runId)}` : ""}`,
};


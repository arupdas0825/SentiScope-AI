import React, { useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  Layers,
  Download,
  AlertCircle,
  CheckCircle2,
  ListFilter,
  FileText,
} from "lucide-react";
import { api } from "../../lib/api";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

export function BatchAnalysisPage() {
  const [activeTab, setActiveTab] = useState("paste"); // 'paste' | 'csv'

  // Multiline paste state
  const [pastedText, setPastedText] = useState("");
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // CSV Upload state
  const [csvFile, setCsvFile] = useState(null);
  const [textColumn, setTextColumn] = useState("");
  const [csvResult, setCsvResult] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);

  // Model selection state
  const [modelId, setModelId] = useState("tfidf-logreg");
  const [error, setError] = useState(null);

  // Handle Multiline Batch Analysis
  async function handleBulkSubmit(e) {
    e.preventDefault();
    const lines = pastedText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;
    if (lines.length > 500) {
      setError("Batch limit is 500 texts. Please reduce the number of lines.");
      return;
    }

    try {
      setBulkLoading(true);
      setError(null);
      const res = await api.analyzeBulk(lines, modelId);
      setBulkResults(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze batch");
    } finally {
      setBulkLoading(false);
    }
  }

  // Handle CSV File Upload
  async function handleCsvUpload(e) {
    e.preventDefault();
    if (!csvFile) return;

    try {
      setCsvLoading(true);
      setError(null);
      const res = await api.uploadCSV(csvFile, textColumn || undefined, modelId);
      setCsvResult(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to process CSV");
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text">Batch Sentiment Analysis</h2>
        <p className="text-xs text-text-muted mt-1">
          Classify hundreds of comments simultaneously via multiline text pasting or structured CSV dataset upload.
        </p>
      </div>

      {/* Mode Tabs & Model Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border gap-3 pb-1">
        <div className="flex space-x-6">
          <button
            onClick={() => {
              setActiveTab("paste");
              setError(null);
            }}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "paste"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Comments (Up to 500 lines)
          </button>

          <button
            onClick={() => {
              setActiveTab("csv");
              setError(null);
            }}
            className={`pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "csv"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV Dataset Upload
          </button>
        </div>

        <div className="flex items-center gap-2 pb-2 sm:pb-0">
          <label className="text-xs text-text-muted font-medium whitespace-nowrap">Engine:</label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="text-xs bg-surface-muted border border-border rounded-lg px-2.5 py-1 text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
          >
            <option value="tfidf-logreg">Trained: TF-IDF + Logistic Regression</option>
            <option value="keras-lstm">Deep Learning: Keras BiLSTM</option>
            <option value="vader">Lexicon: VADER Rule-Based</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-negative-soft border border-negative/30 rounded-xl text-negative text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Multiline Paste */}
      {activeTab === "paste" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <Card title="Input Multiline Texts" subtitle="One comment per line">
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="The design is intuitive and fast.&#10;Customer support was totally unresponsive.&#10;Received item on Monday as scheduled.&#10;Highly recommended!"
                  rows={10}
                  className="w-full p-3 bg-surface-muted border border-border rounded-xl text-text text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />

                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>
                    Lines: {pastedText.split("\n").filter((l) => l.trim().length > 0).length} / 500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPastedText("");
                        setBulkResults(null);
                      }}
                    >
                      Clear
                    </Button>
                    <Button type="submit" size="sm" loading={bulkLoading} icon={Layers}>
                      Process Batch
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <Card
              title="Batch Results"
              subtitle={
                bulkResults
                  ? `Processed ${bulkResults.summary.total} rows in ${bulkResults.total_time_ms} ms`
                  : "Results will appear here"
              }
              action={
                bulkResults && (
                  <a
                    href={api.getExportCSVUrl(bulkResults.run_id)}
                    download="batch_analysis_results.csv"
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </a>
                )
              }
            >
              {bulkResults ? (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-surface-muted rounded-xl border border-border text-center text-xs">
                    <div>
                      <span className="text-positive font-bold text-base block">
                        {bulkResults.summary.positive}
                      </span>
                      <span className="text-text-muted">Positive</span>
                    </div>
                    <div>
                      <span className="text-neutral font-bold text-base block">
                        {bulkResults.summary.neutral}
                      </span>
                      <span className="text-text-muted">Neutral</span>
                    </div>
                    <div>
                      <span className="text-negative font-bold text-base block">
                        {bulkResults.summary.negative}
                      </span>
                      <span className="text-text-muted">Negative</span>
                    </div>
                  </div>

                  {/* Results List Table */}
                  <div className="max-h-96 overflow-y-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-muted sticky top-0 border-b border-border text-text-muted">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Comment Text</th>
                          <th className="py-2 px-3">Sentiment</th>
                          <th className="py-2 px-3 text-right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {bulkResults.results.map((row) => (
                          <tr key={row.index} className="hover:bg-surface-muted/50">
                            <td className="py-2.5 px-3 text-text-muted tabular-nums">{row.index + 1}</td>
                            <td className="py-2.5 px-3 text-text max-w-sm truncate font-medium">
                              {row.text}
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge variant={row.label} />
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums font-medium text-text">
                              {(row.confidence * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-text-muted">
                  Paste several comments on the left and submit to view bulk sentiment classifications.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: CSV Upload */}
      {activeTab === "csv" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <Card title="Upload CSV File" subtitle="Accepts .csv up to 10 MB">
              <form onSubmit={handleCsvUpload} className="space-y-4">
                <div className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center bg-surface-muted/40 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    id="csvInput"
                    onChange={(e) => setCsvFile(e.target.files[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="csvInput" className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <span className="text-sm font-semibold text-text block">
                      {csvFile ? csvFile.name : "Click to select CSV or drag and drop"}
                    </span>
                    <span className="text-xs text-text-muted mt-1 block">
                      {csvFile
                        ? `${(csvFile.size / 1024).toFixed(1)} KB`
                        : "CSV files with columns: text, date, platform"}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Text Column Name (Optional - Auto Detected)
                  </label>
                  <input
                    type="text"
                    value={textColumn}
                    onChange={(e) => setTextColumn(e.target.value)}
                    placeholder="e.g., text, comment, review"
                    className="w-full p-2.5 bg-surface-muted border border-border rounded-lg text-text text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  size="md"
                  className="w-full"
                  disabled={!csvFile}
                  loading={csvLoading}
                  icon={CheckCircle2}
                >
                  Analyze & Ingest Dataset
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <Card title="Ingestion & Processing Report" subtitle="Batch classification results">
              {csvResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-positive-soft border border-positive/30 rounded-xl">
                    <div className="flex items-center gap-2 text-positive font-bold text-sm mb-1">
                      <CheckCircle2 className="w-5 h-5" /> Dataset Classified Successfully!
                    </div>
                    <p className="text-xs text-text-muted">
                      Processed <strong className="text-text">{csvResult.rows_processed}</strong> records from{" "}
                      <strong className="text-text">{csvResult.filename}</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Mapped Text Column</span>
                      <span className="font-semibold text-text">{csvResult.text_column}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Detected Date Column</span>
                      <span className="font-semibold text-text">{csvResult.detected_date_column || "None"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Detected Platform Column</span>
                      <span className="font-semibold text-text">{csvResult.detected_platform_column || "None"}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-text-muted">Positive / Neutral / Negative</span>
                      <span className="font-bold text-text">
                        {csvResult.sentiment_summary.positive} / {csvResult.sentiment_summary.neutral} / {csvResult.sentiment_summary.negative}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={api.getExportCSVUrl(csvResult.run_id)}
                      download={`classified_${csvResult.filename}`}
                      className="block"
                    >
                      <Button size="sm" variant="outline" className="w-full" icon={Download}>
                        Download Classified Dataset
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-text-muted">
                  Select and upload a CSV file on the left to trigger the batch inference pipeline.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}


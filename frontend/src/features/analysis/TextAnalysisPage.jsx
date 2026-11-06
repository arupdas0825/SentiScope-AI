import React, { useState } from "react";
import { Sparkles, Send, RefreshCw, BarChart2, Tag, Check, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

const SAMPLE_TEXTS = [
  "This new software upgrade is absolutely breathtaking! Everything runs smoothly and customer support was stellar.",
  "The delivery took twice as long as promised, and nobody answered my emails. Horrible experience.",
  "I received the package yesterday. It contains the standard accessories as listed on the invoice.",
  "Not a bad product at all! I was very skeptical initially, but it surprised me pleasantly.",
];

export function TextAnalysisPage() {
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState("tfidf-logreg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleAnalyze(e) {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.analyzeSingle(text, modelId, true);
      setResult(res);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze text");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-text">Single Text Sentiment Analysis</h2>
        <p className="text-xs text-text-muted mt-1">
          Classify social comments, product reviews, or customer opinions into Positive, Negative, or Neutral with token-level explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-text uppercase tracking-wider">
                    Input Text
                  </label>
                  <span className={`text-[11px] tabular-nums ${text.length > 1800 ? "text-danger font-bold" : "text-text-muted"}`}>
                    {text.length} / 2,000 characters
                  </span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type feedback, customer comment, or review here..."
                  rows={6}
                  maxLength={2000}
                  className="w-full p-3.5 bg-surface-muted border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Sample Quick-Fill Chips */}
              <div>
                <span className="text-[11px] font-medium text-text-muted block mb-1.5">
                  Try sample text:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TEXTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setText(sample)}
                      className="text-xs px-2.5 py-1 bg-surface-muted hover:bg-border/60 border border-border rounded-lg text-text-muted hover:text-text transition-colors text-left truncate max-w-xs cursor-pointer"
                    >
                      {sample.slice(0, 42)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Engine Selector & Submit */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-text-muted font-medium">Model Engine:</label>
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="text-xs bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="tfidf-logreg">Trained: TF-IDF + Logistic Regression (Default)</option>
                    <option value="vader">Lexicon: VADER Rule-Based</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setText("");
                      setResult(null);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    loading={loading}
                    disabled={!text.trim()}
                    icon={Send}
                  >
                    Analyse Sentiment
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {error && (
            <div className="p-3 bg-negative-soft border border-negative/30 rounded-xl text-negative text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results & Explainability Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="Analysis Output" subtitle="Predicted sentiment & probability breakdown">
            {result ? (
              <div className="space-y-5">
                {/* Primary Sentiment Banner */}
                <div className="p-4 bg-surface-muted border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                      Classification
                    </span>
                    <div className="mt-1">
                      <Badge variant={result.label} className="!text-sm !px-3 !py-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                      Confidence
                    </span>
                    <span className="text-2xl font-bold text-text tabular-nums mt-0.5 block">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Probability Distribution Bars */}
                {result.probabilities && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-text uppercase tracking-wider block">
                      Class Probabilities
                    </span>

                    {/* Positive */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-positive font-medium flex items-center gap-1">Positive</span>
                        <span className="text-text tabular-nums font-semibold">
                          {(result.probabilities.positive * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-positive h-full rounded-full transition-all duration-500"
                          style={{ width: `${result.probabilities.positive * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Neutral */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral font-medium flex items-center gap-1">Neutral</span>
                        <span className="text-text tabular-nums font-semibold">
                          {(result.probabilities.neutral * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-neutral h-full rounded-full transition-all duration-500"
                          style={{ width: `${result.probabilities.neutral * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Negative */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-negative font-medium flex items-center gap-1">Negative</span>
                        <span className="text-text tabular-nums font-semibold">
                          {(result.probabilities.negative * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-negative h-full rounded-full transition-all duration-500"
                          style={{ width: `${result.probabilities.negative * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Explainability Token Attributions */}
                {result.explanations && result.explanations.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <span className="text-xs font-semibold text-text uppercase tracking-wider block mb-2">
                      Key Influential Words (Signed Coefficients)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.explanations.map((exp, i) => {
                        const isPos = exp.sentiment === "positive";
                        return (
                          <span
                            key={i}
                            className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                              isPos
                                ? "bg-positive-soft text-positive border-positive/30"
                                : "bg-negative-soft text-negative border-negative/30"
                            }`}
                            title={`Feature weight: ${exp.weight}`}
                          >
                            {exp.token} <span className="opacity-70 text-[10px]">{exp.weight > 0 ? `+${exp.weight}` : exp.weight}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Metadata Footer */}
                <div className="pt-3 border-t border-border/60 text-[11px] text-text-muted flex justify-between">
                  <span>Engine: {result.model_id} ({result.model_version})</span>
                  <span>Latency: {result.latency_ms} ms</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-text-muted text-xs">
                Enter text on the left and click <strong className="text-text">Analyse Sentiment</strong> to view real-time class predictions and word attributions.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


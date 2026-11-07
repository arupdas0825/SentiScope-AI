import React, { useState } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  BarChart2,
  Tag,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  Globe,
  Sliders,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";
import { api } from "../../lib/api";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";

const PRESET_PROMPTS = {
  general: [
    "This new software upgrade is absolutely breathtaking! Everything runs smoothly and customer support was stellar.",
    "The delivery took twice as long as promised, and nobody answered my emails. Horrible experience.",
    "Not a bad product at all! I was very skeptical initially, but it surprised me pleasantly.",
  ],
  absa: [
    "The camera is stunning with vibrant colors, but the battery backup is terrible and drains in 4 hours. The display is just average.",
    "Unbelievable processor speed and gaming performance! However, the build quality feels cheap and plastic.",
    "Super fast delivery and packaging was solid. Customer service was responsive and polite."
  ],
  multilingual: [
    { text: "এই ফোনটির ক্যামেরা অসাধারণ কিন্তু ব্যাটারি ব্যাকআপ খুব বাজে এবং দ্রুত শেষ হয়।", lang: "bn", label: "বাংলা (Bengali)" },
    { text: "সফটওয়্যারের ইন্টারফেস দারুণ এবং ব্যবহারের দিক থেকে অত্যন্ত সহজ। সম্পূর্ণ সন্তুষ্ট!", lang: "bn", label: "বাংলা (Bengali)" },
    { text: "यह उत्पाद बहुत अच्छा है और काम बहुत बढ़िया करता है, लेकिन डिलीवरी बहुत धीमी थी।", lang: "hi", label: "हिन्दी (Hindi)" },
    { text: "बिल्कुल घटिया सेवा! स्क्रीन में समस्या है और कस्टमर केयर ने कोई मदद नहीं की।", lang: "hi", label: "हिन्दी (Hindi)" }
  ]
};

export function TextAnalysisPage() {
  const [activeTab, setActiveTab] = useState("sentiment"); // "sentiment" | "absa" | "multilingual"
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState("distilbert");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [absaResult, setAbsaResult] = useState(null);
  const [xaiResult, setXaiResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleAnalyze(e) {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);

      if (activeTab === "absa") {
        const data = await api.analyzeAspects(text, modelId);
        setAbsaResult(data);
        // Also run standard classification for overall context
        const standard = await api.analyzeSingle(text, modelId, true, selectedLanguage);
        setResult(standard);
      } else {
        const [stdRes, explainRes] = await Promise.all([
          api.analyzeSingle(text, modelId, true, selectedLanguage),
          api.explainPrediction(text, modelId).catch(() => null)
        ]);
        setResult(stdRes);
        setXaiResult(explainRes);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze text");
    } finally {
      setLoading(false);
    }
  }

  function handlePresetSelect(sampleText, langCode = "auto") {
    setText(sampleText);
    if (langCode !== "auto") {
      setSelectedLanguage(langCode);
    }
    setResult(null);
    setAbsaResult(null);
    setXaiResult(null);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              Advanced AI Sentiment Suite
            </span>
            <span className="text-xs text-text-muted">· XAI · ABSA · Multilingual</span>
          </div>
          <h2 className="text-xl font-bold text-text mt-1">Intelligent Sentiment & Feature Analysis</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time inference, token attributions (SHAP/LIME style), aspect decomposition, and multilingual classification.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-surface-muted border border-border rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("sentiment");
              setAbsaResult(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "sentiment"
                ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            Sentiment & XAI
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("absa");
              if (!text) setText(PRESET_PROMPTS.absa[0]);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "absa"
                ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            Aspect-Based (ABSA)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("multilingual");
              if (!text) setText(PRESET_PROMPTS.multilingual[0].text);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "multilingual"
                ? "bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            Multilingual (বাংলা / हिन्दी)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                    <span>Input Text</span>
                    {selectedLanguage !== "auto" && (
                      <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950 px-2 py-0.5 rounded-full font-mono font-medium">
                        Lang: {selectedLanguage.toUpperCase()}
                      </span>
                    )}
                  </label>
                  <span className={`text-[11px] tabular-nums ${text.length > 1800 ? "text-danger font-bold" : "text-text-muted"}`}>
                    {text.length} / 2,000 characters
                  </span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    activeTab === "absa"
                      ? "Enter product review with multiple aspects (e.g. 'The camera is fantastic but battery drains so fast. Display is average.')..."
                      : activeTab === "multilingual"
                      ? "Enter text in English, Bengali (বাংলা), or Hindi (हिन्दी)..."
                      : "Paste or type tweet, customer review, or social commentary here..."
                  }
                  rows={5}
                  maxLength={2000}
                  className="w-full p-3.5 bg-surface-muted border border-border rounded-xl text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Contextual Quick Presets */}
              <div>
                <span className="text-[11px] font-medium text-text-muted block mb-1.5">
                  {activeTab === "absa"
                    ? "Try mobile/gadget review examples:"
                    : activeTab === "multilingual"
                    ? "Try Indic language sample reviews:"
                    : "Try sample tweets & feedback:"}
                </span>

                {activeTab === "multilingual" ? (
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PROMPTS.multilingual.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(item.text, item.lang)}
                        className="text-xs px-2.5 py-1.5 bg-surface-muted hover:bg-border/60 border border-border rounded-lg text-text font-medium transition-colors text-left truncate max-w-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono font-semibold">
                          {item.label}
                        </span>
                        <span className="truncate">{item.text.slice(0, 36)}...</span>
                      </button>
                    ))}
                  </div>
                ) : activeTab === "absa" ? (
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PROMPTS.absa.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(sample)}
                        className="text-xs px-2.5 py-1 bg-surface-muted hover:bg-border/60 border border-border rounded-lg text-text-muted hover:text-text transition-colors text-left truncate max-w-xs cursor-pointer"
                      >
                        {sample.slice(0, 44)}...
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PROMPTS.general.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(sample)}
                        className="text-xs px-2.5 py-1 bg-surface-muted hover:bg-border/60 border border-border rounded-lg text-text-muted hover:text-text transition-colors text-left truncate max-w-xs cursor-pointer"
                      >
                        {sample.slice(0, 42)}...
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Model & Language Controls Bar */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Model Engine Selector */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-text-muted font-medium">Model:</label>
                    <select
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      className="text-xs bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 text-text font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="distilbert">DistilBERT Transformer (Top Accuracy)</option>
                      <option value="tfidf-logreg">TF-IDF + Logistic Regression (Default)</option>
                      <option value="keras-lstm">Deep Learning: Keras BiLSTM</option>
                      <option value="vader">Lexicon: VADER Rule-Based</option>
                    </select>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-text-muted font-medium">Language:</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="text-xs bg-surface-muted border border-border rounded-lg px-2 py-1.5 text-text focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="auto">Auto-Detect Script</option>
                      <option value="en">English (🇬🇧)</option>
                      <option value="bn">Bengali / বাংলা (🇧🇩)</option>
                      <option value="hi">Hindi / हिन्दी (🇮🇳)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setText("");
                      setResult(null);
                      setAbsaResult(null);
                      setXaiResult(null);
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
                    {activeTab === "absa" ? "Decompose Aspects" : "Analyse Sentiment"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {error && (
            <div className="p-3.5 bg-negative-soft border border-negative/30 rounded-xl text-negative text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Explainable AI (XAI) Token Contribution Heatmap Card */}
          {xaiResult && xaiResult.tokens && xaiResult.tokens.length > 0 && (
            <Card
              title="Explainable AI (XAI) — Token Attribution Heatmap"
              subtitle="LIME/SHAP style marginal word impact on model decision"
            >
              <div className="space-y-4">
                {/* Visual Token Stream */}
                <div>
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                    Visual Feature Attribution (Word-Level Salience)
                  </span>
                  <div className="p-4 bg-surface-muted/60 rounded-xl border border-border flex flex-wrap gap-1.5 leading-relaxed">
                    {xaiResult.tokens.map((t, idx) => {
                      const score = t.score;
                      let badgeStyle = "bg-transparent text-text border-transparent";
                      if (score > 0.3) {
                        badgeStyle = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold";
                      } else if (score > 0) {
                        badgeStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                      } else if (score < -0.3) {
                        badgeStyle = "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold";
                      } else if (score < 0) {
                        badgeStyle = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                      }

                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md border text-xs transition-all ${badgeStyle}`}
                          title={`Token: ${t.token} | Marginal score: ${score > 0 ? `+${score}` : score} | Influence: ${t.influence}`}
                        >
                          {t.token}
                          {score !== 0 && (
                            <span className="ml-1 text-[9px] opacity-75 font-mono">
                              {score > 0 ? `+${score}` : score}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Natural Language Decision Summary */}
                {xaiResult.summary && (
                  <div className="p-3 bg-surface-muted rounded-xl border border-border text-xs text-text-muted leading-relaxed flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text block font-semibold mb-0.5">Decision Rationale:</strong>
                      <span>{xaiResult.summary}</span>
                    </div>
                  </div>
                )}

                {/* Opposing Forces Bar */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Positive Force: +{xaiResult.positive_force}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Negative Force: -{xaiResult.negative_force}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Results & ABSA Breakdowns (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Aspect-Based Decomposition View */}
          {activeTab === "absa" && absaResult ? (
            <Card
              title="Aspect Decomposition Breakdown"
              subtitle={`Extracted ${absaResult.aspect_count} domain aspects from review`}
            >
              <div className="space-y-4">
                {/* Overall Summary Bar */}
                <div className="p-3.5 bg-surface-muted border border-border rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-text-muted font-medium block">Overall Multi-Aspect Polarity</span>
                    <Badge variant={absaResult.overall_sentiment} className="mt-1" />
                  </div>
                  <div className="text-right">
                    <span className="text-text-muted font-medium block">Aspects Count</span>
                    <span className="text-lg font-bold text-text tabular-nums">{absaResult.aspect_count}</span>
                  </div>
                </div>

                {/* Individual Aspect Cards */}
                <div className="space-y-2.5">
                  {absaResult.aspects.map((aspect, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-surface hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-text">{aspect.aspect}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-muted text-text-muted font-medium">
                            {aspect.category}
                          </span>
                        </div>
                        <Badge variant={aspect.polarity} />
                      </div>

                      <p className="text-xs text-text-muted italic bg-surface-muted/60 p-2 rounded-lg border border-border/50">
                        "{aspect.snippet}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                        <span>Confidence: <strong className="text-text font-mono">{(aspect.confidence * 100).toFixed(0)}%</strong></span>
                        <span>Polarity Score: <strong className="text-text font-mono">{aspect.score > 0 ? `+${aspect.score}` : aspect.score}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            /* Standard Classification & Probabilities View */
            <Card title="Analysis Output" subtitle="Predicted sentiment & probability breakdown">
              {result ? (
                <div className="space-y-5">
                  {/* Primary Sentiment Banner */}
                  <div className="p-4 bg-surface-muted border border-border rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                        Classification
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant={result.label} className="!text-sm !px-3 !py-1" />
                        {result.language && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-surface border border-border text-text font-medium flex items-center gap-1">
                            <span>{result.language.flag}</span>
                            <span>{result.language.name}</span>
                          </span>
                        )}
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

                  {/* Influential Words Pills */}
                  {result.influential_words && result.influential_words.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <span className="text-xs font-semibold text-text uppercase tracking-wider block mb-2">
                        Key Influential Words ({result.model_id})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.influential_words.map((item, i) => {
                          const isPos = (item.score || 0) >= 0;
                          return (
                            <span
                              key={i}
                              className={`text-xs px-2.5 py-1 rounded-md border font-medium ${
                                isPos
                                  ? "bg-positive-soft text-positive border-positive/30"
                                  : "bg-negative-soft text-negative border-negative/30"
                              }`}
                            >
                              {item.word} <span className="opacity-70 text-[10px]">{item.score > 0 ? `+${item.score}` : item.score}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Metadata Footer */}
                  <div className="pt-3 border-t border-border/60 text-[11px] text-text-muted flex justify-between">
                    <span>Engine: <strong className="text-text">{result.model_id}</strong></span>
                    <span>Latency: <strong className="text-text font-mono">{result.latency_ms} ms</strong></span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-text-muted text-xs">
                  Enter text on the left and click <strong className="text-text">Analyse Sentiment</strong> to view real-time class predictions and word attributions.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

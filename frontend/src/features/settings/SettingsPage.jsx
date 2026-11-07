import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Sun, Moon, Shield, Database, Cpu } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export function SettingsPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text">Platform Settings</h2>
        <p className="text-xs text-text-muted mt-1">
          System preferences, input validation limits, and academic project specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card title="Interface Appearance" subtitle="Theme selection">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  theme === "light"
                    ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                    : "border-border bg-surface-muted text-text-muted hover:text-text"
                }`}
              >
                <Sun className="w-5 h-5 mx-auto mb-2 text-warning" />
                <span className="text-xs block">Light Theme (Default)</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  theme === "dark"
                    ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                    : "border-border bg-surface-muted text-text-muted hover:text-text"
                }`}
              >
                <Moon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <span className="text-xs block">Dark Theme</span>
              </button>
            </div>
            <p className="text-[11px] text-text-muted">
              Theme tokens are tuned independently for high contrast and WCAG 2.2 AA accessibility.
            </p>
          </div>
        </Card>

        {/* Server & Engine Limits */}
        <Card title="Input Limits & Security Policy" subtitle="Configured operational guardrails">
          <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Max Single Text Length</span>
              <span className="font-semibold text-text">2,000 characters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Max Batch Lines</span>
              <span className="font-semibold text-text">500 lines</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Max CSV File Size</span>
              <span className="font-semibold text-text">10 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Max CSV Rows Processed</span>
              <span className="font-semibold text-text">10,000 rows</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Rate Limiting</span>
              <span className="font-semibold text-text">60 requests / minute</span>
            </div>
          </div>
        </Card>

        {/* System & Architecture Specifications */}
        <Card title="System Architecture & Environment" subtitle="SentiScope AI Enterprise Platform Specifications" className="md:col-span-2">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
                <span className="text-text-muted font-medium block">Machine Learning Core</span>
                <span className="font-bold text-text block text-sm">TF-IDF + LogReg</span>
                <span className="text-[11px] font-mono text-primary font-semibold block">Scikit-Learn 1.3+</span>
                <div className="text-[10px] text-text-muted space-y-0.5 pt-1 border-t border-border/50">
                  <div>Features: <span className="font-mono text-text">5,000 N-Grams</span></div>
                  <div>Accuracy: <span className="font-mono text-text">58.56% Benchmark</span></div>
                </div>
              </div>

              <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
                <span className="text-text-muted font-medium block">Deep Learning Engine</span>
                <span className="font-bold text-text block text-sm">BiLSTM Network</span>
                <span className="text-[11px] font-mono text-primary font-semibold block">Keras / TensorFlow</span>
                <div className="text-[10px] text-text-muted space-y-0.5 pt-1 border-t border-border/50">
                  <div>Embedding: <span className="font-mono text-text">100D GloVe</span></div>
                  <div>Weights: <span className="font-mono text-text">NumPy Quantized</span></div>
                </div>
              </div>

              <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
                <span className="text-text-muted font-medium block">Rule-Based Engine</span>
                <span className="font-bold text-text block text-sm">VADER Lexicon</span>
                <span className="text-[11px] font-mono text-primary font-semibold block">vaderSentiment</span>
                <div className="text-[10px] text-text-muted space-y-0.5 pt-1 border-t border-border/50">
                  <div>Polarity: <span className="font-mono text-text">Compound Score</span></div>
                  <div>Threshold: <span className="font-mono text-text">±0.05 Calibrated</span></div>
                </div>
              </div>

              <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
                <span className="text-text-muted font-medium block">API & Pipeline</span>
                <span className="font-bold text-text block text-sm">FastAPI + Async</span>
                <span className="text-[11px] font-mono text-primary font-semibold block">Python 3.11 / 3.13</span>
                <div className="text-[10px] text-text-muted space-y-0.5 pt-1 border-t border-border/50">
                  <div>Store: <span className="font-mono text-text">SQLAlchemy Core</span></div>
                  <div>Security: <span className="font-mono text-text">Strict CORS & CSP</span></div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-surface-muted/60 rounded-xl border border-border/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-text-muted">
              <div>
                <span className="font-semibold text-text block">Benchmark Dataset:</span>
                <span>TweetEval 3-Class Sentiment (<span className="font-mono text-primary font-semibold">SemEval-2017 Task 4A</span>)</span>
              </div>
              <div>
                <span className="font-semibold text-text block">Runtime Stack:</span>
                <span>FastAPI 0.110+ · Vite 6 · React 18 · Tailwind CSS</span>
              </div>
              <div>
                <span className="font-semibold text-text block">Data Security & Compliance:</span>
                <span>Client-Side Tokenization · Formula Injection Protection</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


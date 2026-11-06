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

        {/* Project & Academic Attribution */}
        <Card title="Academic Attribution" subtitle="University project metadata" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-text-muted font-medium block">Project Lead</span>
              <span className="font-bold text-text block">Arup Das</span>
              <span className="text-[11px] text-text-muted block">B.Tech CSE (AI/ML)</span>
            </div>

            <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-text-muted font-medium block">Institution</span>
              <span className="font-bold text-text block">Brainware University</span>
              <span className="text-[11px] text-text-muted block">Kolkata, West Bengal</span>
            </div>

            <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-text-muted font-medium block">Topic</span>
              <span className="font-bold text-text block">Sentiment Analysis (Social Analytics)</span>
              <span className="text-[11px] text-text-muted block">Academic Capstone Deliverable</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


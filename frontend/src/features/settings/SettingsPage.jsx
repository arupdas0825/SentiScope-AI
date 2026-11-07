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
        <Card title="Academic Attribution & Team" subtitle="Brainware University B.Tech CSE (AI) Capstone Project" className="md:col-span-2">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
                <span className="text-text-muted font-medium block">Project Lead & Full-Stack</span>
                <span className="font-bold text-text block text-sm">Arup Das</span>
                <span className="text-[11px] font-mono text-primary font-semibold block">BWU/BTA/24/641</span>
                <div className="text-[10px] text-text-muted space-y-0.5 pt-1 border-t border-border/50">
                  <div>Roll: <span className="font-mono text-text">24103320601</span></div>
                  <div>Reg: <span className="font-mono text-text">24103000622</span></div>
                </div>
              </div>

              <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
                <span className="text-text-muted font-medium block">Backend & Database</span>
                <span className="font-bold text-text block text-sm">Rajarshi Laksman</span>
                <span className="text-[11px] font-mono text-primary font-semibold block">BWU/BTA/24/638</span>
                <div className="text-[10px] text-text-muted space-y-0.5 pt-1 border-t border-border/50">
                  <div>Roll: <span className="font-mono text-text">24103320599</span></div>
                  <div>Reg: <span className="font-mono text-text">24103000619</span></div>
                </div>
              </div>

              <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
                <span className="text-text-muted font-medium block">AI/ML Engineer</span>
                <span className="font-bold text-text block text-sm">Aditya Bar</span>
                <span className="text-[11px] font-mono text-primary font-semibold block">BWU/BTA/24/651</span>
                <div className="text-[10px] text-text-muted space-y-0.5 pt-1 border-t border-border/50">
                  <div>Roll: <span className="font-mono text-text">24103320611</span></div>
                  <div>Reg: <span className="font-mono text-text">24103000632</span></div>
                </div>
              </div>

              <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
                <span className="text-text-muted font-medium block">Frontend & UI/UX</span>
                <span className="font-bold text-text block text-sm">Pranay Naskar</span>
                <span className="text-[11px] font-mono text-primary font-semibold block">BWU/BTA/24/656</span>
                <div className="text-[10px] text-text-muted space-y-0.5 pt-1 border-t border-border/50">
                  <div>Roll: <span className="font-mono text-text">24103320616</span></div>
                  <div>Reg: <span className="font-mono text-text">24103000637</span></div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-surface-muted/60 rounded-xl border border-border/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-text-muted">
              <div>
                <span className="font-semibold text-text block">Course Details:</span>
                <span>Artificial Intelligence Lab (<span className="font-mono text-primary font-semibold">BTA59117</span>)</span>
              </div>
              <div>
                <span className="font-semibold text-text block">Semester & Session:</span>
                <span>5th Semester (3rd Year) · Session 2024–2025</span>
              </div>
              <div>
                <span className="font-semibold text-text block">Academic Institution:</span>
                <span>Brainware University, Barasat, Kolkata</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


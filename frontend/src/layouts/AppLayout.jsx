import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileSpreadsheet,
  BarChart3,
  BrainCircuit,
  History,
  Download,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Text Analysis", path: "/analyze", icon: MessageSquare },
  { name: "Batch Analysis", path: "/batch", icon: FileSpreadsheet },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Model Evaluation", path: "/models", icon: BrainCircuit },
  { name: "Analysis History", path: "/history", icon: History },
  { name: "Reports & Exports", path: "/reports", icon: Download },
  { name: "Settings", path: "/settings", icon: Settings },
];

export function AppLayout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const activeTitle = NAV_ITEMS.find((item) => item.path === location.pathname)?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3 font-bold text-lg tracking-tight">
              <img
                src="/sentiscope-logo.png"
                alt="SentiScope AI Logo"
                className="w-8 h-8 object-contain rounded-md drop-shadow-sm"
              />
              <span className="text-text font-semibold">SentiScope <span className="text-primary font-bold">AI</span></span>
            </Link>
            <button
              className="md:hidden text-text-muted hover:text-text cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-sm font-semibold"
                      : "text-text-muted hover:text-text hover:bg-surface-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System & Model Version Badge Footer */}
        <div className="p-4 m-3 bg-surface-muted rounded-xl border border-border/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
            <span className="text-xs font-semibold text-text">Engine: TF-IDF + LR</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Trained 3-class classifier benchmarked on TweetEval.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-text-muted hover:text-text p-1 -ml-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-text tracking-tight">{activeTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted border border-border transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface-muted border border-border rounded-full text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-positive" />
              <span>API v2.0 Online</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


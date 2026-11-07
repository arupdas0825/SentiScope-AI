import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  FileSpreadsheet,
  BarChart3,
  BrainCircuit,
  History,
  Download,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const NAV_ITEMS = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Text Analysis", path: "/analyze", icon: MessageSquare },
  { name: "Batch Analysis", path: "/batch", icon: FileSpreadsheet },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Model Evaluation", path: "/models", icon: BrainCircuit },
  { name: "Analysis History", path: "/history", icon: History },
  { name: "Reports & Exports", path: "/reports", icon: Download },
];

export function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const location = useLocation();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sentiscope_sidebar_collapsed", String(next));
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Element */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 260,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-250 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-3 overflow-hidden focus:outline-none"
              title="SentiScope AI"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-0.5 flex-shrink-0 flex items-center justify-center shadow-sm">
                <img
                  src="/sentiscope-logo.png"
                  alt="SentiScope"
                  className="w-full h-full object-contain rounded-lg bg-white p-0.5"
                  onError={(e) => {
                    // Fallback to text icon if image fails
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <AnimatePresence>
                {(!collapsed || mobileOpen) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col min-w-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight leading-none">
                        SentiScope
                      </span>
                      <span className="text-xs font-black px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                        AI
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-1 truncate">
                      Sentiment Intelligence
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle button */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed && !mobileOpen ? item.name : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800 dark:hover:text-white"
                  } ${collapsed && !mobileOpen ? "justify-center px-2" : ""}`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-brand-600 dark:text-slate-400 dark:group-hover:text-brand-400"
                    }`}
                  />
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {/* Active indicator bar on collapsed */}
                  {collapsed && !mobileOpen && isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-600 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Settings, Help & User Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          {/* Settings Link */}
          <Link
            to="/settings"
            onClick={() => setMobileOpen(false)}
            title={collapsed && !mobileOpen ? "Settings" : undefined}
            className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === "/settings"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800 dark:hover:text-white"
            } ${collapsed && !mobileOpen ? "justify-center px-2" : ""}`}
          >
            <Settings className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
            {(!collapsed || mobileOpen) && <span className="truncate">Settings</span>}
          </Link>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            title={collapsed && !mobileOpen ? "Help & Resources" : undefined}
            className={`group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer ${
              collapsed && !mobileOpen ? "justify-center px-2" : ""
            }`}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400" />
            {(!collapsed || mobileOpen) && <span className="truncate">Help & Docs</span>}
          </button>

          {/* Platform Status */}
          <div
            className={`mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${
              collapsed && !mobileOpen ? "justify-center px-1" : ""
            }`}
            title="System Active · FastAPI Backend"
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  Engine Ready
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  TF-IDF + BiLSTM Active
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    SentiScope AI Knowledge Base
                  </h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Single & Batch Inference
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Analyse individual tweets or comments in Text Analysis, or upload bulk CSV datasets in Batch Analysis for high-throughput sentiment classification.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Model Evaluation & Metrics
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Inspect confusion matrices, per-class F1-scores, precision, and recall on the TweetEval benchmark for both TF-IDF Logistic Regression and Bidirectional LSTM models.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Reports & Data Exports
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Export full history and batch run classifications anytime in CSV or JSON format for downstream reporting and dashboard integration.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

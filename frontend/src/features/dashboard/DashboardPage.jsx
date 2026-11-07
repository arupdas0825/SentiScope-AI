import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Smile,
  Meh,
  Frown,
  Activity,
  Layers,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  FileSpreadsheet,
  BarChart3,
  BrainCircuit,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
} from "lucide-react";

import { api } from "../../lib/api";
import { StatCard } from "../../components/common/StatCard";
import { Skeleton } from "../../components/common/Skeleton";

export function DashboardPage() {
  const navigate = useNavigate();

  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [modelsData, setModelsData] = useState([]);
  const [historyRecords, setRecentHistory] = useState([]);
  const [trendDays, setTrendDays] = useState(7);
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // Ensure continuous dates so Recharts Area/Line chart renders smooth connected curves
  const displayTrendData = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];
    if (trendData.length === 1) {
      const single = trendData[0];
      const singleDate = new Date(single.date || Date.now());
      const padded = [];
      const count = trendDays || 7;
      for (let i = count - 1; i >= 1; i--) {
        const d = new Date(singleDate);
        d.setDate(d.getDate() - i);
        padded.push({
          date: d.toISOString().split("T")[0],
          positive: 0,
          neutral: 0,
          negative: 0,
          total: 0,
        });
      }
      padded.push(single);
      return padded;
    }
    return trendData;
  }, [trendData, trendDays]);

  // Selected item modal state
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Greeting logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Formatted date string
  const formattedToday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  useEffect(() => {
    fetchInitialDashboard();
  }, []);

  useEffect(() => {
    fetchTrendHistory(trendDays);
  }, [trendDays]);

  async function fetchInitialDashboard() {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, modelsRes, historyRes] = await Promise.all([
        // Attempt summary first, with fallback to overview if needed
        api.getDashboardSummary().catch(() => api.getOverview()),
        api.listModels().catch(() => []),
        api.getHistory(1, 5).catch(() => ({ records: [] })),
      ]);

      setDashboardData(summaryRes);
      setModelsData(modelsRes);
      setRecentHistory(historyRes.records || []);
    } catch (err) {
      console.error("Dashboard initial load failed:", err);
      setError("Unable to load live dashboard statistics. Please ensure backend is operational.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrendHistory(days) {
    try {
      setTrendLoading(true);
      const res = await api.getTrends(days).catch(() => null);
      if (res && Array.isArray(res)) {
        setTrendData(res);
      } else {
        // Fallback to overview trends if available
        const overview = await api.getOverview().catch(() => null);
        if (overview && Array.isArray(overview.trends)) {
          setTrendData(overview.trends);
        } else {
          setTrendData([]);
        }
      }
    } catch (err) {
      console.warn("Trend fetch warning:", err);
      setTrendData([]);
    } finally {
      setTrendLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Charts Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl lg:col-span-1" />
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        </div>

        {/* Table & Actions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl lg:col-span-1" />
        </div>
      </div>
    );
  }

  // Parse metrics safely from real API responses
  const totalAnalyses =
    dashboardData?.total_analyses ??
    dashboardData?.kpis?.total_records ??
    0;

  const posCount =
    dashboardData?.positive_count ??
    dashboardData?.kpis?.positive_count ??
    0;

  const neuCount =
    dashboardData?.neutral_count ??
    dashboardData?.kpis?.neutral_count ??
    0;

  const negCount =
    dashboardData?.negative_count ??
    dashboardData?.kpis?.negative_count ??
    0;

  const posPct =
    dashboardData?.positive_pct ??
    dashboardData?.kpis?.positive_pct ??
    (totalAnalyses > 0 ? ((posCount / totalAnalyses) * 100).toFixed(1) : 0);

  const neuPct =
    dashboardData?.neutral_pct ??
    dashboardData?.kpis?.neutral_pct ??
    (totalAnalyses > 0 ? ((neuCount / totalAnalyses) * 100).toFixed(1) : 0);

  const negPct =
    dashboardData?.negative_pct ??
    dashboardData?.kpis?.negative_pct ??
    (totalAnalyses > 0 ? ((negCount / totalAnalyses) * 100).toFixed(1) : 0);

  // Model accuracy extraction (default to active model or tfidf-logreg)
  let activeModelAccuracy = "58.56%";
  let activeModelName = "TF-IDF + LogReg";
  if (Array.isArray(modelsData) && modelsData.length > 0) {
    const defaultModel = modelsData.find((m) => m.is_default || m.model_id === "tfidf-logreg") || modelsData[0];
    if (defaultModel?.metrics?.accuracy) {
      activeModelAccuracy = `${(defaultModel.metrics.accuracy * 100).toFixed(2)}%`;
      activeModelName = defaultModel.name || defaultModel.model_id;
    }
  } else if (Array.isArray(dashboardData?.models) && dashboardData.models.length > 0) {
    const m = dashboardData.models[0];
    if (m?.accuracy) {
      activeModelAccuracy = `${m.accuracy}%`;
      activeModelName = m.name || m.id;
    }
  }

  // Donut distribution data
  const pieData = [
    { name: "Positive", value: posCount, color: "#10B981" },
    { name: "Neutral", value: neuCount, color: "#F59E0B" },
    { name: "Negative", value: negCount, color: "#EF4444" },
  ];
  const hasSentimentData = totalAnalyses > 0 && (posCount > 0 || neuCount > 0 || negCount > 0);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>AI Operations & Sentiment Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Sentiment Analytics Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time classification metrics, sentiment distribution, and model telemetry.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedToday}</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/analyze">
            <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              <span>New Analysis</span>
            </button>
          </Link>
          <Link to="/batch">
            <button className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Upload CSV</span>
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. KPI Cards (Real Data, 5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Analyses */}
        <StatCard
          title="Total Analyses"
          value={totalAnalyses.toLocaleString()}
          icon={Layers}
          colorClass="text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-400"
          description="Total processed text samples"
        />

        {/* Card 2: Positive Sentiment */}
        <StatCard
          title="Positive Sentiment"
          value={posCount.toLocaleString()}
          icon={Smile}
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400"
          description={`${posPct}% of total volume`}
        />

        {/* Card 3: Neutral Sentiment */}
        <StatCard
          title="Neutral Sentiment"
          value={neuCount.toLocaleString()}
          icon={Meh}
          colorClass="text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400"
          description={`${neuPct}% of total volume`}
        />

        {/* Card 4: Negative Sentiment */}
        <StatCard
          title="Negative Sentiment"
          value={negCount.toLocaleString()}
          icon={Frown}
          colorClass="text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400"
          description={`${negPct}% of total volume`}
        />

        {/* Card 5: Model Accuracy */}
        <StatCard
          title="Model Accuracy"
          value={activeModelAccuracy}
          icon={BrainCircuit}
          colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400"
          description={`TweetEval · ${activeModelName}`}
        />
      </div>

      {/* 3. Charts Row: Distribution & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Distribution Donut Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Sentiment Distribution
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Polarity breakdown of all classified items
            </p>
          </div>

          {hasSentimentData ? (
            <div className="my-4 flex flex-col items-center justify-center">
              <div className="relative w-full h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      stroke="transparent"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const pct = totalAnalyses > 0 ? ((data.value / totalAnalyses) * 100).toFixed(1) : 0;
                          return (
                            <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-800">
                              <p className="font-semibold">{data.name}</p>
                              <p className="text-slate-300 mt-0.5">
                                {data.value.toLocaleString()} items ({pct}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {totalAnalyses.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Professional Legend Below */}
              <div className="w-full grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Positive
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {posPct}%
                  </span>
                  <span className="text-[11px] text-slate-400">({posCount})</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Neutral
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {neuPct}%
                  </span>
                  <span className="text-[11px] text-slate-400">({neuCount})</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Negative
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {negPct}%
                  </span>
                  <span className="text-[11px] text-slate-400">({negCount})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl my-4 border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No analyses yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Run your first analysis to see real-time distribution metrics here.
              </p>
              <Link to="/analyze" className="mt-3">
                <button className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  Run First Analysis
                </button>
              </Link>
            </div>
          )}

          <div className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500">
            Computed from active prediction store
          </div>
        </div>

        {/* Sentiment Trends Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sentiment Trends
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Daily polarity movement and volume fluctuations
              </p>
            </div>

            {/* Lookback Filter Tabs: 7d, 30d, 90d */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
              {[
                { label: "7d", days: 7 },
                { label: "30d", days: 30 },
                { label: "90d", days: 90 },
              ].map((btn) => (
                <button
                  key={btn.days}
                  onClick={() => setTrendDays(btn.days)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    trendDays === btn.days
                      ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart Content */}
          <div className="my-4 h-64 w-full">
            {trendLoading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            ) : displayTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={displayTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => {
                      if (!str) return "";
                      try {
                        const parts = str.split("-");
                        if (parts.length === 3) {
                          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const m = parseInt(parts[1], 10) - 1;
                          const d = parseInt(parts[2], 10);
                          return `${monthNames[m]} ${d}`;
                        }
                      } catch {}
                      return str;
                    }}
                  />
                  <YAxis
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        let formattedLabel = label;
                        try {
                          const parts = label.split("-");
                          if (parts.length === 3) {
                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            formattedLabel = `${monthNames[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}, ${parts[0]}`;
                          }
                        } catch {}
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-800 space-y-1.5 min-w-[140px]">
                            <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
                              {formattedLabel}
                            </p>
                            {payload.map((entry) => (
                              <div
                                key={entry.name}
                                className="flex items-center justify-between gap-3 text-xs"
                              >
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  {entry.name}
                                </span>
                                <span className="font-bold tabular-nums">
                                  {entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    name="Positive"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPos)"
                    dot={{ r: 3, fill: "#10B981", strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    name="Neutral"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorNeu)"
                    dot={{ r: 3, fill: "#F59E0B", strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    name="Negative"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorNeg)"
                    dot={{ r: 3, fill: "#EF4444", strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <TrendingUp className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No trend data available for {trendDays}d lookback
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Run analyses or upload historical timestamped data to visualize sentiment trajectory over time.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Aggregated by date sequence</span>
            <Link
              to="/analytics"
              className="text-brand-600 dark:text-brand-400 hover:underline font-medium flex items-center gap-1"
            >
              <span>Full Analytics Suite</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Analysis Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analysis Table (2 columns) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Analysis
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Latest live predictions processed through active engines
              </p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {historyRecords.length > 0 ? (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Text Preview</th>
                    <th className="py-2.5 px-3">Sentiment</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {historyRecords.map((item) => {
                    const sentiment = String(item.label || "neutral").toLowerCase();
                    const badgeStyles =
                      sentiment === "positive"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                        : sentiment === "negative"
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60";

                    const confValue =
                      item.confidence !== undefined && item.confidence !== null
                        ? `${(item.confidence * 100).toFixed(1)}%`
                        : "N/A";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3 max-w-xs sm:max-w-sm truncate font-medium text-slate-800 dark:text-slate-200">
                          {item.text_preview || "—"}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyles}`}
                          >
                            {sentiment.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 tabular-nums font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {confValue}
                        </td>
                        <td className="py-3 px-3 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {item.created_at || "Just now"}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 dark:hover:text-brand-400 transition-colors cursor-pointer"
                            title="Inspect classification details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No recent analyses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Single or batch sentiment evaluations will be automatically logged here.
              </p>
              <Link to="/analyze" className="mt-4">
                <button className="bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  Analyse Text Now
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* 4 Quick Actions Cards (1 column) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Quick Actions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Rapid access to essential platform workflows
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 my-4">
            {/* Action 1: Text Analysis */}
            <Link
              to="/analyze"
              className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700 hover:bg-brand-50/50 dark:hover:bg-slate-800/60 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                    Analyze Text
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    Real-time inference with rationale
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </Link>

            {/* Action 2: Upload CSV */}
            <Link
              to="/batch"
              className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700 hover:bg-brand-50/50 dark:hover:bg-slate-800/60 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    Upload CSV
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    Batch datasets & auto-detection
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </Link>

            {/* Action 3: View Analytics */}
            <Link
              to="/analytics"
              className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700 hover:bg-brand-50/50 dark:hover:bg-slate-800/60 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex-shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    View Analytics
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    Platform metrics & keyword trends
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </Link>

            {/* Action 4: Evaluate Model */}
            <Link
              to="/models"
              className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-700 hover:bg-brand-50/50 dark:hover:bg-slate-800/60 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex-shrink-0">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                    Evaluate Model
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    Inspect benchmark matrix & F1-score
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </Link>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Model Engine</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {activeModelName}
            </span>
          </div>
        </div>
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Prediction Details #{selectedRecord.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Analyzed Text
                </label>
                <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans max-h-40 overflow-y-auto">
                  "{selectedRecord.text_preview}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">Class Label</span>
                  <p className="text-sm font-bold uppercase mt-0.5 text-slate-900 dark:text-white">
                    {selectedRecord.label}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">Confidence</span>
                  <p className="text-sm font-bold tabular-nums mt-0.5 text-slate-900 dark:text-white">
                    {selectedRecord.confidence
                      ? `${(selectedRecord.confidence * 100).toFixed(2)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Platform: {selectedRecord.platform || "Direct Input"}</span>
                <span>Logged: {selectedRecord.created_at}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
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
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

import { api } from "../../lib/api";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [overviewRes, historyRes] = await Promise.all([
        api.getOverview(),
        api.getHistory(1, 5),
      ]);
      setData(overviewRes);
      setRecentHistory(historyRes.records || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-1" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const kpis = data?.kpis || {
    total_records: 0,
    positive_count: 0,
    positive_pct: 0,
    neutral_count: 0,
    neutral_pct: 0,
    negative_count: 0,
    negative_pct: 0,
    avg_confidence: 0,
    active_model: "TF-IDF + Logistic Regression",
  };

  const distribution = data?.distribution || [];
  const trends = data?.trends || [];
  const hasData = data?.has_data;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-surface border border-border rounded-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <img
            src="/sentiscope-logo.png"
            alt="SentiScope AI"
            className="w-14 h-14 object-contain rounded-xl p-1 bg-surface-muted border border-border/80 flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wide">
                Intelligence Platform
              </span>
              <span className="text-xs text-text-muted">· Live Operational Analytics</span>
            </div>
            <h2 className="text-xl font-bold text-text mt-1">Sentiment & Audience Intelligence</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Traceable classification powered by evaluated NLP pipelines and real test benchmarks.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/analyze">
            <Button size="sm" icon={MessageSquare}>
              Analyse Text
            </Button>
          </Link>
          <Link to="/batch">
            <Button size="sm" variant="secondary" icon={FileSpreadsheet}>
              Upload CSV
            </Button>
          </Link>
          <Link to="/reports">
            <Button size="sm" variant="outline" icon={Download}>
              Export Report
            </Button>
          </Link>
        </div>
      </div>

      {/* A. Summary KPI Cards Grid (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Analyses */}
        <Card className="!p-4">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-text tabular-nums">{kpis.total_records}</div>
          <div className="text-[11px] text-text-muted mt-1">Classified samples</div>
        </Card>

        {/* Positive Sentiment */}
        <Card className="!p-4">
          <div className="flex items-center justify-between text-positive mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Positive</span>
            <Smile className="w-4 h-4 text-positive" />
          </div>
          <div className="text-2xl font-bold text-positive tabular-nums">{kpis.positive_count}</div>
          <div className="text-[11px] text-text-muted mt-1">{kpis.positive_pct}% of dataset</div>
        </Card>

        {/* Neutral Sentiment */}
        <Card className="!p-4">
          <div className="flex items-center justify-between text-neutral mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Neutral</span>
            <Meh className="w-4 h-4 text-neutral" />
          </div>
          <div className="text-2xl font-bold text-neutral tabular-nums">{kpis.neutral_count}</div>
          <div className="text-[11px] text-text-muted mt-1">{kpis.neutral_pct}% of dataset</div>
        </Card>

        {/* Negative Sentiment */}
        <Card className="!p-4">
          <div className="flex items-center justify-between text-negative mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Negative</span>
            <Frown className="w-4 h-4 text-negative" />
          </div>
          <div className="text-2xl font-bold text-negative tabular-nums">{kpis.negative_count}</div>
          <div className="text-[11px] text-text-muted mt-1">{kpis.negative_pct}% of dataset</div>
        </Card>

        {/* Average Confidence */}
        <Card className="!p-4">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Confidence</span>
            <TrendingUp className="w-4 h-4 text-info" />
          </div>
          <div className="text-2xl font-bold text-text tabular-nums">
            {(kpis.avg_confidence * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-text-muted mt-1">Mean probability</div>
        </Card>

        {/* Model Version */}
        <Card className="!p-4">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Model</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm font-bold text-text truncate mt-1">TF-IDF + LR</div>
          <div className="text-[11px] text-positive font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Evaluated
          </div>
        </Card>
      </div>

      {/* Visual Analytics Row: Distribution + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* B. Sentiment Distribution (Pie/Donut) */}
        <Card title="Sentiment Distribution" subtitle="Proportion of classes in database" className="lg:col-span-1">
          {hasData && distribution.length > 0 ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      color: "var(--text)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-2">
                {distribution.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No sentiment distribution yet"
              description="Analyze text to view the real-time distribution donut."
            />
          )}
        </Card>

        {/* C. Sentiment Trend Chart */}
        <Card
          title="Sentiment Trend Over Time"
          subtitle="Daily volume broken down by polarity"
          action={
            <Link to="/analytics" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              View Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
          className="lg:col-span-2"
        >
          {hasData && trends.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      color: "var(--text)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="positive" name="Positive" fill="#159A68" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="neutral" name="Neutral" fill="#D18A24" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="negative" name="Negative" fill="#D94B55" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No time-series data yet"
              description="Upload a CSV with dates or analyze comments to see daily sentiment volume."
            />
          )}
        </Card>
      </div>

      {/* D. Recent Analyses & E. Active Model Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses Table */}
        <Card
          title="Recent Analyses"
          subtitle="Latest records classified by the active engine"
          action={
            <Link to="/history" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              All Records <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
          className="lg:col-span-2"
        >
          {recentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted font-medium">
                    <th className="py-2.5 px-3">Text Preview</th>
                    <th className="py-2.5 px-3">Sentiment</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3 px-3 max-w-xs truncate font-medium text-text">
                        {item.text_preview}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={item.label} />
                      </td>
                      <td className="py-3 px-3 tabular-nums font-medium text-text">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-text-muted">
                        {item.platform || "General"}
                      </td>
                      <td className="py-3 px-3 text-right text-text-muted tabular-nums whitespace-nowrap">
                        {item.created_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No recent records"
              description="Your single or batch text classifications will appear here."
              actionLabel="Analyse your first text"
              onAction={() => window.location.assign("/analyze")}
            />
          )}
        </Card>

        {/* E. Active Model Information Card */}
        <Card title="Active Model Engine" subtitle="Architecture & evaluation profile" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium">Identifier</span>
                <span className="text-xs font-bold text-text">tfidf-logreg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium">Architecture</span>
                <span className="text-xs text-text">TF-IDF (1-2 gram) + LogReg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium">Classes</span>
                <span className="text-xs text-text">Negative, Neutral, Positive</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium">Benchmark</span>
                <span className="text-xs text-text font-medium">TweetEval (12.3k test)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-text-muted">
                <span>Test Accuracy</span>
                <span className="font-semibold text-text">58.6%</span>
              </div>
              <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "58.6%" }} />
              </div>

              <div className="flex justify-between items-center text-text-muted mt-2">
                <span>Test Macro-F1</span>
                <span className="font-semibold text-text">0.584</span>
              </div>
              <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                <div className="bg-positive h-full rounded-full" style={{ width: "58.4%" }} />
              </div>
            </div>

            <Link to="/models" className="block pt-2">
              <Button size="sm" variant="outline" className="w-full justify-between" icon={CheckCircle2}>
                <span>View Confusion Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


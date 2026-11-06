import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, Share2, Tag, Layers, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import { Card } from "../../components/common/Card";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await api.getOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const hasData = data?.has_data;
  const distribution = data?.distribution || [];
  const trends = data?.trends || [];
  const platforms = data?.platforms || [];
  const topKeywords = data?.top_keywords || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Sentiment & Social Media Analytics</h2>
          <p className="text-xs text-text-muted mt-1">
            Aggregated sentiment trends, cross-platform comparisons, and distinctive vocabulary.
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2 text-text-muted hover:text-text bg-surface border border-border rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {!hasData ? (
        <Card>
          <EmptyState
            title="No analytical data yet"
            description="Process text or upload a CSV dataset to unlock cross-platform intelligence and keyword breakdowns."
          />
        </Card>
      ) : (
        <>
          {/* Top Charts: Distribution & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Share */}
            <Card title="Sentiment Share" subtitle="Overall positive, neutral, and negative ratio">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              </div>
            </Card>

            {/* Time Trends */}
            <Card title="Sentiment Trajectory" subtitle="Volume by date">
              <div className="h-72">
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends}>
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
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Bar dataKey="positive" name="Positive" fill="#159A68" stackId="a" />
                      <Bar dataKey="neutral" name="Neutral" fill="#D18A24" stackId="a" />
                      <Bar dataKey="negative" name="Negative" fill="#D94B55" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-text-muted">
                    No date timestamps found in current records.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Bottom Charts: Platforms & Keywords */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Comparison */}
            <Card title="Platform Breakdown" subtitle="Sentiment breakdown across social channels">
              <div className="h-72">
                {platforms.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platforms} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                      <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                      <YAxis dataKey="platform" type="category" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--surface)",
                          borderColor: "var(--border)",
                          borderRadius: "8px",
                          color: "var(--text)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="positive" name="Positive" fill="#159A68" stackId="a" />
                      <Bar dataKey="neutral" name="Neutral" fill="#D18A24" stackId="a" />
                      <Bar dataKey="negative" name="Negative" fill="#D94B55" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-text-muted">
                    No platform identifiers in current records.
                  </div>
                )}
              </div>
            </Card>

            {/* Keyword Frequency by Sentiment */}
            <Card title="Top Vocabulary & Keywords" subtitle="Most frequent distinctive terms by class">
              <div className="space-y-4">
                {topKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {topKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                          kw.sentiment === "positive"
                            ? "bg-positive-soft text-positive border-positive/30"
                            : kw.sentiment === "negative"
                            ? "bg-negative-soft text-negative border-negative/30"
                            : "bg-neutral-soft text-neutral border-neutral/30"
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{kw.word}</span>
                        <span className="opacity-70 font-mono text-[10px]">({kw.count})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-text-muted">
                    No keyword frequencies computed yet.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}


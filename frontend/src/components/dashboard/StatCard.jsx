import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Premium KPI statistic card for the dashboard.
 */
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary-soft",
  trend,         // { value: number, label: string } — only show if data exists
  accentColor,   // e.g. "positive" | "negative" | "neutral" | "primary"
  className = "",
}) {
  const accentMap = {
    positive: { value: "text-positive", border: "border-l-4 border-l-positive" },
    negative: { value: "text-negative", border: "border-l-4 border-l-negative" },
    neutral:  { value: "text-neutral",  border: "border-l-4 border-l-neutral" },
    primary:  { value: "text-primary",  border: "border-l-4 border-l-primary" },
  };

  const accent = accentMap[accentColor] || { value: "text-text", border: "" };

  return (
    <div
      className={`
        bg-surface border border-border rounded-xl p-5 shadow-card
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
        ${accent.border} ${className}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className={`text-2xl font-bold tabular-nums tracking-tight ${accent.value}`}>
        {value}
      </div>

      {description && (
        <div className="text-xs text-text-muted mt-1 leading-relaxed">{description}</div>
      )}

      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.value > 0 ? "text-positive" : trend.value < 0 ? "text-negative" : "text-text-muted"}`}>
          {trend.value > 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : trend.value < 0 ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}


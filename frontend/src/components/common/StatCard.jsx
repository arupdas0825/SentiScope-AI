import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatCard({
  title,
  value,
  icon: Icon,
  colorClass = "text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-400",
  description,
  trend,
  className = "",
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl flex items-center justify-center ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
          {value ?? 0}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : trend.direction === "down"
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
            {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
            {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
            {trend.label}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 truncate">
          {description}
        </p>
      )}
    </div>
  );
}

export default StatCard;

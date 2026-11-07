import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome banner */}
      <div className="h-24 bg-surface-muted rounded-xl border border-border" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-surface-muted rounded-xl border border-border" />
        ))}
      </div>

      {/* Quick actions */}
      <div className="h-32 bg-surface-muted rounded-xl border border-border" />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 bg-surface-muted rounded-xl border border-border" />
        <div className="h-80 bg-surface-muted rounded-xl border border-border lg:col-span-2" />
      </div>

      {/* Table + model card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-surface-muted rounded-xl border border-border lg:col-span-2" />
        <div className="h-64 bg-surface-muted rounded-xl border border-border" />
      </div>
    </div>
  );
}


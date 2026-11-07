import React from "react";

export function Card({ children, className = "", title, subtitle, action }) {
  return (
    <div className={`bg-surface border border-border rounded-xl p-5 shadow-card transition-shadow duration-200 hover:shadow-md ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-border gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-text tracking-tight truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

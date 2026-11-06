import React from "react";

export function Card({ children, className = "", title, subtitle, action }) {
  return (
    <div className={`bg-surface border border-border rounded-card p-5 shadow-sm transition-all duration-150 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60">
          <div>
            {title && <h3 className="text-base font-semibold text-text tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}


import React from "react";

export function Skeleton({ className = "", count = 1 }) {
  if (count > 1) {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`animate-pulse bg-surface-muted rounded-lg ${className}`}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={`animate-pulse bg-surface-muted rounded-lg ${className}`}
    />
  );
}

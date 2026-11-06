import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-surface-muted border border-border/40 rounded-lg ${className}`} />
  );
}


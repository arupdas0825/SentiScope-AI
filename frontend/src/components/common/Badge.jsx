import React from "react";
import { Smile, Meh, Frown } from "lucide-react";

export function Badge({ variant = "default", children, className = "", icon = true }) {
  const v = String(variant).toLowerCase();

  let styles = "bg-surface-muted text-text-muted border-border";
  let IconComponent = null;

  if (v === "positive") {
    styles = "bg-positive-soft text-positive border-positive/30 font-medium";
    IconComponent = Smile;
  } else if (v === "negative") {
    styles = "bg-negative-soft text-negative border-negative/30 font-medium";
    IconComponent = Frown;
  } else if (v === "neutral") {
    styles = "bg-neutral-soft text-neutral border-neutral/30 font-medium";
    IconComponent = Meh;
  } else if (v === "primary") {
    styles = "bg-primary/10 text-primary border-primary/20 font-medium";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border tracking-wide uppercase font-semibold ${styles} ${className}`}
    >
      {icon && IconComponent && <IconComponent className="w-3.5 h-3.5" />}
      {children || variant}
    </span>
  );
}


import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data available",
  description = "Get started by analyzing a comment, pasting bulk texts, or uploading a CSV dataset.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-surface-muted border border-border flex items-center justify-center text-text-subtle mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      <p className="text-xs text-text-muted max-w-xs mt-1.5 mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

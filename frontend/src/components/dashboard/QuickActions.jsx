import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  FileSpreadsheet,
  BarChart3,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

const ACTIONS = [
  {
    title: "Analyze Text",
    description: "Classify a single comment or review",
    icon: MessageSquare,
    path: "/analyze",
    iconColor: "text-primary",
    iconBg: "bg-primary-soft",
  },
  {
    title: "Upload CSV",
    description: "Process a dataset in bulk",
    icon: FileSpreadsheet,
    path: "/batch",
    iconColor: "text-positive",
    iconBg: "bg-positive-soft",
  },
  {
    title: "View Analytics",
    description: "Explore trends and distributions",
    icon: BarChart3,
    path: "/analytics",
    iconColor: "text-neutral",
    iconBg: "bg-neutral-soft",
  },
  {
    title: "Evaluate Models",
    description: "Compare accuracy and F1 scores",
    icon: BrainCircuit,
    path: "/models",
    iconColor: "text-info",
    iconBg: "bg-info-soft",
  },
];

export function QuickActions() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">Quick Actions</h3>
        <span className="text-xs text-text-subtle">Jump to a module</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="group flex flex-col gap-2.5 p-3.5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-soft/30 transition-all duration-150"
            >
              <div className={`w-9 h-9 rounded-lg ${action.iconBg} ${action.iconColor} flex items-center justify-center`}>
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text group-hover:text-primary transition-colors leading-tight">
                  {action.title}
                </div>
                <div className="text-2xs text-text-muted mt-0.5 leading-relaxed">
                  {action.description}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover:text-primary transition-colors mt-auto" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}


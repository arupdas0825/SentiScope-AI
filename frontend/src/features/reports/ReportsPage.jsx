import React from "react";
import { Download, FileSpreadsheet, FileJson, CheckCircle2, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text">Reports & Exports Center</h2>
        <p className="text-xs text-text-muted mt-1">
          Export full analysis runs and evaluation data in CSV or JSON formats for downstream analytics or academic portfolios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <Card title="CSV Spreadsheet Export" subtitle="Standard tabular format for Excel / Google Sheets">
          <div className="space-y-4">
            <p className="text-xs text-text-muted leading-relaxed">
              Downloads all classified comments with assigned sentiment, probability metrics, source platform, and UTC timestamps. Includes automated protection against spreadsheet formula injection.
            </p>

            <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-text font-medium">
                <ShieldCheck className="w-4 h-4 text-positive" />
                <span>Formula Injection Sanitization (RFC 4180)</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Fields starting with =, +, -, or @ are safely escaped.
              </p>
            </div>

            <a href={api.getExportCSVUrl()} download="sentiscope_sentiment_report.csv" className="block pt-2">
              <Button size="md" className="w-full" icon={FileSpreadsheet}>
                Download CSV Report
              </Button>
            </a>
          </div>
        </Card>

        {/* JSON Export Card */}
        <Card title="Structured JSON Export" subtitle="Machine-readable data for APIs & ML pipelines">
          <div className="space-y-4">
            <p className="text-xs text-text-muted leading-relaxed">
              Downloads complete raw analysis history including text hashes, granular confidence distributions, and platform identifiers in standard JSON structure.
            </p>

            <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-text font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Standard Schema Format</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Suitable for automated programmatic validation or database ingestion.
              </p>
            </div>

            <a href={api.getExportJSONUrl()} download="sentiscope_sentiment_report.json" className="block pt-2">
              <Button size="md" variant="secondary" className="w-full" icon={FileJson}>
                Download JSON Report
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}


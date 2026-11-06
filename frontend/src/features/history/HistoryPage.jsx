import React, { useEffect, useState } from "react";
import { Search, Trash2, ChevronLeft, ChevronRight, Filter, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Skeleton } from "../../components/common/Skeleton";
import { EmptyState } from "../../components/common/EmptyState";

export function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [page, sentimentFilter]);

  async function loadHistory() {
    try {
      setLoading(true);
      const res = await api.getHistory(page, pageSize, sentimentFilter || undefined, searchQuery || undefined);
      setRecords(res.records || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    loadHistory();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this analysis record permanently?")) return;
    try {
      await api.deleteHistoryItem(id);
      loadHistory();
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    }
  }

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Analysis History</h2>
          <p className="text-xs text-text-muted mt-1">
            Browse, search, and manage all single, batch, and CSV predictions stored in SQLite.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments..."
              className="pl-8 pr-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
          </form>

          <select
            value={sentimentFilter}
            onChange={(e) => {
              setSentimentFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 text-text cursor-pointer"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          <Button size="sm" variant="outline" onClick={loadHistory} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : records.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted font-medium bg-surface-muted/40">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Comment Text Preview</th>
                    <th className="py-2.5 px-3">Sentiment</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Analyzed At</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-muted/40 transition-colors">
                      <td className="py-3 px-3 text-text-muted tabular-nums font-mono">#{r.id}</td>
                      <td className="py-3 px-3 text-text max-w-md truncate font-medium">
                        {r.text_preview}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={r.label} />
                      </td>
                      <td className="py-3 px-3 tabular-nums font-medium text-text">
                        {(r.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-text-muted">
                        {r.platform || "General"}
                      </td>
                      <td className="py-3 px-3 text-text-muted tabular-nums whitespace-nowrap">
                        {r.created_at}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-text-muted hover:text-negative rounded hover:bg-surface-muted transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border text-xs text-text-muted">
              <span>
                Showing {records.length} of {total} records
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  icon={ChevronLeft}
                >
                  Prev
                </Button>
                <span className="font-medium text-text tabular-nums">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No records found"
            description="No analysis records match your current filter or search criteria."
          />
        )}
      </Card>
    </div>
  );
}


import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { TextAnalysisPage } from "./features/analysis/TextAnalysisPage";
import { BatchAnalysisPage } from "./features/batch/BatchAnalysisPage";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";
import { ModelEvaluationPage } from "./features/models/ModelEvaluationPage";
import { HistoryPage } from "./features/history/HistoryPage";
import { ReportsPage } from "./features/reports/ReportsPage";
import { SettingsPage } from "./features/settings/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analyze" element={<TextAnalysisPage />} />
            <Route path="/batch" element={<BatchAnalysisPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/models" element={<ModelEvaluationPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;


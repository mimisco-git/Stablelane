import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceAnalytics } from "@/components/workspace-analytics";

export default function AnalyticsPage() {
  return (
    <DashboardShell
      currentPath="/app/analytics"
      title="Analytics"
      description="Workspace analytics now pull directly from saved invoice and client records so Stablelane can show real client-linked business signals, not only static placeholders."
      badge="Live analytics"
    >
      <WorkspaceAnalytics />
    </DashboardShell>
  );
}

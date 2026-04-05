import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceAnalytics } from "@/components/workspace-analytics";

export default function AnalyticsPage() {
  return (
    <DashboardShell
      currentPath="/app/analytics"
      title="Analytics"
      description="Revenue signals, client patterns, and payment reliability metrics built from your real invoice history."
      badge="Analytics"
    >
      <WorkspaceAnalytics />
    </DashboardShell>
  );
}

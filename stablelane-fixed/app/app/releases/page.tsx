import { DashboardShell } from "@/components/dashboard-shell";
import { ReleaseOrchestrationCenter } from "@/components/release-orchestration-center";

export default function ReleasesPage() {
  return (
    <DashboardShell
      currentPath="/app/releases"
      title="Releases"
      description="Release management for funded invoices, approval gates, and final settlement execution."
      badge="Releases"
    >
      <ReleaseOrchestrationCenter />
    </DashboardShell>
  );
}

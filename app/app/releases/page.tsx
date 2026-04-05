import { DashboardShell } from "@/components/dashboard-shell";
import { ReleaseOrchestrationCenter } from "@/components/release-orchestration-center";

export default function ReleasesPage() {
  return (
    <DashboardShell
      currentPath="/app/releases"
      title="Releases"
      description="A premium release orchestration screen for funded invoices, approval gates, and final release readiness."
      badge="Release center"
    >
      <ReleaseOrchestrationCenter />
    </DashboardShell>
  );
}

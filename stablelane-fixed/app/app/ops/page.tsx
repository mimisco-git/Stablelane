import { DashboardShell } from "@/components/dashboard-shell";
import { OpsCommandCenter } from "@/components/ops-command-center";

export default function OpsPage() {
  return (
    <DashboardShell
      currentPath="/app/ops"
      title="Ops"
      description="Operations console for approvals, settlement readiness, and Arc testnet workflows."
      badge="Ops"
    >
      <OpsCommandCenter />
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";
import { OpsCommandCenter } from "@/components/ops-command-center";

export default function OpsPage() {
  return (
    <DashboardShell
      currentPath="/app/ops"
      title="Ops"
      description="A premium operations console for the parts of Stablelane that matter most when running approvals, settlement readiness, and Arc testnet workflows."
      badge="Command center"
    >
      <OpsCommandCenter />
    </DashboardShell>
  );
}

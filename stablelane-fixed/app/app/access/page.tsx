import { DashboardShell } from "@/components/dashboard-shell";
import { RealAccessControlPanel } from "@/components/real-access-control-panel";

export default function AccessPage() {
  return (
    <DashboardShell
      currentPath="/app/access"
      title="Access"
      description="Access control for workspace members, invitations, and permission management."
      badge="Access control"
    >
      <RealAccessControlPanel />
    </DashboardShell>
  );
}

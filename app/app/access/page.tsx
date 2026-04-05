import { DashboardShell } from "@/components/dashboard-shell";
import { RealAccessControlPanel } from "@/components/real-access-control-panel";

export default function AccessPage() {
  return (
    <DashboardShell
      currentPath="/app/access"
      title="Access"
      description="A real workspace-access control page for signed-in users, invitations, memberships, and permission resolution."
      badge="Real access"
    >
      <RealAccessControlPanel />
    </DashboardShell>
  );
}

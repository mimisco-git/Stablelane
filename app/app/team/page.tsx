import { DashboardShell } from "@/components/dashboard-shell";
import { TeamRolesManager } from "@/components/team-roles-manager";

export default function TeamPage() {
  return (
    <DashboardShell
      currentPath="/app/team"
      title="Team"
      description="This stage introduces a premium workspace-role preview so Stablelane feels more like a true operational product for agencies and finance teams."
      badge="Team controls"
    >
      <TeamRolesManager />
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceInvitationsManager } from "@/components/workspace-invitations-manager";

export default function InvitationsPage() {
  return (
    <DashboardShell
      currentPath="/app/invitations"
      title="Invitations"
      description="A dedicated invitation flow for onboarding future workspace members before they become fully active operators inside Stablelane."
      badge="Team onboarding"
    >
      <WorkspaceInvitationsManager />
    </DashboardShell>
  );
}

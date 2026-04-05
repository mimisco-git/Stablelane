import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceInvitationsManager } from "@/components/workspace-invitations-manager";

export default function InvitationsPage() {
  return (
    <DashboardShell
      currentPath="/app/invitations"
      title="Invitations"
      description="Invite collaborators and manage pending access requests for your workspace."
      badge="Invitations"
    >
      <WorkspaceInvitationsManager />
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";
import { ApprovalInboxPanel } from "@/components/approval-inbox-panel";

export default function InboxPage() {
  return (
    <DashboardShell
      currentPath="/app/inbox"
      title="Inbox"
      description="A premium workspace inbox for approval pressure, pending invitations, and recent operational signals."
      badge="Workspace inbox"
    >
      <ApprovalInboxPanel />
    </DashboardShell>
  );
}

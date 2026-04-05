import { DashboardShell } from "@/components/dashboard-shell";
import { ApprovalInboxPanel } from "@/components/approval-inbox-panel";

export default function InboxPage() {
  return (
    <DashboardShell
      currentPath="/app/inbox"
      title="Inbox"
      description="Incoming approvals, pending invitations, and workspace alerts in one place."
      badge="Inbox"
    >
      <ApprovalInboxPanel />
    </DashboardShell>
  );
}

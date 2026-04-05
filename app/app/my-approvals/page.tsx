import { DashboardShell } from "@/components/dashboard-shell";
import { MyApprovalsPanel } from "@/components/my-approvals-panel";

export default function MyApprovalsPage() {
  return (
    <DashboardShell
      currentPath="/app/my-approvals"
      title="My approvals"
      description="A dedicated approver inbox for the currently signed-in user, so approvals can be actioned by the assigned person instead of only the workspace owner."
      badge="Approver view"
    >
      <MyApprovalsPanel />
    </DashboardShell>
  );
}

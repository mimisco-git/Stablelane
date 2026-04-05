import { DashboardShell } from "@/components/dashboard-shell";
import { ApprovalOpsPanel } from "@/components/approval-ops-panel";
import { ActingRoleSwitcher } from "@/components/acting-role-switcher";

export default function ApprovalsPage() {
  return (
    <DashboardShell
      currentPath="/app/approvals"
      title="Approvals"
      description="Workspace-level approval queue and release control for all active milestone decisions."
      badge="Approvals"
    >
      <div className="grid gap-4">
        <ActingRoleSwitcher />
        <ApprovalOpsPanel />
      </div>
    </DashboardShell>
  );
}

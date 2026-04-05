import { DashboardShell } from "@/components/dashboard-shell";
import { ApprovalOpsPanel } from "@/components/approval-ops-panel";
import { ActingRoleSwitcher } from "@/components/acting-role-switcher";

export default function ApprovalsPage() {
  return (
    <DashboardShell
      currentPath="/app/approvals"
      title="Approvals"
      description="A workspace-level approval operations page that makes release control feel more like a real finance and operations product."
      badge="Approval ops"
    >
      <div className="grid gap-4">
        <ActingRoleSwitcher />
        <ApprovalOpsPanel />
      </div>
    </DashboardShell>
  );
}

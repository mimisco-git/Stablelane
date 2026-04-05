import { DashboardShell } from "@/components/dashboard-shell";
import { MyApprovalsPanel } from "@/components/my-approvals-panel";

export default function MyApprovalsPage() {
  return (
    <DashboardShell
      currentPath="/app/my-approvals"
      title="My approvals"
      description="Your personal queue of milestone approvals and release decisions assigned to you."
      badge="My approvals"
    >
      <MyApprovalsPanel />
    </DashboardShell>
  );
}

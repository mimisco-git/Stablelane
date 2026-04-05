import { DashboardShell } from "@/components/dashboard-shell";
import { AuditTrailPanel } from "@/components/audit-trail-panel";

export default function AuditPage() {
  return (
    <DashboardShell
      currentPath="/app/audit"
      title="Audit"
      description="Complete audit trail for key operational events and state changes across your workspace."
      badge="Audit trail"
    >
      <AuditTrailPanel />
    </DashboardShell>
  );
}

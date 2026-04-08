import { DashboardShell } from "@/components/dashboard-shell";
import { RecurringInvoices } from "@/components/recurring-invoices";

export default function RecurringPage() {
  return (
    <DashboardShell
      currentPath="/app/recurring"
      title="Recurring"
      description="Set up invoice schedules that auto-generate drafts for retainer clients. Review and send when ready."
      badge="Recurring"
    >
      <RecurringInvoices />
    </DashboardShell>
  );
}

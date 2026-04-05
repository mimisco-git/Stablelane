import { DashboardShell } from "@/components/dashboard-shell";
import { InvoicesBoard } from "@/components/invoices-board";

export default function InvoicesPage() {
  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Invoices"
      description="Track invoice state, funding status, and release readiness across all your client engagements."
      badge="Invoices"
    >
      <InvoicesBoard />
    </DashboardShell>
  );
}

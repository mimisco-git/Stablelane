import { DashboardShell } from "@/components/dashboard-shell";
import { InvoicesBoard } from "@/components/invoices-board";

export default function InvoicesPage() {
  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Invoices"
      description="The invoices area now mixes seeded mock records with local draft invoices so you can start testing a more believable workflow."
      badge="Interactive list"
    >
      <InvoicesBoard />
    </DashboardShell>
  );
}

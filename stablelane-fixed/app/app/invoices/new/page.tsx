import { DashboardShell } from "@/components/dashboard-shell";
import { InvoiceBuilder } from "@/components/invoice-builder";

export default function NewInvoicePage() {
  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Create invoice"
      description="Create a new invoice with milestones, client details, payment terms, and stablecoin settlement."
      badge="Invoice"
    >
      <InvoiceBuilder />
    </DashboardShell>
  );
}

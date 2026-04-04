import { DashboardShell } from "@/components/dashboard-shell";
import { InvoiceBuilder } from "@/components/invoice-builder";

export default function NewInvoicePage() {
  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Create invoice"
      description="This stage turns the invoice form into a working local draft builder so you can test the product flow before the backend arrives."
      badge="Interactive draft"
    >
      <InvoiceBuilder />
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";
import { InvoiceBuilder } from "@/components/invoice-builder";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Edit invoice draft"
      description="Edit invoice details, update milestones, and refine payment terms before sending."
      badge={id}
    >
      <InvoiceBuilder draftId={id} />
    </DashboardShell>
  );
}

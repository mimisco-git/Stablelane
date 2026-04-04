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
      description="This stage adds real draft editing, so saved workspace records can be refined instead of recreated from scratch."
      badge={id}
    >
      <InvoiceBuilder draftId={id} />
    </DashboardShell>
  );
}

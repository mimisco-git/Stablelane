import { DashboardShell } from "@/components/dashboard-shell";
import { InvoiceDetailView } from "@/components/invoice-detail-view";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Invoice detail"
      description="This stage turns invoice detail into a real record view that can load saved workspace drafts or browser drafts by ID."
      badge={id}
    >
      <InvoiceDetailView invoiceId={id} />
    </DashboardShell>
  );
}

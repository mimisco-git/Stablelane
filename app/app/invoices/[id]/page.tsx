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
      description="Full invoice detail with funding state, milestone breakdown, and release history."
      badge={id}
    >
      <InvoiceDetailView invoiceId={id} />
    </DashboardShell>
  );
}

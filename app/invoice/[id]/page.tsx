import { InvoiceStatusView } from "@/components/invoice-status-view";

export default async function InvoiceStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="min-h-screen">
      <InvoiceStatusView invoiceId={id} />
    </main>
  );
}

import { ClientPaymentView } from "@/components/client-payment-view";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="min-h-screen">
      <ClientPaymentView invoiceId={id} />
    </main>
  );
}

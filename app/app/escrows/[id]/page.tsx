import { DashboardShell } from "@/components/dashboard-shell";
import { EscrowWorkbench } from "@/components/escrow-workbench";

export default async function EscrowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardShell
      currentPath="/app/escrows"
      title="Escrow detail"
      description="This screen now behaves like a contract-ready escrow center, with wallet checks, explorer links, and a clear state timeline for the invoice."
      badge={id}
    >
      <EscrowWorkbench invoiceId={id} amount="$4,800" currency="USDC" />
    </DashboardShell>
  );
}

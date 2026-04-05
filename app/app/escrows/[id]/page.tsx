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
      description="Escrow state, wallet verification, milestone timeline, and settlement controls for this engagement."
      badge="Escrow detail"
    >
      <EscrowWorkbench invoiceId={id} amount="$4,800" currency="USDC" />
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";
import { EscrowMini } from "@/components/escrow-mini";

export default function EscrowMiniPage() {
  return (
    <DashboardShell
      currentPath="/app/escrow-mini"
      title="Escrow Mini"
      description="Send USDC into escrow instantly. No invoice needed. Release funds when ready."
      badge="Arc testnet"
    >
      <EscrowMini />
    </DashboardShell>
  );
}

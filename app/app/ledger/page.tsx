import { DashboardShell } from "@/components/dashboard-shell";
import { SettlementLedgerPanel } from "@/components/settlement-ledger-panel";

export default function LedgerPage() {
  return (
    <DashboardShell
      currentPath="/app/ledger"
      title="Ledger"
      description="Settlement records and stablecoin movement history for your workspace."
      badge="Ledger"
    >
      <SettlementLedgerPanel />
    </DashboardShell>
  );
}

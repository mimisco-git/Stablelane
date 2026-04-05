import { DashboardShell } from "@/components/dashboard-shell";
import { SettlementLedgerPanel } from "@/components/settlement-ledger-panel";

export default function LedgerPage() {
  return (
    <DashboardShell
      currentPath="/app/ledger"
      title="Ledger"
      description="A database-backed settlement ledger for the stablecoin movement happening inside the workspace."
      badge="Settlement ledger"
    >
      <SettlementLedgerPanel />
    </DashboardShell>
  );
}

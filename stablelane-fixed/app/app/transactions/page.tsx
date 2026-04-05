import { DashboardShell } from "@/components/dashboard-shell";
import { TransactionMonitorPanel } from "@/components/transaction-monitor-panel";

export default function TransactionsPage() {
  return (
    <DashboardShell
      currentPath="/app/transactions"
      title="Transactions"
      description="Live monitor for funding and release transaction hashes across your Arc workspace."
      badge="Transactions"
    >
      <TransactionMonitorPanel />
    </DashboardShell>
  );
}

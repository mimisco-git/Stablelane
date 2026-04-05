import { DashboardShell } from "@/components/dashboard-shell";
import { TransactionMonitorPanel } from "@/components/transaction-monitor-panel";

export default function TransactionsPage() {
  return (
    <DashboardShell
      currentPath="/app/transactions"
      title="Transactions"
      description="A live monitor for funding and release transaction hashes that already exist inside the workspace."
      badge="Onchain monitor"
    >
      <TransactionMonitorPanel />
    </DashboardShell>
  );
}

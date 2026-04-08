import { DashboardShell } from "@/components/dashboard-shell";
import { TreasuryConsole } from "@/components/treasury-console";

export default function TreasuryPage() {
  return (
    <DashboardShell
      currentPath="/app/treasury"
      title="Treasury"
      description="Manage wallets, check balances, transfer USDC, and view transaction history on Arc testnet."
      badge="Arc testnet"
    >
      <TreasuryConsole />
    </DashboardShell>
  );
}

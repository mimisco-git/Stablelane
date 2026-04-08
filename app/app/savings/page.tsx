import { DashboardShell } from "@/components/dashboard-shell";
import { SavingsPot } from "@/components/savings-pot";

export default function SavingsPage() {
  return (
    <DashboardShell
      currentPath="/app/savings"
      title="Savings Pot"
      description="Automatically route a percentage of every payout to a dedicated savings wallet on Arc testnet."
      badge="Arc testnet"
    >
      <SavingsPot />
    </DashboardShell>
  );
}

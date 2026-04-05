import { DashboardShell } from "@/components/dashboard-shell";
import { ArcNativeFinancePanel } from "@/components/arc-native-finance-panel";
import { ArcAmountGuide } from "@/components/arc-amount-guide";
import { ArcFinalityPanel } from "@/components/arc-finality-panel";
import { ArcBalanceReader } from "@/components/arc-balance-reader";
import { FundingLaneManager } from "@/components/funding-lane-manager";
import { CrosschainReadinessPanel } from "@/components/crosschain-readiness-panel";

export default function ArcPage() {
  return (
    <DashboardShell
      currentPath="/app/arc"
      title="Arc finance"
      description="This is the Arc-native workspace layer for Stablelane. It keeps testnet operations closer to Arc itself with stablecoin-aware balance logic, finality-aware confirmations, and clearer settlement lanes."
      badge="Arc testnet"
    >
      <div className="grid gap-4">
        <ArcNativeFinancePanel />
        <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
          <ArcAmountGuide />
          <ArcFinalityPanel />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
          <ArcBalanceReader />
          <FundingLaneManager />
        </div>
        <CrosschainReadinessPanel />
      </div>
    </DashboardShell>
  );
}

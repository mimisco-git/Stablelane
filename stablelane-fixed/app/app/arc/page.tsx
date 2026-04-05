import { DashboardShell } from "@/components/dashboard-shell";
import { ArcNativeFinancePanel } from "@/components/arc-native-finance-panel";
import { ArcAmountGuide } from "@/components/arc-amount-guide";
import { ArcFinalityPanel } from "@/components/arc-finality-panel";
import { ArcBalanceReader } from "@/components/arc-balance-reader";
import { FundingLaneManager } from "@/components/funding-lane-manager";
import { CrosschainReadinessPanel } from "@/components/crosschain-readiness-panel";
import { GatewayDepositWorkbench } from "@/components/gateway-deposit-workbench";
import { SettlementRoutePlanner } from "@/components/settlement-route-planner";
import { GatewayTransferPanel } from "@/components/gateway-transfer-panel";
import { EscrowTokenFundingPanel } from "@/components/escrow-token-funding-panel";
import { CrosschainExecutionDesk } from "@/components/crosschain-execution-desk";

export default function ArcPage() {
  return (
    <DashboardShell
      currentPath="/app/arc"
      title="Arc finance"
      description="Stablecoin assets, finality-aware confirmations, native Arc balance, and funding lanes for your workspace."
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
        <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
          <GatewayDepositWorkbench />
          <SettlementRoutePlanner />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
          <GatewayTransferPanel />
          <EscrowTokenFundingPanel />
        </div>
        <CrosschainExecutionDesk />
        <CrosschainReadinessPanel />
      </div>
    </DashboardShell>
  );
}

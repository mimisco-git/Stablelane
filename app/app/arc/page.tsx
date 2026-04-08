import { DashboardShell } from "@/components/dashboard-shell";
import { ArcBalanceReader } from "@/components/arc-balance-reader";
import { ContractPathPanel } from "@/components/contract-path-panel";

export default function ArcPage() {
  return (
    <DashboardShell
      currentPath="/app/arc"
      title="Arc"
      description="Your Arc testnet balance, deployed contracts, and network details."
      badge="Arc testnet"
    >
      <div className="grid gap-4">

        {/* Live USDC balance from connected wallet */}
        <ArcBalanceReader />

        {/* Deployed contracts */}
        <ContractPathPanel />

        {/* Network info */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Chain ID", value: "5042002", note: "Arc testnet" },
            { label: "RPC", value: "rpc.testnet.arc.network", note: "Public endpoint" },
            { label: "Gas token", value: "USDC", note: "6 decimals, ERC-20" },
          ].map((item) => (
            <div key={item.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{item.label}</div>
              <div className="mb-1 font-semibold text-[var(--text)]">{item.value}</div>
              <div className="text-[0.78rem] text-[var(--muted)]">{item.note}</div>
            </div>
          ))}
        </div>

        {/* Useful links */}
        <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Arc resources</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Arc Explorer", url: "https://testnet.arcscan.app", detail: "View transactions, contracts, and wallet activity" },
              { label: "Circle Faucet", url: "https://faucet.circle.com", detail: "Get testnet USDC and EURC for testing" },
              { label: "Arc Docs", url: "https://docs.arc.network", detail: "Developer documentation and contract addresses" },
              { label: "Arc Community", url: "https://arc.network/community", detail: "Discord, forum, and builder resources" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:border-white/12 hover:-translate-y-px"
              >
                <div className="mb-1 font-semibold text-[var(--accent)]">{item.label} ↗</div>
                <div className="text-[0.82rem] text-[var(--muted)]">{item.detail}</div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}

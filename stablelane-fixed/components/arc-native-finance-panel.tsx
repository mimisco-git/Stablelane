import Link from "next/link";
import { arcSettlementLanes, arcTestnetFinance } from "@/lib/arc-finance";
import { StatusPill } from "@/components/status-pill";

export function ArcNativeFinancePanel() {
  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.88),rgba(10,18,13,.82))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.26)]">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
              Arc-native finance layer
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,3vw,3rem)] leading-[0.98] tracking-[-0.04em] text-[var(--text)]">
              Stablelane is now shaped around Arc testnet financial rails.
            </h2>
            <p className="mt-3 max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
              This workspace layer keeps the product more relevant to Arc by using USDC-first fee language, finality-aware settlement cues, and a stablecoin registry built for invoice and escrow operations.
            </p>
          </div>
          <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.1em] text-[var(--accent)]">
            Testnet live · Mainnet coming soon
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Network</div>
            <div className="font-semibold">{arcTestnetFinance.networkName}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Chain ID</div>
            <div className="font-semibold">{arcTestnetFinance.chainId}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Gas token</div>
            <div className="font-semibold">{arcTestnetFinance.gasToken.symbol}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Finality</div>
            <div className="font-semibold">{arcTestnetFinance.finality.headline}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={arcTestnetFinance.explorerUrl} target="_blank" className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
            Open Arcscan
          </Link>
          <Link href={arcTestnetFinance.faucetUrl} target="_blank" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">
            Open Circle faucet
          </Link>
          <Link href="/app/escrows" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">
            Open escrow center
          </Link>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Stablecoin asset registry</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Use these values to make invoice math, settlement displays, and escrow amounts feel correct for Arc testnet.
            </p>
          </div>

          <div className="grid gap-3">
            {arcTestnetFinance.stablecoins.map((asset) => (
              <div key={asset.label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong>{asset.label}</strong>
                  <StatusPill label={`${asset.decimals} decimals`} tone="live" />
                </div>
                <div className="mb-1 text-[0.82rem] text-[var(--muted)]">{asset.symbol}</div>
                <div className="mb-2 break-all text-[0.82rem] font-semibold text-[var(--text)]">{asset.address}</div>
                <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{asset.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Operational rails</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              These are the settlement lanes Stablelane should grow into as the Arc integration becomes more complete.
            </p>
          </div>

          <div className="grid gap-3">
            {arcSettlementLanes.map((lane) => (
              <div key={lane.title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong>{lane.title}</strong>
                  <StatusPill label={lane.status} tone={lane.status === "Active now" ? "done" : lane.status === "Next build" ? "lock" : "neutral"} />
                </div>
                <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{lane.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4 text-[0.84rem] leading-6 text-[var(--accent)]">
            Stablelane should always surface gas and settlement amounts in <strong>USDC terms</strong> on Arc, not in a separate volatile fee token.
          </div>
        </section>
      </div>
    </div>
  );
}

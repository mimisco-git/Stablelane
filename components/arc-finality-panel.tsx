import { arcTestnetFinance } from "@/lib/arc-finance";
import { StatusPill } from "@/components/status-pill";

const confirmations = [
  {
    title: "Pending",
    detail: "Stablelane should only show pending while the transaction has not landed yet.",
  },
  {
    title: "Final",
    detail: "Once the transaction lands on Arc, the UI can show it as final instead of waiting for multiple confirmations.",
  },
  {
    title: "Settled",
    detail: "Escrow and payout actions can trigger downstream workspace state immediately after finality.",
  },
];

export function ArcFinalityPanel() {
  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Finality-aware confirmations</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Stablelane should behave like an Arc application and treat transaction confirmation as a clean finality event.
          </p>
        </div>
        <StatusPill label={arcTestnetFinance.finality.headline} tone="done" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {confirmations.map((item, index) => (
          <div key={item.title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[0.78rem] font-bold text-[var(--accent)]">
                {index + 1}
              </div>
              <strong>{item.title}</strong>
            </div>
            <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
        <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Fee discipline</div>
        <div className="font-semibold">{arcTestnetFinance.feePolicy.baseFeeFloor} testnet floor</div>
        <p className="mt-2 text-[0.82rem] leading-6 text-[var(--muted)]">
          {arcTestnetFinance.feePolicy.note}
        </p>
      </div>
    </section>
  );
}

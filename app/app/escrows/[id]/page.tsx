import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { escrowTimeline } from "@/lib/mock-data";

export default async function EscrowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardShell
      currentPath="/app/escrows"
      title="Escrow detail"
      description="This screen is now closer to the real contract-aware release flow, with funding state, timeline, and release actions grouped into one operator view."
      badge={id}
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_.95fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Funding state</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Contract address", "0x2b3...9c17"],
              ["Funded total", "$4,800 USDC"],
              ["Released total", "$1,600 USDC"],
              ["Pending release", "$1,600 USDC"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{label}</div>
                <div className="font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Timeline</div>
            <div className="grid gap-3">
              {escrowTimeline.map((item) => (
                <div key={`${item.event}-${item.time}`} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <strong>{item.event}</strong>
                    <StatusPill
                      label={item.time}
                      tone={item.tone === "done" ? "done" : item.tone === "live" ? "live" : "neutral"}
                    />
                  </div>
                  <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Release controls</h2>
          <div className="grid gap-3">
            <button className="rounded-full bg-[var(--accent)] px-4 py-3 text-left text-[0.92rem] font-bold text-[#08100b]">
              Trigger milestone release
            </button>
            <button className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Mark milestone ready
            </button>
            <button className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Request client approval
            </button>
            <Link href="/app/payouts" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Open payout routing
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Next contract actions</div>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Next we will wire this view to actual Arc testnet contract reads, release requests, and transaction state updates.
            </p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

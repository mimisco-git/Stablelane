import { DashboardShell } from "@/components/dashboard-shell";
import { payouts, payoutSplits } from "@/lib/mock-data";

export default function PayoutsPage() {
  return (
    <DashboardShell
      currentPath="/app/payouts"
      title="Payouts"
      description="This page is where payout templates, collaborator splits, and settlement outputs will live. The starter keeps the structure in place so you can connect real logic next."
      badge="Split router"
    >
      <div className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-3 text-base font-bold tracking-normal">Active payout template</h2>
          <div className="grid gap-3">
            {payoutSplits.map((split) => (
              <div key={split.member} className="grid gap-2 rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{split.member}</strong>
                  <span className="text-[0.92rem] font-extrabold">{split.amount}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/5">
                  <span
                    className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                    style={{ width: `${split.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-3 text-base font-bold tracking-normal">Recent payout records</h2>
          <div className="grid gap-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <strong>{payout.recipient}</strong>
                  <span className="font-semibold">{payout.amount}</span>
                </div>
                <div className="text-[0.84rem] text-[var(--muted)]">
                  {payout.settlement} · {payout.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

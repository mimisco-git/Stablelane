import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { payoutSplits, payoutTemplates, payouts } from "@/lib/mock-data";

export default function PayoutsPage() {
  return (
    <DashboardShell
      currentPath="/app/payouts"
      title="Payouts"
      description="This page now behaves more like the operating layer for payout templates and completed payout records."
      badge="Split router"
    >
      <div className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Active payout template</h2>
          <div className="grid gap-3">
            {payoutSplits.map((split) => (
              <div key={split.member} className="grid gap-2 rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong>{split.member}</strong>
                  <span className="text-[0.92rem] font-extrabold">{split.amount}</span>
                </div>
                <div className="text-[0.8rem] text-[var(--muted)]">{split.percent}% of settlement</div>
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
          <h2 className="mb-4 text-base font-bold tracking-normal">Recent payout records</h2>
          <div className="grid gap-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <strong>{payout.recipient}</strong>
                  <span className="font-semibold">{payout.amount}</span>
                </div>
                <div className="mb-2 text-[0.84rem] text-[var(--muted)]">
                  {payout.settlement} · Wallet {payout.wallet}
                </div>
                <StatusPill label={payout.status} tone="done" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-4 text-base font-bold tracking-normal">Reusable payout templates</h2>
        <div className="grid gap-3 xl:grid-cols-2">
          {payoutTemplates.map((template) => (
            <div key={template.name} className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 flex items-center justify-between gap-3">
                <strong>{template.name}</strong>
                <StatusPill label="Template" tone="live" />
              </div>
              <p className="mb-3 text-[0.84rem] leading-6 text-[var(--muted)]">{template.description}</p>
              <div className="grid gap-2">
                {template.members.map((member) => (
                  <div key={member.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[.02] px-3 py-2">
                    <span>{member.name}</span>
                    <span className="text-[0.84rem] font-semibold text-[var(--muted)]">{member.split}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { dashboardMetrics, payoutSplits, recentInvoices } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";

export default function AppOverviewPage() {
  return (
    <DashboardShell
      currentPath="/app"
      title="Overview"
      description="This is the first app shell for Stablelane. It is a static testnet starter that lets you begin pushing a real repo while we build invoice creation, escrow logic, and payout routing next."
      badge={`${siteConfig.appMode} · ${siteConfig.arc.gasToken} gas`}
    >
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <div key={metric.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
              <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
                {metric.label}
              </div>
              <strong className="mb-1 block font-[family-name:var(--font-cormorant)] text-[1.9rem] tracking-[-0.04em]">
                {metric.value}
              </strong>
              <p className="text-[0.8rem] leading-6 text-[var(--muted)]">{metric.note}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[20px] border border-white/8 bg-white/3 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-base font-bold tracking-normal">Recent invoices</h2>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                  Preview of the invoice list you will turn into real data next.
                </p>
              </div>
              <Link href="/app/invoices" className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                Open invoices
              </Link>
            </div>
            <div className="grid gap-2.5">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="grid items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 md:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <strong className="mb-1 block">{invoice.client}</strong>
                    <small className="text-[0.8rem] text-[var(--muted)]">
                      {invoice.title} · {invoice.stage}
                    </small>
                  </div>
                  <div className="text-[0.92rem] font-extrabold">{invoice.amount}</div>
                  <div className="rounded-full bg-[rgba(201,255,96,.11)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                    {invoice.status}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-white/8 bg-white/3 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-base font-bold tracking-normal">Payout routing</h2>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                  Preview of the payout split logic the smart-contract flow will later enforce.
                </p>
              </div>
              <Link href="/app/payouts" className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                Open payouts
              </Link>
            </div>
            <div className="grid gap-3">
              {payoutSplits.map((split) => (
                <div key={split.member} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{split.member} · {split.percent}%</strong>
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
        </div>
      </div>
    </DashboardShell>
  );
}

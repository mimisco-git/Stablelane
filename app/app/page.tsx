import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import {
  activityTimeline,
  payoutSplits,
  readinessChecklist,
  releaseQueue,
} from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";
import { OverviewDraftNotice } from "@/components/overview-draft-notice";
import { DashboardLiveStats } from "@/components/dashboard-live-stats";
import { DashboardMetricCards } from "@/components/dashboard-metric-cards";
import { RecentInvoicesLive } from "@/components/recent-invoices-live";
import { WalletConnectPanel } from "@/components/wallet-connect-panel";
import { LiveDashboardCards } from "@/components/live-dashboard-cards";

export default function AppOverviewPage() {
  return (
    <DashboardShell
      currentPath="/app"
      title="Overview"
      description="Stablelane is now laid out as a proper product preview. This overview screen should help you test the shape of the app before real invoice creation, escrow state syncing, and payout routing logic land."
      badge="Workspace overview"
    >
      <div className="grid gap-4">
        <OverviewDraftNotice />
        <DashboardLiveStats />
        <WalletConnectPanel />
        <DashboardMetricCards />
        <section className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.88),rgba(10,18,13,.82))] p-5 shadow-[0_18px_60px_rgba(0,0,0,.2)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                Arc finance layer
              </div>
              <h2 className="mb-2 text-base font-bold tracking-normal">Make Stablelane feel more native to Arc.</h2>
              <p className="max-w-3xl text-[0.84rem] leading-6 text-[var(--muted)]">
                Open the new Arc workspace section for stablecoin asset rules, finality-aware confirmations, native balance reading, and clearer testnet funding lanes.
              </p>
            </div>
            <Link href="/app/arc" className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
              Open Arc finance
            </Link>
          </div>
        </section>

        <div className="grid gap-3 xl:grid-cols-[1.05fr_.95fr]">
          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-base font-bold tracking-normal">Launch readiness</h2>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                  A quick view of what is already shaped and what still needs real implementation.
                </p>
              </div>
              <Link
                href="/app/settings"
                className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]"
              >
                Open settings
              </Link>
            </div>

            <div className="grid gap-3">
              {readinessChecklist.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <strong>{item.title}</strong>
                    <StatusPill label={item.done ? "Ready" : "Next"} tone={item.done ? "done" : "lock"} />
                  </div>
                  <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-base font-bold tracking-normal">Release queue</h2>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                  A preview of the milestone and settlement actions that should sit in front of the operator.
                </p>
              </div>
              <Link
                href="/app/escrows"
                className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]"
              >
                Open escrows
              </Link>
            </div>

            <div className="grid gap-3">
              {releaseQueue.map((item) => (
                <div key={`${item.invoice}-${item.milestone}`} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <strong>{item.invoice}</strong>
                    <span className="text-[0.84rem] font-semibold text-[var(--text)]">{item.amount}</span>
                  </div>
                  <div className="text-[0.84rem] leading-6 text-[var(--muted)]">
                    {item.milestone} · {item.state} · {item.due}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
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
              {/* live recent invoices */}
              <RecentInvoicesLive />
            </div>
          </section>

          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
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

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="mb-1 text-base font-bold tracking-normal">Activity timeline</h2>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                This is the kind of business event stream Stablelane should surface clearly in the final product.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {activityTimeline.map((item) => (
              <div key={`${item.title}-${item.time}`} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong>{item.title}</strong>
                  <StatusPill
                    label={item.time}
                    tone={item.tone === "done" ? "done" : item.tone === "live" ? "live" : item.tone === "lock" ? "lock" : "neutral"}
                  />
                </div>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.meta}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

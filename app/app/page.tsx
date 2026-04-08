import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { OverviewDraftNotice } from "@/components/overview-draft-notice";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { DashboardLiveStats } from "@/components/dashboard-live-stats";
import { DashboardMetricCards } from "@/components/dashboard-metric-cards";
import { RecentInvoicesLive } from "@/components/recent-invoices-live";
import { WalletConnectPanel } from "@/components/wallet-connect-panel";

export default function AppOverviewPage() {
  return (
    <DashboardShell
      currentPath="/app"
      title="Overview"
      description="Your revenue workspace. Track incoming payments, manage escrow releases, route payouts to collaborators, and monitor your growing revenue history."
      badge="Workspace overview"
    >
      <div className="grid gap-4">
        <OverviewDraftNotice />
        <OnboardingChecklist />
        <DashboardLiveStats />
        <WalletConnectPanel />
        <DashboardMetricCards />
        <section className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.88),rgba(10,18,13,.82))] p-5 shadow-[0_18px_60px_rgba(0,0,0,.2)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                Arc finance layer
              </div>
              <h2 className="mb-2 text-base font-bold tracking-normal">Stablecoin assets, finality, and funding lanes.</h2>
              <p className="max-w-3xl text-[0.84rem] leading-6 text-[var(--muted)]">
                Open the Arc workspace for stablecoin asset rules, finality-aware confirmations, native balance reading, funding lanes, operational activity feeds, and export-ready workspace workflows.
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
                <h2 className="mb-1 text-base font-bold tracking-normal">How it works</h2>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                  The four steps from invoice to settled revenue on Arc testnet.
                </p>
              </div>
              <Link href="/app/settings" className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                Open settings
              </Link>
            </div>
            <div className="grid gap-3">
              {[
                { title: "Create invoice", detail: "Add milestones, set amount, save to workspace.", done: true },
                { title: "Send payment link", detail: "Copy the /pay/ link and share it with your client.", done: true },
                { title: "Client funds escrow", detail: "Client connects wallet and locks USDC on Arc testnet.", done: true },
                { title: "Approve milestone", detail: "Review work and release each milestone on-chain.", done: true },
              ].map((item) => (
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
                  Milestone and settlement actions ready for your review.
                </p>
              </div>
              <Link href="/app/escrows" className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                Open escrows
              </Link>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 text-center">
              <p className="mb-3 text-[0.88rem] text-[var(--muted)]">Active escrow releases appear here. Open the escrows page to review and approve milestones.</p>
              <Link href="/app/escrows" className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.82rem] font-bold text-[#08100b]">
                Open escrows
              </Link>
            </div>
          </section>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-base font-bold tracking-normal">Recent invoices</h2>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                  Invoice state, funding status, and release readiness at a glance.
                </p>
              </div>
              <Link href="/app/invoices" className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                Open invoices
              </Link>
            </div>
            <div className="grid gap-2.5">
              <RecentInvoicesLive />
            </div>
          </section>

          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="mb-1 text-base font-bold tracking-normal">Payout routing</h2>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                  Current payout splits across your active collaborators.
                </p>
              </div>
              <Link href="/app/payouts" className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                Open payouts
              </Link>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5 text-center">
              <p className="mb-3 text-[0.88rem] text-[var(--muted)]">Payout splits from your saved invoices appear here. Configure splits when creating invoices.</p>
              <Link href="/app/payouts" className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.82rem] font-bold text-[#08100b]">
                Open payouts
              </Link>
            </div>
          </section>
        </div>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="mb-1 text-base font-bold tracking-normal">Activity timeline</h2>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                Recent business events across your workspace.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { title: "Invoice created", time: "Create", tone: "done", meta: "Create an invoice with milestones and USDC amount." },
              { title: "Payment link sent", time: "Send", tone: "done", meta: "Share the /pay/ link with your client." },
              { title: "Escrow funded", time: "Lock", tone: "live", meta: "Client connects wallet and locks USDC on Arc testnet." },
              { title: "Milestone released", time: "Settle", tone: "lock", meta: "Approve work and funds release on-chain instantly." },
            ].map((item) => (
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

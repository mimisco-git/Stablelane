import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { OverviewDraftNotice } from "@/components/overview-draft-notice";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { OverdueBanner } from "@/components/overdue-banner";
import { ArcBalanceWidget } from "@/components/arc-balance-widget";
import { DashboardLiveStats } from "@/components/dashboard-live-stats";
import { DashboardMetricCards } from "@/components/dashboard-metric-cards";
import { RecentInvoicesLive } from "@/components/recent-invoices-live";
import { WalletConnectPanel } from "@/components/wallet-connect-panel";
import { ReleaseQueue } from "@/components/release-queue";

export default function AppOverviewPage() {
  return (
    <DashboardShell
      currentPath="/app"
      title="Overview"
      description="Your revenue command center. Everything from invoice to settled USDC in one view."
      badge="Workspace overview"
    >
      <div className="grid gap-4">
        <OverviewDraftNotice />
        <OverdueBanner />
        <OnboardingChecklist />
        <DashboardLiveStats />
        <WalletConnectPanel />
        <DashboardMetricCards />
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-1 text-base font-bold tracking-normal">Quick actions</h2>
          <p className="mb-4 text-[0.82rem] text-[var(--muted)]">Jump to the tools you use most.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "New invoice", sub: "Create and send", href: "/app/invoices/new", accent: true },
              { label: "Treasury", sub: "Wallet balances", href: "/app/treasury", accent: false },
              { label: "Escrow Mini", sub: "Quick escrow", href: "/app/escrow-mini", accent: false },
              { label: "Revenue Passport", sub: "Your score", href: "/app/passport", accent: false },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`rounded-2xl border px-4 py-4 transition hover:-translate-y-px ${
                  action.accent
                    ? "border-[var(--line)] bg-[rgba(201,255,96,.08)] hover:bg-[rgba(201,255,96,.12)]"
                    : "border-white/8 bg-white/3 hover:bg-white/5"
                }`}
              >
                <div className={`text-[0.92rem] font-bold ${action.accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>{action.label}</div>
                <div className="text-[0.78rem] text-[var(--muted)]">{action.sub}</div>
              </Link>
            ))}
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
                { title: "Approve milestone on-chain", detail: "Review work, release funds on Arc. Settles in under 1 second.", done: true },
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

          <ReleaseQueue />
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

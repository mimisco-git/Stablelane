import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { invoiceMilestones } from "@/lib/mock-data";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Invoice detail"
      description="This page now behaves more like the real control room for one invoice, with summary, milestones, funding state, and release actions grouped clearly."
      badge={id}
    >
      <div className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Invoice summary</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Client", "Northstar Studio"],
              ["Total", "$4,800 USDC"],
              ["Mode", "Milestone escrow"],
              ["Status", "In escrow"],
              ["Due date", "Apr 30"],
              ["Contract", "0x2b3...9c17"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{label}</div>
                <div className="font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Client instructions</div>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              This invoice uses milestone escrow. The client should deposit the full amount first. Releases happen as milestones are approved.
            </p>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Actions</h2>
          <div className="grid gap-3">
            <button className="rounded-full bg-[var(--accent)] px-4 py-3 text-left text-[0.92rem] font-bold text-[#08100b]">
              Request milestone release
            </button>
            <button className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Mark milestone ready
            </button>
            <Link href="/app/escrows/esc_northstar" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Open escrow detail
            </Link>
            <Link href="/app/payouts" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Open payout routing
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-normal">Milestone structure</h2>
          <StatusPill label="3 milestones" tone="live" />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {invoiceMilestones.map((milestone) => (
            <div key={milestone.title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <strong>{milestone.title}</strong>
                <span className="font-semibold">{milestone.amount}</span>
              </div>
              <p className="mb-3 text-[0.84rem] leading-6 text-[var(--muted)]">{milestone.detail}</p>
              <StatusPill
                label={milestone.status}
                tone={
                  milestone.status === "Released"
                    ? "done"
                    : milestone.status === "Ready for approval"
                      ? "live"
                      : "lock"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

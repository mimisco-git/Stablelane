import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";

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
      description="This page is where invoice metadata, milestone structure, escrow funding state, and client actions will live."
      badge={id}
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-2 text-base font-bold tracking-normal">Invoice summary</h2>
          <div className="grid gap-3 text-[0.92rem] text-[var(--muted)]">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Client: Northstar Studio
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Total: $4,800 USDC
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Payment mode: Milestone escrow
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Status: In escrow
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-2 text-base font-bold tracking-normal">Milestone structure</h2>
          <div className="grid gap-3">
            {[
              ["Milestone 1", "$1,600", "Released"],
              ["Milestone 2", "$1,600", "Ready for approval"],
              ["Milestone 3", "$1,600", "Locked"],
            ].map(([title, amount, status]) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <strong>{title}</strong>
                  <span className="font-semibold">{amount}</span>
                </div>
                <div className="text-[0.84rem] text-[var(--muted)]">{status}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
              Request release
            </button>
            <Link href="/app/escrows/esc_northstar" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">
              Open escrow detail
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

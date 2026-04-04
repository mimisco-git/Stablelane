import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { invoicesTable } from "@/lib/mock-data";

export default function InvoicesPage() {
  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Invoices"
      description="This is the initial invoices list. It is static for now, but the screen structure is ready for real invoice creation, filtering, and status transitions."
      badge="USDC + EURC"
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.84rem] text-[var(--muted)]">
            Statuses: Draft · Sent · Funded · In escrow · Partially released · Completed
          </div>
          <button className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
            Create invoice
          </button>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-white/8 bg-white/3">
          <div className="grid grid-cols-[1.4fr_.6fr_.5fr_.6fr_.5fr] gap-3 border-b border-white/8 px-4 py-3 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
            <div>Invoice</div>
            <div>Currency</div>
            <div>Total</div>
            <div>Status</div>
            <div>Due</div>
          </div>
          {invoicesTable.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/app/invoices/${invoice.id}`}
              className="grid grid-cols-[1.4fr_.6fr_.5fr_.6fr_.5fr] gap-3 border-b border-white/8 px-4 py-4 last:border-b-0 hover:bg-white/3"
            >
              <div className="font-semibold">{invoice.title}</div>
              <div className="text-[var(--muted)]">{invoice.currency}</div>
              <div className="font-semibold">{invoice.total}</div>
              <div className="text-[var(--accent)]">{invoice.status}</div>
              <div className="text-[var(--muted)]">{invoice.dueDate}</div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

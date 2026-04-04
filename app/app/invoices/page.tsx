import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { invoiceSummaryCards, invoicesTable } from "@/lib/mock-data";

export default function InvoicesPage() {
  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Invoices"
      description="The invoices area is now shaped as a proper operating screen, with summary cards, filters, and a clear path into invoice detail and invoice creation."
      badge="USDC + EURC"
    >
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {invoiceSummaryCards.map((card) => (
            <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
              <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
                {card.label}
              </div>
              <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">
                {card.value}
              </strong>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["All", "Draft", "Sent", "In escrow", "Completed"].map((filter) => (
              <div key={filter} className={`rounded-full px-4 py-2 text-[0.84rem] ${filter === "All" ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]" : "border border-white/8 bg-white/3 text-[var(--muted)]"}`}>
                {filter}
              </div>
            ))}
          </div>

          <Link href="/app/invoices/new" className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
            Create invoice
          </Link>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-white/8 bg-white/3">
          <div className="grid gap-3 border-b border-white/8 px-4 py-3 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)] md:grid-cols-[1.45fr_.55fr_.55fr_.7fr_.6fr_.65fr]">
            <div>Invoice</div>
            <div>Currency</div>
            <div>Total</div>
            <div>Mode</div>
            <div>Status</div>
            <div>Due</div>
          </div>
          {invoicesTable.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/app/invoices/${invoice.id}`}
              className="grid gap-3 border-b border-white/8 px-4 py-4 last:border-b-0 hover:bg-white/3 md:grid-cols-[1.45fr_.55fr_.55fr_.7fr_.6fr_.65fr]"
            >
              <div>
                <div className="font-semibold">{invoice.title}</div>
                <div className="text-[0.8rem] text-[var(--muted)]">Funded: {invoice.funded}</div>
              </div>
              <div className="text-[var(--muted)]">{invoice.currency}</div>
              <div className="font-semibold">{invoice.total}</div>
              <div className="text-[var(--muted)]">{invoice.paymentMode}</div>
              <div>
                <StatusPill
                  label={invoice.status}
                  tone={
                    invoice.status === "Draft"
                      ? "neutral"
                      : invoice.status === "Sent"
                        ? "lock"
                        : invoice.status === "In escrow"
                          ? "live"
                          : "done"
                  }
                />
              </div>
              <div className="text-[var(--muted)]">{invoice.dueDate}</div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

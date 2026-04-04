import { DashboardShell } from "@/components/dashboard-shell";

export default function NewInvoicePage() {
  return (
    <DashboardShell
      currentPath="/app/invoices"
      title="Create invoice"
      description="This is the first structured invoice-creation screen. It is still static, but it already maps the fields and decisions the real flow needs."
      badge="Form preview"
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Invoice details</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Invoice title",
              "Client name",
              "Client email",
              "Total amount",
              "Due date",
              "Reference",
            ].map((field) => (
              <label key={field} className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
                <span>{field}</span>
                <input
                  placeholder={field}
                  className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
              <span>Currency</span>
              <select className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]">
                <option>USDC</option>
                <option>EURC</option>
              </select>
            </label>

            <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
              <span>Payment mode</span>
              <select className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]">
                <option>Milestone escrow</option>
                <option>Direct payment</option>
              </select>
            </label>
          </div>

          <label className="mt-4 grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Description</span>
            <textarea
              rows={5}
              placeholder="Outline scope, delivery terms, and payment expectations."
              className="rounded-[20px] border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
            />
          </label>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Milestones and payout template</h2>
          <div className="grid gap-3">
            {[
              ["Milestone 1", "$1,600", "Discovery and strategy"],
              ["Milestone 2", "$1,600", "Design and review"],
              ["Milestone 3", "$1,600", "Final handoff"],
            ].map(([title, amount, detail]) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <strong>{title}</strong>
                  <span className="font-semibold">{amount}</span>
                </div>
                <div className="text-[0.84rem] text-[var(--muted)]">{detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Payout template</div>
            <div className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Core studio split · Designer 60% · Developer 30% · PM 10%
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
              Save draft
            </button>
            <button className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">
              Preview invoice
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

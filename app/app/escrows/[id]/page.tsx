import { DashboardShell } from "@/components/dashboard-shell";

export default async function EscrowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <DashboardShell
      currentPath="/app/escrows"
      title="Escrow detail"
      description="This screen is where the contract-aware release flow will live. For now it shows the structure you can wire to real contract data next."
      badge={id}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_.9fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-3 text-base font-bold tracking-normal">Funding state</h2>
          <div className="grid gap-3">
            {[
              "Contract address placeholder",
              "Client funded total escrow",
              "Milestone release states",
              "Release request and approval events",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.9rem] text-[var(--muted)]">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-3 text-base font-bold tracking-normal">Actions</h2>
          <div className="grid gap-3">
            <button className="rounded-full bg-[var(--accent)] px-4 py-3 text-left text-[0.92rem] font-bold text-[#08100b]">
              Trigger milestone release
            </button>
            <button className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Mark milestone ready
            </button>
            <button className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Open payout routing
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

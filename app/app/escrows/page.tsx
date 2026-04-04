import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { escrows } from "@/lib/mock-data";

export default function EscrowsPage() {
  return (
    <DashboardShell
      currentPath="/app/escrows"
      title="Escrows"
      description="Escrow state is where Stablelane proves trust. This view now behaves more like a real funding and release control center."
      badge="Milestone escrow"
    >
      <div className="grid gap-3">
        {escrows.map((escrow) => (
          <Link
            key={escrow.id}
            href={`/app/escrows/${escrow.id}`}
            className="grid gap-3 rounded-[22px] border border-white/8 bg-white/3 p-5 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
          >
            <div>
              <div className="mb-1 font-semibold">{escrow.title}</div>
              <div className="text-[0.84rem] text-[var(--muted)]">
                {escrow.milestones} · {escrow.nextAction}
              </div>
            </div>
            <div className="text-[0.84rem] text-[var(--muted)]">
              Funded <strong className="ml-1 text-[var(--text)]">{escrow.funded}</strong>
            </div>
            <div className="text-[0.84rem] text-[var(--muted)]">
              Released <strong className="ml-1 text-[var(--text)]">{escrow.released}</strong>
            </div>
            <div>
              <StatusPill label={escrow.status} tone={escrow.status === "Active" ? "live" : "done"} />
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}

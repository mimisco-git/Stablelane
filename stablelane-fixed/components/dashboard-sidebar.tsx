import Link from "next/link";
import { dashboardNav } from "@/lib/site";

type DashboardSidebarProps = {
  currentPath: string;
};

export function DashboardSidebar({ currentPath }: DashboardSidebarProps) {
  return (
    <aside className="rounded-[22px] border border-white/8 bg-white/3 p-4">
      <div className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.11em] text-[var(--muted-2)]">
        Workspace
      </div>

      <Link
        href="/app/invoices/new"
        className="mb-4 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] transition hover:-translate-y-px"
      >
        Create invoice
      </Link>

      <div className="grid gap-2.5">
        {dashboardNav.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-2xl px-4 py-3 text-[0.92rem] font-semibold transition",
                isActive
                  ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--text)]"
                  : "text-[var(--muted)] hover:bg-white/4 hover:text-[var(--text)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.06)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.11em] text-[var(--accent)]">
            Arc testnet
          </div>
        </div>
        <p className="text-[0.82rem] leading-6 text-[var(--muted)]">
          Running on Arc testnet. All transactions are simulation-only until mainnet launch.
        </p>
      </div>
    </aside>
  );
}

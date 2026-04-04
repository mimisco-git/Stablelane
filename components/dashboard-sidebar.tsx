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
    </aside>
  );
}

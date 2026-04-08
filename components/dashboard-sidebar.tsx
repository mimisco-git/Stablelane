import Link from "next/link";

type DashboardSidebarProps = {
  currentPath: string;
};

const coreNav = [
  { href: "/app", label: "Overview" },
  { href: "/app/invoices", label: "Invoices" },
  { href: "/app/escrows", label: "Escrows" },
  { href: "/app/payouts", label: "Payouts" },
  { href: "/app/clients", label: "Clients" },
];

const revenueNav = [
  { href: "/app/ledger", label: "Ledger" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/arc", label: "Arc" },
];

const workspaceNav = [
  { href: "/app/settings", label: "Settings" },
  { href: "/app/account", label: "Account" },
];

function NavGroup({
  label,
  items,
  currentPath,
}: {
  label: string;
  items: { href: string; label: string }[];
  currentPath: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 px-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-2)]">
        {label}
      </div>
      <div className="grid gap-1">
        {items.map((item) => {
          const isActive =
            item.href === "/app"
              ? currentPath === "/app"
              : currentPath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-xl px-3 py-2.5 text-[0.9rem] font-semibold transition",
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
    </div>
  );
}

export function DashboardSidebar({ currentPath }: DashboardSidebarProps) {
  return (
    <aside className="rounded-[22px] border border-white/8 bg-white/3 p-4">
      {/* Logo / Home */}
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/4">
          <span className="font-[family-name:var(--font-cormorant)] text-[1.2rem] font-semibold tracking-[-0.03em] text-[var(--text)]">
            Stablelane<span className="text-[var(--accent)]">.</span>
          </span>
        </Link>
        <Link href="/" className="rounded-lg border border-white/8 bg-white/3 p-1.5 text-[var(--muted)] transition hover:text-[var(--text)]" title="Back to home">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5L1.5 7l5.5 5.5M1.5 7H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      <Link
        href="/app/invoices/new"
        className="mb-5 inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.9rem] font-bold text-[#08100b] transition hover:-translate-y-px"
      >
        + New invoice
      </Link>

      <NavGroup label="Workspace" items={coreNav} currentPath={currentPath} />
      <NavGroup label="Revenue" items={revenueNav} currentPath={currentPath} />
      <NavGroup label="Account" items={workspaceNav} currentPath={currentPath} />

      <div className="mt-4 rounded-xl border border-[var(--line)] bg-[rgba(201,255,96,.06)] p-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <div className="text-[0.68rem] font-bold uppercase tracking-[0.11em] text-[var(--accent)]">
            Arc testnet
          </div>
        </div>
        <p className="text-[0.78rem] leading-5 text-[var(--muted)]">
          Live on Arc. Transactions settle in under one second.
        </p>
      </div>
    </aside>
  );
}

import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { AuthBanner } from "@/components/auth-banner";
import { EnvironmentBadge } from "@/components/environment-badge";
import { AccessModeBanner } from "@/components/access-mode-banner";

type DashboardShellProps = {
  currentPath: string;
  title: string;
  description: string;
  children: ReactNode;
  badge?: string;
};

export function DashboardShell({
  currentPath,
  title,
  description,
  children,
  badge = "Arc testnet",
}: DashboardShellProps) {
  return (
    <section className="mx-auto w-[min(calc(100%-36px),1280px)] py-10">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <DashboardSidebar currentPath={currentPath} />
        <div className="grid gap-4">
          <AuthBanner />
          <AccessModeBanner />
          <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
                  {title}
                </h1>
                <p className="max-w-3xl text-[0.96rem] leading-7 text-[var(--muted)]">
                  {description}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <EnvironmentBadge />
                <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                  {badge}
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

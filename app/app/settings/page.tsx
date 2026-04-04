import { DashboardShell } from "@/components/dashboard-shell";
import { siteConfig } from "@/lib/site";

export default function SettingsPage() {
  return (
    <DashboardShell
      currentPath="/app/settings"
      title="Settings"
      description="This page is where workspace details, wallet settings, payout templates, and environment configuration will live."
      badge="Workspace config"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-3 text-base font-bold tracking-normal">Workspace defaults</h2>
          <div className="grid gap-3 text-[0.9rem] text-[var(--muted)]">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Default currencies: USDC, EURC
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Environment: {siteConfig.appMode}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Waitlist email for testing: {siteConfig.waitlistEmail}
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-3 text-base font-bold tracking-normal">Arc configuration</h2>
          <div className="grid gap-3 text-[0.9rem] text-[var(--muted)]">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              RPC: {siteConfig.arc.rpcUrl}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Chain ID: {siteConfig.arc.chainId}
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              Explorer: {siteConfig.arc.explorerUrl}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

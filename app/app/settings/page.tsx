import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceSettingsForm } from "@/components/workspace-settings-form";
import { EnvironmentSwitcher } from "@/components/environment-switcher";
import { siteConfig } from "@/lib/site";

export default function SettingsPage() {
  return (
    <DashboardShell
      currentPath="/app/settings"
      title="Settings"
      description="Settings now save real workspace preferences to Supabase so Stablelane can stop feeling like a demo and start behaving like a real app."
      badge="Workspace config"
    >
      <div className="grid gap-4">
        <EnvironmentSwitcher />

        <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-2 text-base font-bold tracking-normal">Workspace controls</div>
          <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">
            Open the new preferences page for database-backed notification settings and the audit page for saved operational events.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/app/preferences" className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">Open preferences</a>
            <a href="/app/audit" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">Open audit trail</a>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Workspace defaults</h2>
          <WorkspaceSettingsForm />
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Arc and Supabase config</h2>
          <div className="grid gap-3">
            {[
              ["RPC", siteConfig.arc.rpcUrl],
              ["Chain ID", String(siteConfig.arc.chainId)],
              ["Explorer", siteConfig.arc.explorerUrl],
              ["Gas token", siteConfig.arc.gasToken],
              ["Waitlist email", siteConfig.waitlistEmail],
              ["App mode", siteConfig.appMode],
              ["Testnet escrow factory", process.env.NEXT_PUBLIC_TESTNET_ESCROW_FACTORY_ADDRESS || "Not configured"],
              ["Mainnet escrow factory", process.env.NEXT_PUBLIC_MAINNET_ESCROW_FACTORY_ADDRESS || "Not configured"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{label}</div>
                <div className="font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </section>
        </div>
      </div>
    </DashboardShell>
  );
}

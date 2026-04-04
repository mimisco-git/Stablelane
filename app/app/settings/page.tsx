import { DashboardShell } from "@/components/dashboard-shell";
import { settingsCards } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site";

export default function SettingsPage() {
  return (
    <DashboardShell
      currentPath="/app/settings"
      title="Settings"
      description="Settings now look like a real configuration area for workspace defaults, network configuration, and payout behavior."
      badge="Workspace config"
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Workspace defaults</h2>
          <div className="grid gap-3">
            {settingsCards.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{item.title}</div>
                <div className="font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Arc configuration</h2>
          <div className="grid gap-3">
            {[
              ["RPC", siteConfig.arc.rpcUrl],
              ["Chain ID", String(siteConfig.arc.chainId)],
              ["Explorer", siteConfig.arc.explorerUrl],
              ["Gas token", siteConfig.arc.gasToken],
              ["Waitlist email", siteConfig.waitlistEmail],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{label}</div>
                <div className="font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

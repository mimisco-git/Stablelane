import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceSettingsForm } from "@/components/workspace-settings-form";
import { ContractPathPanel } from "@/components/contract-path-panel";

export default function SettingsPage() {
  return (
    <DashboardShell
      currentPath="/app/settings"
      title="Settings"
      description="Configure your workspace, wallet address, and notification preferences."
      badge="Settings"
    >
      <div className="grid gap-4">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Workspace</h2>
          <WorkspaceSettingsForm />
        </section>

        <ContractPathPanel />
      </div>
    </DashboardShell>
  );
}

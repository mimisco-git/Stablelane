import { DashboardShell } from "@/components/dashboard-shell";
import { AccountMethodsPanel } from "@/components/account-methods-panel";

export default function AccountPage() {
  return (
    <DashboardShell
      currentPath="/app/account"
      title="Account"
      description="Inspect current email session, wallet state, verified wallet access, and enabled providers."
      badge="Account methods"
    >
      <AccountMethodsPanel />
    </DashboardShell>
  );
}

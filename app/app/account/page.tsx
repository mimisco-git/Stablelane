import { DashboardShell } from "@/components/dashboard-shell";
import { AccountMethodsPanel } from "@/components/account-methods-panel";

export default function AccountPage() {
  return (
    <DashboardShell
      currentPath="/app/account"
      title="Account"
      description="Inspect active email session, browser-linked wallet access, and which providers are truly enabled."
      badge="Account methods"
    >
      <AccountMethodsPanel />
    </DashboardShell>
  );
}

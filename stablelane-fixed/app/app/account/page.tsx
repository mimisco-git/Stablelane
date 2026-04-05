import { DashboardShell } from "@/components/dashboard-shell";
import { AccountMethodsPanel } from "@/components/account-methods-panel";

export default function AccountPage() {
  return (
    <DashboardShell
      currentPath="/app/account"
      title="Account"
      description="Manage your account session, connected wallet, and authentication methods."
      badge="Account"
    >
      <AccountMethodsPanel />
    </DashboardShell>
  );
}

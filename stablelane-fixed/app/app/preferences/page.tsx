import { DashboardShell } from "@/components/dashboard-shell";
import { NotificationPreferencesForm } from "@/components/notification-preferences-form";

export default function PreferencesPage() {
  return (
    <DashboardShell
      currentPath="/app/preferences"
      title="Preferences"
      description="Set your notification preferences for approvals, payments, and workspace events."
      badge="Preferences"
    >
      <NotificationPreferencesForm />
    </DashboardShell>
  );
}

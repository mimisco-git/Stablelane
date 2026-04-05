import { DashboardShell } from "@/components/dashboard-shell";
import { NotificationPreferencesForm } from "@/components/notification-preferences-form";

export default function PreferencesPage() {
  return (
    <DashboardShell
      currentPath="/app/preferences"
      title="Preferences"
      description="Database-backed notification and alert preferences for the workspace."
      badge="Preferences"
    >
      <NotificationPreferencesForm />
    </DashboardShell>
  );
}

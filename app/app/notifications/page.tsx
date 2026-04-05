import { DashboardShell } from "@/components/dashboard-shell";
import { NotificationsCenter } from "@/components/notifications-center";

export default function NotificationsPage() {
  return (
    <DashboardShell
      currentPath="/app/notifications"
      title="Notifications"
      description="A cleaner notification center for approvals, invitations, and operational signals across the workspace."
      badge="Alerts"
    >
      <NotificationsCenter />
    </DashboardShell>
  );
}

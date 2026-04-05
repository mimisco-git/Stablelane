import { DashboardShell } from "@/components/dashboard-shell";
import { NotificationsCenter } from "@/components/notifications-center";

export default function NotificationsPage() {
  return (
    <DashboardShell
      currentPath="/app/notifications"
      title="Notifications"
      description="Manage approval notifications, invitation alerts, and operational signals for your workspace."
      badge="Notifications"
    >
      <NotificationsCenter />
    </DashboardShell>
  );
}

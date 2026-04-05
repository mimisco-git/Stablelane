import { DashboardShell } from "@/components/dashboard-shell";
import { ActivityFeedPanel } from "@/components/activity-feed-panel";

export default function ActivityPage() {
  return (
    <DashboardShell
      currentPath="/app/activity"
      title="Activity"
      description="Stablelane now keeps a live operational feed for Arc-focused funding, settlement, and execution actions."
      badge="Operational feed"
    >
      <ActivityFeedPanel />
    </DashboardShell>
  );
}

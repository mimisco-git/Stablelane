import { DashboardShell } from "@/components/dashboard-shell";
import { ActivityFeedPanel } from "@/components/activity-feed-panel";

export default function ActivityPage() {
  return (
    <DashboardShell
      currentPath="/app/activity"
      title="Activity"
      description="Live operational feed for funding, settlement, and execution events across your workspace."
      badge="Activity"
    >
      <ActivityFeedPanel />
    </DashboardShell>
  );
}

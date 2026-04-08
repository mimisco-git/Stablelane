import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceAnalytics } from "@/components/workspace-analytics";
import { PaymentAnalytics } from "@/components/payment-analytics";

export default function AnalyticsPage() {
  return (
    <DashboardShell
      currentPath="/app/analytics"
      title="Analytics"
      description="Revenue signals, client performance, payment timing, and conversion metrics from your real invoice history."
      badge="Analytics"
    >
      <div className="grid gap-6">
        <PaymentAnalytics />
        <WorkspaceAnalytics />
      </div>
    </DashboardShell>
  );
}

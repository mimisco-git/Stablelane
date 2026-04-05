import { DashboardShell } from "@/components/dashboard-shell";
import { ProductionReadinessCenter } from "@/components/production-readiness-center";

export default function ReadinessPage() {
  return (
    <DashboardShell
      currentPath="/app/readiness"
      title="Readiness"
      description="A practical launch-readiness view for identity, provider, preview, and notification configuration."
      badge="Production"
    >
      <ProductionReadinessCenter />
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";
import { ProductionReadinessCenter } from "@/components/production-readiness-center";

export default function ReadinessPage() {
  return (
    <DashboardShell
      currentPath="/app/readiness"
      title="Readiness"
      description="Identity, provider, and notification configuration for launch readiness."
      badge="Readiness"
    >
      <ProductionReadinessCenter />
    </DashboardShell>
  );
}

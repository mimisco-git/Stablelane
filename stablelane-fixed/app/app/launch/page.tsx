import { DashboardShell } from "@/components/dashboard-shell";
import { LaunchHardeningCenter } from "@/components/launch-hardening-center";

export default function LaunchPage() {
  return (
    <DashboardShell
      currentPath="/app/launch"
      title="Launch"
      description="Pre-launch checklist and environment hardening actions before your workspace goes live."
      badge="Launch"
    >
      <LaunchHardeningCenter />
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/dashboard-shell";
import { LaunchHardeningCenter } from "@/components/launch-hardening-center";

export default function LaunchPage() {
  return (
    <DashboardShell
      currentPath="/app/launch"
      title="Launch"
      description="A final launch-hardening view for the blockers and cleanup actions that matter most before go-live."
      badge="Go-live"
    >
      <LaunchHardeningCenter />
    </DashboardShell>
  );
}

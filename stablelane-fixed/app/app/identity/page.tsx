import { DashboardShell } from "@/components/dashboard-shell";
import { IdentityLinkingCenter } from "@/components/identity-linking-center";

export default function IdentityPage() {
  return (
    <DashboardShell
      currentPath="/app/identity"
      title="Identity"
      description="Link your email session and wallet to your workspace profile and manage verified credentials."
      badge="Identity"
    >
      <IdentityLinkingCenter />
    </DashboardShell>
  );
}

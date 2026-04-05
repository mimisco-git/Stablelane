import { DashboardShell } from "@/components/dashboard-shell";
import { IdentityLinkingCenter } from "@/components/identity-linking-center";

export default function IdentityPage() {
  return (
    <DashboardShell
      currentPath="/app/identity"
      title="Identity"
      description="A more realistic identity center for linking the email session and wallet hint into the workspace profile."
      badge="Identity center"
    >
      <IdentityLinkingCenter />
    </DashboardShell>
  );
}

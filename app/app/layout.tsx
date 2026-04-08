import { WorkspaceAuthGate } from "@/components/workspace-auth-gate";
import { AppHeader } from "@/components/app-header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WorkspaceAuthGate>
      <AppHeader />
      {children}
    </WorkspaceAuthGate>
  );
}

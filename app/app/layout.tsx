import { WorkspaceAuthGate } from "@/components/workspace-auth-gate";
import { AppHeader } from "@/components/app-header";
import { MobileFAB } from "@/components/mobile-fab";
import { ToastProvider } from "@/components/toast";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WorkspaceAuthGate>
      <AppHeader />
      {children}
      <MobileFAB />
      <ToastProvider />
    </WorkspaceAuthGate>
  );
}

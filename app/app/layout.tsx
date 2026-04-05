import { WorkspaceAuthGate } from "@/components/workspace-auth-gate";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <WorkspaceAuthGate>{children}</WorkspaceAuthGate>;
}

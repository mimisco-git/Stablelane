import { DashboardShell } from "@/components/dashboard-shell";
import { ClientsManager } from "@/components/clients-manager";

export default function ClientsPage() {
  return (
    <DashboardShell
      currentPath="/app/clients"
      title="Clients"
      description="This stage adds a real client record layer to Stablelane so invoices and workspace activity can start sitting on proper business entities instead of only mock data."
      badge="Supabase clients"
    >
      <ClientsManager />
    </DashboardShell>
  );
}

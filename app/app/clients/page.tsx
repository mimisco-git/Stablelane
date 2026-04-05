import { DashboardShell } from "@/components/dashboard-shell";
import { ClientsManager } from "@/components/clients-manager";

export default function ClientsPage() {
  return (
    <DashboardShell
      currentPath="/app/clients"
      title="Clients"
      description="Manage client records and link them to invoices, escrows, and payment history."
      badge="Clients"
    >
      <ClientsManager />
    </DashboardShell>
  );
}

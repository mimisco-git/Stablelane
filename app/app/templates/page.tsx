import { DashboardShell } from "@/components/dashboard-shell";
import { InvoiceTemplates } from "@/components/invoice-templates";

export default function TemplatesPage() {
  return (
    <DashboardShell
      currentPath="/app/templates"
      title="Templates"
      description="Save and reuse invoice structures. Load a template into any new invoice with one click."
      badge="Templates"
    >
      <InvoiceTemplates />
    </DashboardShell>
  );
}

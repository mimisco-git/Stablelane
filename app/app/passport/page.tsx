import { DashboardShell } from "@/components/dashboard-shell";
import { RevenuePassport } from "@/components/revenue-passport";

export default function PassportPage() {
  return (
    <DashboardShell
      currentPath="/app/passport"
      title="Revenue Passport"
      description="Your verifiable on-chain revenue record. Share it with clients and partners as proof of work and payment history."
      badge="Arc testnet"
    >
      <RevenuePassport />
    </DashboardShell>
  );
}

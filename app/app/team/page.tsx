import { DashboardShell } from "@/components/dashboard-shell";
import { TeamRolesManager } from "@/components/team-roles-manager";

export default function TeamPage() {
  return (
    <DashboardShell
      currentPath="/app/team"
      title="Team"
      description="Manage team roles, member permissions, and collaborator access across your workspace."
      badge="Team"
    >
      <div className="grid gap-4">
        <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-2 text-base font-bold tracking-normal">Invite before adding</div>
          <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">
            Use the invitation flow when you want a cleaner onboarding step before someone becomes a permanent workspace member.
          </p>
          <a href="/app/invitations" className="inline-flex rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
            Open invitations
          </a>
        </div>
        <TeamRolesManager />
      </div>
    </DashboardShell>
  );
}

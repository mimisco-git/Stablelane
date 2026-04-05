"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readActivityFeed, type ActivityItem } from "@/lib/activity-feed";
import { arcFundingReadiness } from "@/lib/arc-funding";
import { getEscrowContractConfig } from "@/lib/contracts";
import { fetchApprovalOverview, fetchDashboardStatsDetailed, fetchWorkspaceMembers } from "@/lib/supabase-data";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { EmptyState, InlineNotice, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type DashboardStats = {
  workspaceName: string;
  defaultCurrency: string;
  roleType: string;
  clientCount: number;
  draftCount: number;
  totalDraftValue: number;
};

type ApprovalOverview = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  recent: Array<{
    id: string;
    invoice_id: string;
    approver_email: string;
    approver_role: string;
    status: "Pending" | "Approved" | "Rejected";
    created_at: string;
  }>;
};

export function OpsCommandCenter() {
  const { environment, network } = useAppEnvironment();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [approvals, setApprovals] = useState<ApprovalOverview | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const contracts = useMemo(() => getEscrowContractConfig(environment), [environment]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [statsData, approvalData, members] = await Promise.all([
          fetchDashboardStatsDetailed(),
          fetchApprovalOverview(),
          fetchWorkspaceMembers(),
        ]);

        if (!mounted) return;
        setStats((statsData || null) as DashboardStats | null);
        setApprovals((approvalData || null) as ApprovalOverview | null);
        setTeamCount(Array.isArray(members) ? members.length : 0);
        setActivity(readActivityFeed());
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const readinessChecks = useMemo(() => {
    return [
      {
        label: "Workspace team",
        ready: teamCount > 0,
        detail: teamCount > 0 ? `${teamCount} workspace member${teamCount === 1 ? "" : "s"} configured.` : "No workspace members configured yet.",
      },
      {
        label: "Escrow contract path",
        ready: contracts.ready,
        detail: contracts.ready ? "Factory, implementation, and release module are configured." : "Escrow contract addresses are still incomplete.",
      },
      {
        label: "Gateway lane",
        ready: arcFundingReadiness.gatewayReady,
        detail: arcFundingReadiness.gatewayReady ? "Gateway and GatewayMinter are configured." : "Gateway funding still needs environment values.",
      },
      {
        label: "Approval flow",
        ready: Boolean(approvals && approvals.total > 0),
        detail: approvals && approvals.total > 0 ? `${approvals.total} approval request${approvals.total === 1 ? "" : "s"} recorded.` : "No release approvals exist yet.",
      },
      {
        label: "Operational activity",
        ready: activity.length > 0,
        detail: activity.length ? `${activity.length} recent activity item${activity.length === 1 ? "" : "s"} saved.` : "No live activity recorded yet.",
      },
    ];
  }, [teamCount, contracts.ready, approvals, activity]);

  const readinessScore = useMemo(() => {
    const readyCount = readinessChecks.filter((item) => item.ready).length;
    return Math.round((readyCount / readinessChecks.length) * 100);
  }, [readinessChecks]);

  const blockers = readinessChecks.filter((item) => !item.ready);
  const recentSignals = activity.slice(0, 6);

  if (loading) {
    return <LoadingState title="Loading operations console" detail="Stablelane is collecting workspace, approval, and Arc operational data." />;
  }

  if (!stats && !approvals && !activity.length) {
    return (
      <EmptyState
        title="No operational data yet"
        detail="Create invoices, add team members, run approval flows, or send Gateway and escrow actions to make the operations console come alive."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.88))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
              Operations console
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,3vw,3rem)] leading-[0.98] tracking-[-0.04em] text-[var(--text)]">
              Command center for Arc testnet operations, settlement readiness, and workspace health.
            </h2>
            <p className="mt-3 max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
              This page surfaces operational readiness, blockers, approval pressure, and recent settlement activity so the product feels closer to a real finance and operations workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={`${readinessScore}% ready`} tone={readinessScore >= 80 ? "done" : readinessScore >= 50 ? "live" : "lock"} />
            <StatusPill label={network.label} tone={environment === "testnet" ? "done" : "lock"} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Workspace value", value: `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(stats?.totalDraftValue || 0)} ${stats?.defaultCurrency || "USDC"}` },
            { label: "Clients", value: String(stats?.clientCount || 0) },
            { label: "Pending approvals", value: String(approvals?.pending || 0) },
            { label: "Activity items", value: String(activity.length) },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
              <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="mb-1 text-base font-bold tracking-normal">Operational readiness</h2>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                The core checks that matter most before Stablelane feels fully operational on Arc testnet.
              </p>
            </div>
            <StatusPill label={`${readinessScore}%`} tone={readinessScore >= 80 ? "done" : readinessScore >= 50 ? "live" : "lock"} />
          </div>

          <div className="grid gap-3">
            {readinessChecks.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <strong>{item.label}</strong>
                  <StatusPill label={item.ready ? "ready" : "needs work"} tone={item.ready ? "done" : "lock"} />
                </div>
                <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Current blockers</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              The most important issues still standing between the current workspace and a stronger operational setup.
            </p>
          </div>

          {blockers.length ? (
            <div className="grid gap-3">
              {blockers.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-1 font-semibold">{item.label}</div>
                  <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <InlineNotice
              title="No major blockers right now"
              detail="This workspace has all major readiness checks in place for the current product stage."
              tone="success"
            />
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Recent operational signals</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              A compact stream of the most recent Arc-focused actions saved inside the product.
            </p>
          </div>

          {recentSignals.length ? (
            <div className="grid gap-3">
              {recentSignals.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-[0.8rem] text-[var(--muted)]">{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                    <StatusPill label={item.status} tone={item.status === "confirmed" ? "done" : item.status === "submitted" ? "live" : "neutral"} />
                  </div>
                  <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No activity yet"
              detail="Gateway deposits, escrow actions, and crosschain execution events will appear here once you begin using the Arc flows."
            />
          )}
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Ops shortcuts</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Jump straight into the screens that matter most when running the product as an operations workspace.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { href: "/app/approvals", title: "Review approval pressure", detail: "Open the approvals queue and role preview tools." },
              { href: "/app/activity", title: "Check the activity stream", detail: "Review Gateway, escrow, release, and crosschain actions." },
              { href: "/app/arc", title: "Open Arc workspace", detail: "Use balance reading, Gateway flow, escrow funding, and settlement tools." },
              { href: "/app/team", title: "Manage workspace team", detail: "Add approvers and shape the team structure." },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
                <div className="mb-1 font-semibold text-[var(--text)]">{item.title}</div>
                <div className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.detail}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readActivityFeed, type ActivityItem } from "@/lib/activity-feed";
import { fetchApprovalOverview, fetchWorkspaceInvitations } from "@/lib/supabase-data";
import type { WorkspaceInvitation } from "@/lib/types";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

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

export function ApprovalInboxPanel() {
  const [overview, setOverview] = useState<ApprovalOverview | null>(null);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [approvalData, invitationData] = await Promise.all([
          fetchApprovalOverview(),
          fetchWorkspaceInvitations(),
        ]);

        if (!mounted) return;
        setOverview(approvalData as ApprovalOverview | null);
        setInvitations(invitationData);
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

  const pendingInvites = useMemo(
    () => invitations.filter((item) => item.status === "Pending"),
    [invitations]
  );
  const recentActivity = activity.slice(0, 6);

  if (loading) {
    return <LoadingState title="Loading inbox" detail="Stablelane is collecting approvals, invitations, and recent workspace signals." />;
  }

  if (!overview && !pendingInvites.length && !recentActivity.length) {
    return (
      <EmptyState
        title="Inbox is quiet"
        detail="Create approvals, send invitations, or run more workspace activity to populate the operations inbox."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Pending approvals", value: String(overview?.pending || 0) },
          { label: "Pending invites", value: String(pendingInvites.length) },
          { label: "Recent signals", value: String(recentActivity.length) },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Pending approvals</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              The invoices and approval requests that still need attention from the workspace.
            </p>
          </div>

          {overview?.recent?.length ? (
            <div className="grid gap-3">
              {overview.recent
                .filter((item) => item.status === "Pending")
                .slice(0, 8)
                .map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">{item.approver_email}</div>
                        <div className="text-[0.82rem] text-[var(--muted)]">{item.approver_role}</div>
                      </div>
                      <StatusPill label={item.status} tone="lock" />
                    </div>
                    <Link href={`/app/invoices/${item.invoice_id}`} className="text-[0.82rem] font-semibold text-[var(--accent)]">
                      Open invoice
                    </Link>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState
              title="No pending approvals"
              detail="Approval requests will surface here as soon as invoice release flows are routed through approvers."
            />
          )}
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Pending invitations</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              The invite queue for people who still need to be onboarded into the workspace.
            </p>
          </div>

          {pendingInvites.length ? (
            <div className="grid gap-3">
              {pendingInvites.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{item.invite_email}</div>
                      <div className="text-[0.82rem] text-[var(--muted)]">{item.invite_role}</div>
                    </div>
                    <StatusPill label="Pending" tone="lock" />
                  </div>
                  {item.invite_note ? (
                    <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.invite_note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pending invitations"
              detail="New invitees will appear here before they become permanent workspace members."
            />
          )}
        </section>
      </div>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Recent workspace signals</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            A quick stream of recent operational events saved in the product.
          </p>
        </div>

        {recentActivity.length ? (
          <div className="grid gap-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-[0.82rem] text-[var(--muted)]">{new Date(item.createdAt).toLocaleString()}</div>
                  </div>
                  <StatusPill
                    label={item.status}
                    tone={item.status === "confirmed" ? "done" : item.status === "submitted" ? "live" : "neutral"}
                  />
                </div>
                <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recent signals"
            detail="Gateway deposits, escrow actions, and release confirmations will appear here as the workspace becomes more active."
          />
        )}
      </section>
    </div>
  );
}

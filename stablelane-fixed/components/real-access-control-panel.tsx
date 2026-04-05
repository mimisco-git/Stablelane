"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchRealAccessContext, labelForAccessSource, type AccessContext } from "@/lib/workspace-access";
import { fetchInvitationsAssignedToMe } from "@/lib/supabase-data";
import type { WorkspaceInvitation } from "@/lib/types";
import { EmptyState, InlineNotice, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

export function RealAccessControlPanel() {
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [accessData, invitationRows] = await Promise.all([
          fetchRealAccessContext(),
          fetchInvitationsAssignedToMe(),
        ]);

        if (!mounted) return;
        setAccess(accessData);
        setInvitations(invitationRows);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const pendingInvitations = useMemo(
    () => invitations.filter((item) => item.status === "Pending"),
    [invitations]
  );

  if (loading) {
    return <LoadingState title="Loading real access state" detail="Stablelane is reading the current signed-in identity, memberships, and invitation access." />;
  }

  if (!access) {
    return <EmptyState title="No access data available" detail="Sign in to view your workspace access and permissions." />;
  }

  const permissionRows = [
    {
      label: "Can prepare funding",
      value: access.role === "Owner" || access.role === "Admin" || access.role === "Operator",
    },
    {
      label: "Can create approvals",
      value: access.role === "Owner" || access.role === "Admin",
    },
    {
      label: "Can finalize release",
      value: access.role === "Owner" || access.role === "Admin",
    },
    {
      label: "Can review assigned approvals",
      value: Boolean(access.email),
    },
  ];

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Access control
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Workspace access is now resolved from real membership data.
        </h1>
        <p className="max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          Your workspace role is resolved from your signed-in account and membership records. Permissions apply across invoices, escrows, approvals, and payout routing.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="mb-1 text-base font-bold tracking-normal">Resolved access</h2>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                This is the actual role Stablelane should use for workflow gating whenever the database can resolve it.
              </p>
            </div>
            <StatusPill
              label={access.role}
              tone={access.role === "Owner" ? "done" : access.role === "Admin" ? "live" : access.role === "Operator" ? "lock" : "neutral"}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Signed-in email</div>
              <div className="font-semibold text-[var(--text)]">{access.email || "No signed-in email"}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Access source</div>
              <div className="font-semibold text-[var(--text)]">{labelForAccessSource(access.source)}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Workspace</div>
              <div className="font-semibold text-[var(--text)]">{access.workspaceName || "No database workspace yet"}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Pending invitations</div>
              <div className="font-semibold text-[var(--text)]">{pendingInvitations.length}</div>
            </div>
          </div>

          {!access.hasDatabaseWorkspace ? (
            <div className="mt-4">
              <InlineNotice
                title="No database workspace role yet"
                detail="This account is signed in, but it still needs a real accepted invitation or ownership record before Stablelane can treat it like a full workspace operator."
                tone="warning"
              />
            </div>
          ) : null}
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Permission matrix</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              These checks reflect the resolved database-backed role before preview controls are used as fallback.
            </p>
          </div>

          <div className="grid gap-3">
            {permissionRows.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong>{item.label}</strong>
                  <StatusPill label={item.value ? "allowed" : "blocked"} tone={item.value ? "done" : "lock"} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Memberships assigned to this email</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Every membership currently tied to the active account.
            </p>
          </div>

          {access.memberships.length ? (
            <div className="grid gap-3">
              {access.memberships.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{item.workspace_name}</div>
                      <div className="text-[0.82rem] text-[var(--muted)]">{item.member_email}</div>
                    </div>
                    <StatusPill
                      label={item.role}
                      tone={item.role === "Owner" ? "done" : item.role === "Admin" ? "live" : item.role === "Operator" ? "lock" : "neutral"}
                    />
                  </div>
                  <div className="text-[0.82rem] text-[var(--muted)]">Member record created: {new Date(item.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No memberships yet" detail="Accept a workspace invitation or sign in as the workspace owner to create a real access record." />
          )}
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Next access actions</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Use these pages to move from preview-only access into a more real multi-user system.
            </p>
          </div>

          <div className="grid gap-3">
            <Link href="/accept-invite" className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
              <div className="mb-1 font-semibold text-[var(--text)]">Accept invitations</div>
              <div className="text-[0.82rem] leading-6 text-[var(--muted)]">Turn a pending invitation into a real member record.</div>
            </Link>
            <Link href="/app/my-approvals" className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
              <div className="mb-1 font-semibold text-[var(--text)]">Open my approvals</div>
              <div className="text-[0.82rem] leading-6 text-[var(--muted)]">Respond as the assigned approver using the signed-in email.</div>
            </Link>
            <Link href="/app/team" className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
              <div className="mb-1 font-semibold text-[var(--text)]">Review team</div>
              <div className="text-[0.82rem] leading-6 text-[var(--muted)]">Check the current workspace members and roles.</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

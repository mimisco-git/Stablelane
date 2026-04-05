"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createWorkspaceInvitation,
  fetchWorkspaceInvitations,
  updateWorkspaceInvitationStatus,
} from "@/lib/supabase-data";
import type { WorkspaceInvitation, WorkspaceMemberRole } from "@/lib/types";
import Link from "next/link";
import { EmptyState, InlineNotice, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

function toneFor(status: WorkspaceInvitation["status"]) {
  if (status === "Accepted") return "done" as const;
  if (status === "Pending") return "lock" as const;
  return "neutral" as const;
}

export function WorkspaceInvitationsManager() {
  const [rows, setRows] = useState<WorkspaceInvitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceMemberRole>("Operator");
  const [inviteNote, setInviteNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadInvitations() {
    setLoading(true);
    try {
      const data = await fetchWorkspaceInvitations();
      setRows(data);
    } catch {
      setRows([]);
      setMessage("Workspace invitations could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvitations();
  }, []);

  const summary = useMemo(() => {
    return {
      total: rows.length,
      pending: rows.filter((item) => item.status === "Pending").length,
      accepted: rows.filter((item) => item.status === "Accepted").length,
    };
  }, [rows])

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      setMessage("Enter an email before creating an invitation.");
      return;
    }

    try {
      await createWorkspaceInvitation({
        invite_email: inviteEmail.trim(),
        invite_role: inviteRole,
        invite_note: inviteNote.trim() || undefined,
      });
      setInviteEmail("");
      setInviteRole("Operator");
      setInviteNote("");
      setMessage("Invitation created.");
      await loadInvitations();
    } catch {
      setMessage("Invitation could not be created.");
    }
  }

  async function updateStatus(invitationId: string, status: "Accepted" | "Revoked" | "Declined") {
    try {
      await updateWorkspaceInvitationStatus(invitationId, status);
      setMessage(`Invitation ${status.toLowerCase()}.`);
      await loadInvitations();
    } catch {
      setMessage("Invitation status could not be updated.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Invitations", value: String(summary.total) },
          { label: "Pending", value: String(summary.pending) },
          { label: "Accepted", value: String(summary.accepted) },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</strong>
          </div>
        ))}
      </div>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Invite workspace members</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Create invitations before turning someone into a permanent workspace member. This makes the team flow feel more like a real finance and operations product.
          </p>
        </div>

        <form onSubmit={createInvite} className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
          <div className="grid gap-3">
            <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
              <span>Invite email</span>
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
                placeholder="teammate@example.com"
              />
            </label>

            <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
              <span>Role</span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as WorkspaceMemberRole)}
                className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
              >
                <option>Owner</option>
                <option>Admin</option>
                <option>Operator</option>
                <option>Viewer</option>
              </select>
            </label>

            <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
              <span>Invite note</span>
              <textarea
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                className="min-h-[110px] rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
                placeholder="Explain what the invitee should help with."
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
            >
              Create invitation
            </button>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Why invitations matter</div>
            <div className="grid gap-2">
              {[
                "Create a cleaner team onboarding flow",
                "Keep pending invitees separate from permanent members",
                "Track accepted and revoked access states",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-2 text-[0.82rem] text-[var(--muted)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </form>

        {message ? (
          <div className="mt-4">
            <InlineNotice title="Invitations" detail={message} tone={message.toLowerCase().includes("could not") ? "warning" : "success"} />
          </div>
        ) : null}
      </section>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Invitation queue</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            See which invites are still pending and which ones have been accepted, revoked, or declined.
          </p>
        </div>

        {loading ? (
          <LoadingState title="Loading invitations" detail="Stablelane is reading the current workspace invitation queue." />
        ) : rows.length ? (
          <div className="grid gap-3">
            {rows.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{item.invite_email}</div>
                    <div className="text-[0.82rem] text-[var(--muted)]">{item.invite_role} · {new Date(item.created_at).toLocaleString()}</div>
                  </div>
                  <StatusPill label={item.status} tone={toneFor(item.status)} />
                </div>

                {item.invite_note ? (
                  <p className="mb-3 text-[0.82rem] leading-6 text-[var(--muted)]">{item.invite_note}</p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "Accepted")}
                    disabled={item.status !== "Pending"}
                    className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45"
                  >
                    Mark accepted
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "Declined")}
                    disabled={item.status !== "Pending"}
                    className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45"
                  >
                    Mark declined
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "Revoked")}
                    disabled={item.status !== "Pending"}
                    className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45"
                  >
                    Revoke
                  </button>
                  <Link
                    href={`/accept-invite?invitation=${item.id}`}
                    className="text-[0.82rem] font-semibold text-[var(--accent)]"
                  >
                    Copy acceptance route
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No invitations yet"
            detail="Create the first team invitation to make the workspace onboarding flow more complete."
          />
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  acceptWorkspaceInvitation,
  declineWorkspaceInvitation,
  fetchInvitationsAssignedToMe,
} from "@/lib/supabase-data";
import type { WorkspaceInvitation } from "@/lib/types";
import { EmptyState, InlineNotice, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

export function InvitationAcceptanceCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitation");
  const [rows, setRows] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function loadRows() {
    setLoading(true);
    try {
      const data = await fetchInvitationsAssignedToMe();
      setRows(data);
    } catch {
      setRows([]);
      setMessage("Invitations could not be loaded for this account.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  async function accept(id: string) {
    setBusyId(id);
    setMessage("");
    try {
      await acceptWorkspaceInvitation(id);
      setMessage("Invitation accepted. You now exist as a real workspace member in this build.");
      await loadRows();
      setTimeout(() => router.push("/app/team"), 700);
    } catch {
      setMessage("Invitation could not be accepted.");
    } finally {
      setBusyId("");
    }
  }

  async function decline(id: string) {
    setBusyId(id);
    setMessage("");
    try {
      await declineWorkspaceInvitation(id);
      setMessage("Invitation declined.");
      await loadRows();
    } catch {
      setMessage("Invitation could not be declined.");
    } finally {
      setBusyId("");
    }
  }

  const highlightedId = invitationId || "";

  if (loading) {
    return <LoadingState title="Loading invitations" detail="Stablelane is reading invitations assigned to the current signed-in email address." />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No invitations assigned to this account"
        detail="Use the same email that was invited into the workspace, then come back here to accept or decline."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {message ? (
        <InlineNotice
          title="Invitation access"
          detail={message}
          tone={message.toLowerCase().includes("could not") ? "warning" : "success"}
        />
      ) : null}

      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Invitation acceptance
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Join the workspace cleanly.
        </h1>
        <p className="max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          Invitations now behave more like a real onboarding step. Accepting one creates your membership record using the currently signed-in email.
        </p>
      </section>

      <div className="grid gap-3">
        {rows.map((item) => {
          const highlighted = highlightedId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 ${
                highlighted ? "border-[var(--line)] bg-[rgba(201,255,96,.06)]" : "border-white/8 bg-white/3"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-[var(--text)]">{item.workspace_name}</div>
                  <div className="text-[0.82rem] text-[var(--muted)]">
                    {item.invite_email} · {item.invite_role}
                  </div>
                </div>
                <StatusPill
                  label={item.status}
                  tone={item.status === "Accepted" ? "done" : item.status === "Pending" ? "lock" : "neutral"}
                />
              </div>

              {item.invite_note ? (
                <p className="mb-3 text-[0.84rem] leading-6 text-[var(--muted)]">{item.invite_note}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => accept(item.id)}
                  disabled={busyId === item.id || item.status !== "Pending"}
                  className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.86rem] font-bold text-[#08100b] disabled:opacity-45"
                >
                  {busyId === item.id ? "Working..." : "Accept invitation"}
                </button>
                <button
                  type="button"
                  onClick={() => decline(item.id)}
                  disabled={busyId === item.id || item.status !== "Pending"}
                  className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.86rem] font-bold text-[var(--text)] disabled:opacity-45"
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

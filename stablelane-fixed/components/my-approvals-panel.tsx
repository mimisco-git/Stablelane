"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchApprovalsAssignedToMe,
  fetchRemoteInvoiceDrafts,
  respondToAssignedApproval,
  createWorkspaceAuditEvent,
} from "@/lib/supabase-data";
import type { ReleaseApprovalRequest, RemoteInvoiceDraftRow } from "@/lib/types";
import { EmptyState, InlineNotice, LoadingState } from "@/components/ui-state";
import { fetchRealAccessContext, labelForAccessSource } from "@/lib/workspace-access";
import { StatusPill } from "@/components/status-pill";

type ApprovalRow = ReleaseApprovalRequest & {
  invoice?: RemoteInvoiceDraftRow | null;
};

function toneFor(status: ReleaseApprovalRequest["status"]) {
  if (status === "Approved") return "done" as const;
  if (status === "Pending") return "lock" as const;
  return "neutral" as const;
}

export function MyApprovalsPanel() {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [accessLabel, setAccessLabel] = useState("Preview mode");
  const [resolvedRole, setResolvedRole] = useState<"Owner" | "Admin" | "Operator" | "Viewer">("Viewer");

  async function loadRows() {
    setLoading(true);
    try {
      const [approvals, invoices] = await Promise.all([
        fetchApprovalsAssignedToMe(),
        fetchRemoteInvoiceDrafts(),
      ]);

      const mapped = approvals.map((item) => ({
        ...item,
        invoice: invoices.find((invoice) => invoice.id === item.invoice_id) || null,
      }));

      setRows(mapped);
    } catch {
      setRows([]);
      setMessage("Assigned approvals could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const access = await fetchRealAccessContext();
        if (mounted) {
          setAccessLabel(labelForAccessSource(access.source));
          setResolvedRole(access.role);
        }
      } catch {
        // ignore
      }
      await loadRows();
    }

    boot();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    return {
      total: rows.length,
      pending: rows.filter((item) => item.status === "Pending").length,
      approved: rows.filter((item) => item.status === "Approved").length,
    };
  }, [rows])

  async function respond(requestId: string, invoiceId: string, nextStatus: "Approved" | "Rejected") {
    setBusyId(requestId);
    setMessage("");
    try {
      await respondToAssignedApproval(requestId, invoiceId, nextStatus, note || undefined);
      await createWorkspaceAuditEvent({
        event_type: nextStatus === "Approved" ? "approver_inbox_approved" : "approver_inbox_rejected",
        title: nextStatus === "Approved" ? "Approval completed from inbox" : "Approval rejected from inbox",
        detail: nextStatus === "Approved" ? `An approver approved invoice ${invoiceId} from the approver inbox.` : `An approver rejected invoice ${invoiceId} from the approver inbox.`,
        metadata: { requestId, invoiceId, note },
      });
      setMessage(nextStatus === "Approved" ? "Approval recorded from the approver inbox." : "Rejection recorded from the approver inbox.");
      setNote("");
      await loadRows();
    } catch {
      setMessage("Approval response could not be saved.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return <LoadingState title="Loading my approvals" detail="Stablelane is reading approval requests assigned to the current signed-in email." />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No approvals assigned to this account"
        detail="Once this email is selected as an approver, the requests will appear here with direct response controls."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Assigned approvals", value: String(summary.total) },
          { label: "Pending", value: String(summary.pending) },
          { label: "Approved", value: String(summary.approved) },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</strong>
          </div>
        ))}
      </div>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="mb-1 text-base font-bold tracking-normal">Approver inbox</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              This page is designed for the signed-in approver, not only the workspace owner. Approve or reject directly from here.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={resolvedRole} tone={resolvedRole === "Owner" ? "done" : resolvedRole === "Admin" ? "live" : resolvedRole === "Operator" ? "lock" : "neutral"} />
            <StatusPill label={accessLabel} tone="neutral" />
          </div>
        </div>

        <label className="mb-4 grid gap-2 text-[0.82rem] text-[var(--muted)]">
          <span>Decision note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[110px] rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            placeholder="Explain the reason for your decision."
          />
        </label>

        <div className="grid gap-3">
          {rows.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.invoice?.title || "Invoice approval request"}</div>
                  <div className="text-[0.82rem] text-[var(--muted)]">
                    {item.invoice?.client_name || "Unknown client"} · {item.approver_role}
                  </div>
                </div>
                <StatusPill label={item.status} tone={toneFor(item.status)} />
              </div>

              <div className="mb-3 grid gap-2 md:grid-cols-3">
                <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                  Invoice ID: {item.invoice_id}
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                  Approver: {item.approver_email}
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                  Created: {new Date(item.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/app/invoices/${item.invoice_id}`} className="text-[0.82rem] font-semibold text-[var(--accent)]">
                  Open invoice
                </Link>
                <button
                  type="button"
                  onClick={() => respond(item.id, item.invoice_id, "Approved")}
                  disabled={busyId === item.id || item.status !== "Pending"}
                  className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45"
                >
                  {busyId === item.id ? "Working..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => respond(item.id, item.invoice_id, "Rejected")}
                  disabled={busyId === item.id || item.status !== "Pending"}
                  className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {message ? (
        <InlineNotice
          title="Approver inbox"
          detail={message}
          tone={message.toLowerCase().includes("could not") ? "warning" : "success"}
        />
      ) : null}
    </div>
  );
}

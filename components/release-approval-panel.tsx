"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createReleaseApprovalRequests,
  fetchReleaseApprovals,
  fetchWorkspaceMembers,
  fetchInvoiceApprovalGate,
  updateInvoiceWorkflowState,
  updateReleaseApprovalRequest,
} from "@/lib/supabase-data";
import { canCreateApprovals, readActingRole } from "@/lib/role-session";
import { EmptyState, InlineNotice, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type Member = {
  id: string;
  member_name: string;
  member_email: string;
  role: "Owner" | "Admin" | "Operator" | "Viewer";
};

type RequestRow = {
  id: string;
  approver_email: string;
  approver_role: "Owner" | "Admin" | "Operator" | "Viewer";
  status: "Pending" | "Approved" | "Rejected";
};

export function ReleaseApprovalPanel({
  invoiceId,
  clientName,
  amount,
  currency,
}: {
  invoiceId: string;
  clientName: string;
  amount: string;
  currency: string;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingRole, setActingRole] = useState("Owner");
  const [gateSummary, setGateSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    allApproved: false,
    hasRejection: false,
  });

  async function loadAll() {
    setLoading(true);
    try {
      const [memberRows, requestRows, gate] = await Promise.all([
        fetchWorkspaceMembers(),
        fetchReleaseApprovals(invoiceId),
        fetchInvoiceApprovalGate(invoiceId),
      ]);
      setMembers(memberRows as Member[]);
      setRequests(requestRows as RequestRow[]);
      setGateSummary(gate);
    } catch {
      setMessage("Approval data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setActingRole(readActingRole());
    loadAll();
  }, [invoiceId]);

  const pendingCount = useMemo(() => requests.filter((item) => item.status === "Pending").length, [requests]);
  const approvedCount = useMemo(() => requests.filter((item) => item.status === "Approved").length, [requests]);

  function toggleApprover(email: string) {
    setSelectedEmails((current) => current.includes(email) ? current.filter((item) => item !== email) : [...current, email]);
  }

  async function createRequestSet() {
    if (!canCreateApprovals(readActingRole())) {
      setMessage(`${readActingRole()} cannot create release approvals in this preview.`);
      return;
    }

    const selectedMembers = members.filter((member) => selectedEmails.includes(member.member_email));
    if (!selectedMembers.length) {
      setMessage("Choose at least one approver before creating release approvals.");
      return;
    }

    try {
      await createReleaseApprovalRequests(
        invoiceId,
        selectedMembers.map((member) => ({
          approver_email: member.member_email,
          approver_role: member.role,
        }))
      );

      await updateInvoiceWorkflowState(
        invoiceId,
        { escrow_status: "release_requested" },
        {
          eventType: "release_requested",
          detail: "Release workflow moved into approval stage.",
          metadata: {
            approvers: selectedMembers.map((member) => member.member_email),
            note,
          },
        }
      );

      setSelectedEmails([]);
      setNote("");
      setMessage("Release approvals created.");
      await loadAll();
    } catch {
      setMessage("Release approvals could not be created.");
    }
  }

  async function decide(requestId: string, nextStatus: "Approved" | "Rejected") {
    if (!canCreateApprovals(readActingRole())) {
      setMessage(`${readActingRole()} cannot decide release approvals in this preview.`);
      return;
    }

    try {
      await updateReleaseApprovalRequest(requestId, invoiceId, nextStatus, note || undefined);
      const finalGate = await fetchInvoiceApprovalGate(invoiceId);
      setGateSummary(finalGate);

      if (finalGate.allApproved) {
        await updateInvoiceWorkflowState(
          invoiceId,
          { status: "In escrow", escrow_status: "release_requested" },
          {
            eventType: "release_approval_complete",
            detail: "All release approvals are approved and the invoice is ready for final release action.",
            metadata: { approvals: finalGate.total },
          }
        );
      }

      setMessage(nextStatus === "Approved" ? "Approval recorded." : "Rejection recorded.");
      await loadAll();
    } catch {
      setMessage("Approval decision could not be saved.");
    }
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Release approvals</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Add an approval layer before release so Stablelane behaves more like a real operational finance workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={`${pendingCount} pending`} tone={pendingCount ? "lock" : "neutral"} />
          <StatusPill label={`${approvedCount} approved`} tone={approvedCount ? "done" : "neutral"} />
          <StatusPill label={`acting as ${actingRole}`} tone={actingRole === "Viewer" ? "neutral" : actingRole === "Operator" ? "lock" : "live"} />
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-white/8 bg-white/3 p-4">
        <div className="mb-2 font-semibold">Approval gate state</div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.84rem] text-[var(--muted)]">Total: {gateSummary.total}</div>
          <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.84rem] text-[var(--muted)]">Pending: {gateSummary.pending}</div>
          <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.84rem] text-[var(--muted)]">Approved: {gateSummary.approved}</div>
          <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.84rem] text-[var(--muted)]">
            {gateSummary.allApproved ? "Release can be finalized" : gateSummary.hasRejection ? "A rejection blocks the gate" : gateSummary.total ? "Still waiting on approvals" : "No approvals exist yet"}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState title="Loading approvals" detail="Stablelane is reading team members and approval requests for this invoice." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Create approval request</div>
            <p className="mb-3 text-[0.82rem] leading-6 text-[var(--muted)]">Invoice: {clientName} · {amount} {currency}</p>

            {members.length ? (
              <div className="grid gap-2">
                {members.map((member) => (
                  <label key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[.03] px-3 py-3">
                    <div>
                      <div className="font-semibold">{member.member_name}</div>
                      <div className="text-[0.8rem] text-[var(--muted)]">{member.member_email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill label={member.role} tone={member.role === "Owner" ? "done" : member.role === "Admin" ? "live" : member.role === "Operator" ? "lock" : "neutral"} />
                      <input type="checkbox" checked={selectedEmails.includes(member.member_email)} onChange={() => toggleApprover(member.member_email)} />
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <EmptyState title="No workspace members yet" detail="Add team members first so release approvals can be routed through real workspace roles." />
            )}

            <label className="mt-3 grid gap-2 text-[0.82rem] text-[var(--muted)]">
              <span>Approval note</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[110px] rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none" placeholder="Explain what should be checked before release." />
            </label>

            <button type="button" onClick={createRequestSet} className="mt-3 rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
              Create approvals
            </button>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Approval queue</div>

            {requests.length ? (
              <div className="grid gap-3">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-xl border border-white/8 bg-white/[.03] p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">{request.approver_email}</div>
                        <div className="text-[0.8rem] text-[var(--muted)]">{request.approver_role}</div>
                      </div>
                      <StatusPill label={request.status} tone={request.status === "Approved" ? "done" : request.status === "Rejected" ? "neutral" : "lock"} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => decide(request.id, "Approved")} disabled={request.status !== "Pending"} className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45">
                        Approve
                      </button>
                      <button type="button" onClick={() => decide(request.id, "Rejected")} disabled={request.status !== "Pending"} className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No approvals yet" detail="Create the first approval set to add a proper release checkpoint before funds are released." />
            )}
          </div>
        </div>
      )}

      {message ? <div className="mt-4"><InlineNotice title="Approval workflow" detail={message} tone={message.toLowerCase().includes("could not") || message.toLowerCase().includes("cannot") ? "warning" : "success"} /></div> : null}
    </section>
  );
}

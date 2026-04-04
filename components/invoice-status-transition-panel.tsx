"use client";

import { useState } from "react";
import { updateInvoiceWorkflowState } from "@/lib/supabase-data";
import { StatusPill } from "@/components/status-pill";
import { InlineNotice } from "@/components/ui-state";

const statusOptions = ["Draft", "Sent", "In escrow", "Completed"] as const;

export function InvoiceStatusTransitionPanel({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const [selected, setSelected] = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveStatus() {
    setSaving(true);
    setMessage("");
    try {
      await updateInvoiceWorkflowState(invoiceId, { status: selected });
      setMessage("Invoice status updated.");
    } catch {
      setMessage("Status update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Invoice status</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Move the invoice through the real workflow states used across the workspace.
          </p>
        </div>
        <StatusPill
          label={selected}
          tone={selected === "Completed" ? "done" : selected === "In escrow" ? "live" : selected === "Sent" ? "lock" : "neutral"}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
        >
          {statusOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={saveStatus}
          disabled={saving}
          className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save status"}
        </button>
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice title="Status update" detail={message} tone={message.includes("failed") ? "warning" : "success"} />
        </div>
      ) : null}
    </section>
  );
}

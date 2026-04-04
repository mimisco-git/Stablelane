"use client";

import { useEffect, useState } from "react";
import { fetchInvoiceHistory } from "@/lib/supabase-data";
import type { InvoiceHistoryRecord } from "@/lib/types";
import { LoadingState, EmptyState } from "@/components/ui-state";

export function InvoiceHistoryPanel({ invoiceId }: { invoiceId: string }) {
  const [rows, setRows] = useState<InvoiceHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchInvoiceHistory(invoiceId);
        if (mounted) setRows(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [invoiceId]);

  if (loading) {
    return <LoadingState title="Loading invoice history" detail="Stablelane is pulling the saved edit and workflow timeline for this invoice." />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No remote edit history yet"
        detail="History appears for workspace invoices when they are created, updated, transitioned, or moved through the escrow flow."
      />
    );
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Invoice history</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          A saved timeline of edits, status changes, and escrow workflow updates for this invoice.
        </p>
      </div>

      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <strong className="text-[0.9rem] text-[var(--text)]">{row.event_type.replace(/_/g, " ")}</strong>
              <span className="text-[0.78rem] text-[var(--muted)]">
                {new Date(row.created_at).toLocaleString()}
              </span>
            </div>
            <div className="text-[0.84rem] leading-6 text-[var(--muted)]">{row.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

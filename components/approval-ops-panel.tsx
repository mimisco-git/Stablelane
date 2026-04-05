"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchApprovalOverview } from "@/lib/supabase-data";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type Overview = {
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
    note: string | null;
    created_at: string;
  }>;
};

function toneFor(status: "Pending" | "Approved" | "Rejected") {
  if (status === "Approved") return "done" as const;
  if (status === "Pending") return "lock" as const;
  return "neutral" as const;
}

export function ApprovalOpsPanel() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchApprovalOverview();
        if (mounted) setOverview(data as Overview | null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingState title="Loading approval operations" detail="Stablelane is summarizing your release approval activity from the workspace." />;
  }

  if (!overview || overview.total === 0) {
    return <EmptyState title="No approval activity yet" detail="Create release approvals from an invoice detail page and the operational queue will appear here." />;
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total requests", value: String(overview.total) },
          { label: "Pending", value: String(overview.pending) },
          { label: "Approved", value: String(overview.approved) },
          { label: "Rejected", value: String(overview.rejected) },
        ].map((metric) => (
          <div key={metric.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{metric.label}</div>
            <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{metric.value}</strong>
          </div>
        ))}
      </div>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Recent approval queue</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            A workspace-level view of current approval flow so operations teams can spot pending release decisions quickly.
          </p>
        </div>

        <div className="grid gap-3">
          {overview.recent.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.approver_email}</div>
                  <div className="text-[0.8rem] text-[var(--muted)]">{item.approver_role} · {new Date(item.created_at).toLocaleString()}</div>
                </div>
                <StatusPill label={item.status} tone={toneFor(item.status)} />
              </div>
              <div className="flex flex-wrap gap-3 text-[0.82rem]">
                <Link href={`/app/invoices/${item.invoice_id}`} className="font-semibold text-[var(--accent)]">
                  Open invoice
                </Link>
                {item.note ? <span className="text-[var(--muted)]">{item.note}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

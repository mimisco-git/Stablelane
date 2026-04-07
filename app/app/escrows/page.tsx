"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { RemoteInvoiceDraftRow } from "@/lib/types";

function EscrowTone(status: string) {
  if (status === "funded") return "live" as const;
  if (status === "released") return "done" as const;
  if (status === "created") return "lock" as const;
  return "neutral" as const;
}

function EscrowLabel(status: string) {
  if (status === "funded") return "Funded";
  if (status === "released") return "Released";
  if (status === "created") return "Created";
  if (status === "awaiting_funding") return "Awaiting funding";
  return "Draft";
}

export default function EscrowsPage() {
  const [rows, setRows] = useState<RemoteInvoiceDraftRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("invoice_drafts")
        .select("*")
        .eq("owner_id", user.id)
        .not("escrow_status", "is", null)
        .neq("escrow_status", "draft")
        .order("updated_at", { ascending: false });

      setRows((data || []) as RemoteInvoiceDraftRow[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <DashboardShell
      currentPath="/app/escrows"
      title="Escrows"
      description="Manage escrow state, milestone approvals, and settlement releases across your active client engagements."
      badge="Milestone escrow"
    >
      {loading ? (
        <div className="py-12 text-center text-[0.9rem] text-[var(--muted)]">Loading escrows...</div>
      ) : rows.length === 0 ? (
        <div className="rounded-[22px] border border-white/8 bg-white/3 p-10 text-center">
          <div className="mb-3 text-4xl opacity-20">◈</div>
          <div className="mb-2 font-semibold">No escrows yet</div>
          <p className="mb-5 text-[0.88rem] text-[var(--muted)]">Create an invoice and send the payment link to a client to start an escrow.</p>
          <Link href="/app/invoices/new" className="rounded-full bg-[var(--accent)] px-5 py-3 text-[0.88rem] font-bold text-[#08100b]">
            Create invoice
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/app/invoices/${row.id}`}
              className="grid gap-3 rounded-[22px] border border-white/8 bg-white/3 p-5 transition hover:border-white/12 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
            >
              <div>
                <div className="mb-1 font-semibold">{row.title}</div>
                <div className="text-[0.84rem] text-[var(--muted)]">
                  {row.client_name} · {Array.isArray(row.milestones) ? row.milestones.length : 0} milestone{(Array.isArray(row.milestones) ? row.milestones.length : 0) !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="text-[0.84rem] text-[var(--muted)]">
                <strong className="text-[var(--text)]">{row.amount} {row.currency}</strong>
              </div>
              {row.escrow_address && (
                <div className="font-mono text-[0.78rem] text-[var(--muted)]">
                  {row.escrow_address.slice(0, 8)}...{row.escrow_address.slice(-4)}
                </div>
              )}
              <StatusPill label={EscrowLabel(row.escrow_status || "")} tone={EscrowTone(row.escrow_status || "")} />
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

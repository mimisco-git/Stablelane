"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/status-pill";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { RemoteInvoiceDraftRow } from "@/lib/types";
import Link from "next/link";

export default function PayoutsPage() {
  const [invoices, setInvoices] = useState<RemoteInvoiceDraftRow[]>([]);
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
        .order("updated_at", { ascending: false });

      setInvoices((data || []) as RemoteInvoiceDraftRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const completed = invoices.filter((r) => r.status === "Completed" || r.escrow_status === "released");
  const inEscrow = invoices.filter((r) => r.escrow_status === "funded" || r.status === "In escrow");

  // Compute splits from all invoices with splits defined
  const allSplits = invoices.flatMap((r) =>
    Array.isArray(r.splits) ? r.splits.map((s: any) => ({ ...s, invoiceTitle: r.title, amount: r.amount, currency: r.currency })) : []
  );

  const splitTotals = allSplits.reduce((acc: Record<string, { percent: number; total: number; currency: string; count: number }>, s: any) => {
    const key = s.member || "Unknown";
    if (!acc[key]) acc[key] = { percent: s.percent, total: 0, currency: s.currency || "USDC", count: 0 };
    acc[key].total += (Number(s.amount || 0) * s.percent) / 100;
    acc[key].count += 1;
    return acc;
  }, {});

  return (
    <DashboardShell
      currentPath="/app/payouts"
      title="Payouts"
      description="Configure payout splits, manage templates, and view completed payout records for your workspace."
      badge="Payouts"
    >
      {loading ? (
        <div className="py-12 text-center text-[0.9rem] text-[var(--muted)]">Loading payouts...</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
            <h2 className="mb-1 text-base font-bold tracking-normal">Payout splits</h2>
            <p className="mb-4 text-[0.82rem] text-[var(--muted)]">Calculated from splits defined across your saved invoices.</p>
            {Object.keys(splitTotals).length === 0 ? (
              <div className="py-6 text-center text-[0.88rem] text-[var(--muted)]">
                No splits configured yet. Add payout splits when creating invoices.
              </div>
            ) : (
              <div className="grid gap-3">
                {/* Total summary */}
                <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.04)] px-4 py-3">
                  <span className="text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">Total payable</span>
                  <span className="font-[family-name:var(--font-cormorant)] text-[1.6rem] tracking-[-0.04em] text-[var(--accent)]">
                    {Object.values(splitTotals).reduce((sum, d) => sum + d.total, 0).toFixed(2)} {Object.values(splitTotals)[0]?.currency || "USDC"}
                  </span>
                </div>
                {Object.entries(splitTotals).map(([member, data]) => (
                  <div key={member} className="grid gap-2 rounded-2xl border border-white/8 bg-white/3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/5 text-[0.8rem] font-bold text-[var(--accent)]">
                          {member.charAt(0).toUpperCase()}
                        </div>
                        <strong>{member}</strong>
                      </div>
                      <span className="font-[family-name:var(--font-cormorant)] text-[1.3rem] tracking-[-0.03em] text-[var(--accent)]">
                        {data.total.toFixed(2)} {data.currency}
                      </span>
                    </div>
                    <div className="text-[0.78rem] text-[var(--muted)]">{data.percent}% across {data.count} invoice{data.count !== 1 ? "s" : ""}</div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-all duration-700"
                        style={{ width: `${Math.min(100, data.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
            <h2 className="mb-1 text-base font-bold tracking-normal">Settlement records</h2>
            <p className="mb-4 text-[0.82rem] text-[var(--muted)]">Completed and active escrow invoices from your workspace.</p>
            {completed.length === 0 && inEscrow.length === 0 ? (
              <div className="py-6 text-center">
                <p className="mb-3 text-[0.88rem] text-[var(--muted)]">No completed settlements yet.</p>
                <Link href="/app/invoices" className="text-[0.84rem] text-[var(--accent)] underline underline-offset-2">
                  View invoices
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {[...completed, ...inEscrow].map((row) => (
                  <Link key={row.id} href={`/app/invoices/${row.id}`} className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:border-white/12">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <strong>{row.title}</strong>
                      <span className="font-semibold">{row.amount} {row.currency}</span>
                    </div>
                    <div className="mb-2 text-[0.84rem] text-[var(--muted)]">
                      {row.client_name}
                      {row.escrow_address && ` · ${row.escrow_address.slice(0, 8)}...`}
                    </div>
                    <StatusPill
                      label={row.status === "Completed" ? "Settled" : "In escrow"}
                      tone={row.status === "Completed" ? "done" : "live"}
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
}

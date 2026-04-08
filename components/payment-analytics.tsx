"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import Link from "next/link";

type InvoiceRow = {
  id: string;
  title: string;
  client_name: string;
  amount: number | null;
  currency: string;
  status: string;
  escrow_status: string | null;
  created_at: string;
  updated_at: string;
};

type ClientStat = {
  name: string;
  invoices: number;
  totalValue: number;
  paid: number;
  avgDays: number;
  currency: string;
};

function daysBetween(a: string, b: string): number {
  return Math.round(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

function Bar({ value, max, color = "bg-[var(--accent)]" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PaymentAnalytics() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("invoice_drafts")
        .select("id,title,client_name,amount,currency,status,escrow_status,created_at,updated_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      setRows((data || []) as InvoiceRow[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="py-12 text-center text-[0.9rem] text-[var(--muted)]">Loading analytics...</div>;
  if (!rows.length) return (
    <div className="rounded-[20px] border border-white/8 bg-white/3 p-10 text-center">
      <div className="mb-2 text-3xl opacity-20">◌</div>
      <p className="mb-3 text-[0.88rem] text-[var(--muted)]">No invoice data yet.</p>
      <Link href="/app/invoices/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.85rem] font-bold text-[#08100b]">Create first invoice</Link>
    </div>
  );

  const total = rows.length;
  const paid = rows.filter(r => r.status === "Completed" || r.escrow_status === "released").length;
  const inEscrow = rows.filter(r => r.status === "In escrow" || r.escrow_status === "funded").length;
  const draft = rows.filter(r => r.status === "Draft").length;
  const totalValue = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const paidValue = rows.filter(r => r.status === "Completed").reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Time to payment for completed invoices
  const completedWithTime = rows
    .filter(r => r.status === "Completed")
    .map(r => ({ ...r, days: daysBetween(r.created_at, r.updated_at) }));
  const avgPaymentDays = completedWithTime.length
    ? Math.round(completedWithTime.reduce((sum, r) => sum + r.days, 0) / completedWithTime.length)
    : null;

  // Per-client stats
  const clientMap: Record<string, InvoiceRow[]> = {};
  rows.forEach(r => {
    if (!clientMap[r.client_name]) clientMap[r.client_name] = [];
    clientMap[r.client_name].push(r);
  });

  const clientStats: ClientStat[] = Object.entries(clientMap).map(([name, invs]) => {
    const completed = invs.filter(i => i.status === "Completed");
    const avgDays = completed.length
      ? Math.round(completed.reduce((s, i) => s + daysBetween(i.created_at, i.updated_at), 0) / completed.length)
      : 0;
    return {
      name,
      invoices: invs.length,
      totalValue: invs.reduce((s, i) => s + Number(i.amount || 0), 0),
      paid: completed.length,
      avgDays,
      currency: invs[0]?.currency || "USDC",
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  const maxValue = Math.max(...clientStats.map(c => c.totalValue), 1);
  const conversionRate = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <div className="grid gap-4">
      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Conversion rate", value: `${conversionRate}%`, note: `${paid} of ${total} invoices paid`, highlight: conversionRate >= 50 },
          { label: "Avg time to payment", value: avgPaymentDays !== null ? `${avgPaymentDays}d` : "—", note: "Days from invoice to completion" },
          { label: "Total value", value: `$${(totalValue / 1000).toFixed(1)}k`, note: `${rows[0]?.currency || "USDC"}` },
          { label: "Settled on-chain", value: `$${(paidValue / 1000).toFixed(1)}k`, note: "Completed invoices", highlight: paidValue > 0 },
        ].map(card => (
          <div key={card.label} className={`rounded-[18px] border p-4 ${card.highlight ? "border-[var(--line)] bg-[rgba(201,255,96,.06)]" : "border-white/8 bg-white/3"}`}>
            <div className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <div className={`font-[family-name:var(--font-cormorant)] text-[2rem] tracking-[-0.04em] ${card.highlight ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>{card.value}</div>
            <div className="text-[0.75rem] text-[var(--muted)]">{card.note}</div>
          </div>
        ))}
      </div>

      {/* Invoice status funnel */}
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-1 text-base font-bold">Invoice funnel</h2>
        <p className="mb-4 text-[0.82rem] text-[var(--muted)]">How your invoices move through the workflow.</p>
        <div className="grid gap-3">
          {[
            { label: "Created", count: total, color: "bg-white/20" },
            { label: "In escrow", count: inEscrow, color: "bg-[var(--accent-3)]" },
            { label: "Completed", count: paid, color: "bg-[var(--accent)]" },
            { label: "Draft only", count: draft, color: "bg-white/10" },
          ].map(item => (
            <div key={item.label}>
              <div className="mb-1.5 flex justify-between text-[0.82rem]">
                <span className="text-[var(--muted)]">{item.label}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
              <Bar value={item.count} max={total} color={item.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Client performance */}
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-1 text-base font-bold">Client performance</h2>
        <p className="mb-4 text-[0.82rem] text-[var(--muted)]">Revenue and payment speed per client.</p>
        {clientStats.length === 0 ? (
          <p className="text-[0.88rem] text-[var(--muted)]">No client data yet.</p>
        ) : (
          <div className="grid gap-3">
            {clientStats.map(c => (
              <div key={c.name} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-[0.78rem] text-[var(--muted)]">{c.invoices} invoice{c.invoices !== 1 ? "s" : ""} · {c.paid} paid</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[var(--accent)]">{c.totalValue.toLocaleString()} {c.currency}</div>
                    {c.avgDays > 0 && <div className="text-[0.75rem] text-[var(--muted)]">avg {c.avgDays}d to pay</div>}
                  </div>
                </div>
                <Bar value={c.totalValue} max={maxValue} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity table */}
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-4 text-base font-bold">Recent invoices</h2>
        <div className="grid gap-2">
          {rows.slice(0, 8).map(r => {
            const days = daysBetween(r.created_at, r.updated_at);
            const isCompleted = r.status === "Completed";
            return (
              <Link key={r.id} href={`/app/invoices/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition hover:border-white/12">
                <div>
                  <div className="text-[0.86rem] font-semibold">{r.client_name}</div>
                  <div className="text-[0.75rem] text-[var(--muted)]">{r.title}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[0.86rem] font-semibold">{Number(r.amount || 0).toLocaleString()} {r.currency}</span>
                  {isCompleted && <span className="text-[0.75rem] text-[var(--muted)]">{days}d</span>}
                  <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] ${
                    isCompleted ? "bg-[rgba(201,255,96,.12)] text-[var(--accent)]"
                    : r.status === "In escrow" ? "bg-[rgba(216,196,139,.12)] text-[var(--accent-3)]"
                    : "bg-white/5 text-[var(--muted-2)]"
                  }`}>{r.status}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWorkspaceAnalytics } from "@/lib/supabase-data";
import { LoadingState, EmptyState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type Analytics = {
  workspaceName: string;
  roleType: string;
  defaultCurrency: string;
  totalInvoices: number;
  totalClients: number;
  totalValue: number;
  linkedInvoices: number;
  unlinkedInvoices: number;
  clientTotals: Array<{ name: string; count: number; value: number }>;
  statusTotals: Record<string, number>;
  escrowTotals: Record<string, number>;
  currencyTotals: Record<string, number>;
  recentInvoices: Array<{
    id: string;
    title: string;
    client_name: string;
    amount: number | null;
    currency: "USDC" | "EURC";
    status: string;
    escrow_status: string | null;
  }>;
};

function toneForStatus(status: string) {
  if (status === "Completed" || status === "released") return "done" as const;
  if (status === "In escrow" || status === "funded") return "live" as const;
  if (status === "Sent" || status === "created") return "lock" as const;
  return "neutral" as const;
}

function BarChart({ data, max, currency }: { data: { label: string; value: number }[]; max: number; currency: string }) {
  if (!data.length) return null;
  return (
    <div className="grid gap-3">
      {data.map((item) => {
        const pct = max > 0 ? Math.round((item.value / max) * 100) : 0;
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-[0.85rem] font-semibold truncate">{item.label}</span>
              <span className="shrink-0 text-[0.82rem] text-[var(--muted)]">
                {item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })} {currency}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function WorkspaceAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchWorkspaceAnalytics().then((data) => {
      if (mounted && data) setAnalytics(data as unknown as Analytics);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingState title="Analytics" detail="Loading analytics..." />;
  if (!analytics) return <EmptyState title="No data" detail="Sign in to see analytics." />;

  const clientChartData = analytics.clientTotals
    .slice(0, 6)
    .map((c) => ({ label: c.name, value: c.value }));
  const maxClientValue = Math.max(...clientChartData.map((c) => c.value), 1);

  const statusChartData = Object.entries(analytics.statusTotals).map(([label, value]) => ({
    label,
    value,
  }));
  const maxStatusValue = Math.max(...statusChartData.map((s) => s.value), 1);

  const fmt = (n: number) =>
    n >= 1000
      ? `${(n / 1000).toFixed(1)}k`
      : n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div className="grid gap-4">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total invoices", value: String(analytics.totalInvoices), note: "Saved in your workspace" },
          { label: "Total value", value: `${fmt(analytics.totalValue)} ${analytics.defaultCurrency}`, note: "Across all invoices" },
          { label: "Clients", value: String(analytics.totalClients), note: "Unique client records" },
          { label: "Linked clients", value: String(analytics.linkedInvoices), note: "Invoices with saved clients" },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <div className="mb-1 font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</div>
            <div className="text-[0.78rem] text-[var(--muted)]">{card.note}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Revenue by client */}
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-1 text-base font-bold tracking-normal">Revenue by client</h2>
          <p className="mb-4 text-[0.82rem] text-[var(--muted)]">Total invoice value per client.</p>
          {clientChartData.length > 0 ? (
            <BarChart data={clientChartData} max={maxClientValue} currency={analytics.defaultCurrency} />
          ) : (
            <p className="text-[0.88rem] text-[var(--muted)]">No client data yet. Add clients and create invoices.</p>
          )}
        </section>

        {/* Invoice status breakdown */}
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-1 text-base font-bold tracking-normal">Invoice status</h2>
          <p className="mb-4 text-[0.82rem] text-[var(--muted)]">Breakdown by workflow stage.</p>
          {statusChartData.length > 0 ? (
            <div className="grid gap-3">
              {statusChartData.map((item) => {
                const pct = maxStatusValue > 0 ? Math.round((item.value / maxStatusValue) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <StatusPill label={item.label} tone={toneForStatus(item.label)} />
                      <span className="text-[0.88rem] font-semibold">{item.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[0.88rem] text-[var(--muted)]">No invoices yet.</p>
          )}
        </section>
      </div>

      {/* Escrow breakdown */}
      {Object.keys(analytics.escrowTotals).length > 0 && (
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-1 text-base font-bold tracking-normal">Escrow breakdown</h2>
          <p className="mb-4 text-[0.82rem] text-[var(--muted)]">On-chain escrow status across your invoices.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(analytics.escrowTotals).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                <span className="text-[0.88rem] font-semibold capitalize">{status.replace(/_/g, " ")}</span>
                <span className="text-[0.88rem] font-bold text-[var(--accent)]">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent invoices */}
      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-normal">Recent invoices</h2>
          <Link href="/app/invoices" className="text-[0.82rem] font-semibold text-[var(--accent)]">View all</Link>
        </div>
        {analytics.recentInvoices.length === 0 ? (
          <p className="text-[0.88rem] text-[var(--muted)]">No invoices yet.</p>
        ) : (
          <div className="grid gap-2">
            {analytics.recentInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/app/invoices/${invoice.id}`}
                className="grid items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 transition hover:border-white/12 md:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <div className="font-semibold">{invoice.client_name}</div>
                  <div className="text-[0.8rem] text-[var(--muted)]">{invoice.title}</div>
                </div>
                <div className="text-[0.9rem] font-semibold">
                  {Number(invoice.amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} {invoice.currency}
                </div>
                <StatusPill label={invoice.status} tone={toneForStatus(invoice.status)} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

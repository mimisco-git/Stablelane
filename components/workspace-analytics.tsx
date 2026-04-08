"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWorkspaceAnalytics } from "@/lib/supabase-data";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
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
    created_at: string;
    updated_at: string;
  }>;
};

type PaymentInsight = {
  clientName: string;
  invoiceCount: number;
  avgDaysToEscrow: number | null;
  totalPaid: number;
  currency: string;
  lastInvoiceDate: string;
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
              <span className="truncate text-[0.85rem] font-semibold">{item.label}</span>
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
  const [insights, setInsights] = useState<PaymentInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadAll().then(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  async function loadAll() {
    const [data] = await Promise.all([
      fetchWorkspaceAnalytics(),
      loadPaymentInsights(),
    ]);
    if (data) setAnalytics(data as unknown as Analytics);
  }

  async function loadPaymentInsights() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rows } = await supabase
      .from("invoice_drafts")
      .select("client_name,status,escrow_status,amount,currency,created_at,updated_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (!rows) return;

    // Group by client
    const byClient: Record<string, typeof rows> = {};
    for (const row of rows) {
      const key = row.client_name || "Unknown";
      if (!byClient[key]) byClient[key] = [];
      byClient[key].push(row);
    }

    const result: PaymentInsight[] = Object.entries(byClient).map(([name, invs]) => {
      const funded = invs.filter((i) => i.escrow_status === "funded" || i.status === "In escrow" || i.status === "Completed");
      
      // Calculate avg days from created to funded (using updated_at as proxy)
      const daysList = funded.map((i) => {
        const created = new Date(i.created_at).getTime();
        const updated = new Date(i.updated_at).getTime();
        return Math.max(0, Math.round((updated - created) / (1000 * 60 * 60 * 24)));
      }).filter((d) => d < 365); // filter out outliers

      const avgDays = daysList.length > 0
        ? Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length)
        : null;

      const totalPaid = funded.reduce((sum, i) => sum + Number(i.amount || 0), 0);

      return {
        clientName: name,
        invoiceCount: invs.length,
        avgDaysToEscrow: avgDays,
        totalPaid,
        currency: invs[0]?.currency || "USDC",
        lastInvoiceDate: invs[0]?.created_at || "",
      };
    }).sort((a, b) => b.totalPaid - a.totalPaid);

    setInsights(result);
  }

  if (loading) return <LoadingState title="Analytics" detail="Loading analytics..." />;
  if (!analytics) return <EmptyState title="No data" detail="Sign in to see analytics." />;

  const clientChartData = analytics.clientTotals.slice(0, 6).map((c) => ({ label: c.name, value: c.value }));
  const maxClientValue = Math.max(...clientChartData.map((c) => c.value), 1);

  const statusChartData = Object.entries(analytics.statusTotals).map(([label, value]) => ({ label, value }));
  const maxStatusValue = Math.max(...statusChartData.map((s) => s.value), 1);

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const fastestPayer = insights.filter(i => i.avgDaysToEscrow !== null).sort((a, b) => (a.avgDaysToEscrow || 999) - (b.avgDaysToEscrow || 999))[0];

  return (
    <div className="grid gap-4">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total invoices", value: String(analytics.totalInvoices), note: "Saved in your workspace" },
          { label: "Total value", value: `${fmt(analytics.totalValue)} ${analytics.defaultCurrency}`, note: "Across all invoices" },
          { label: "Clients", value: String(analytics.totalClients), note: "Unique client records" },
          { label: "Fastest payer", value: fastestPayer ? `${fastestPayer.avgDaysToEscrow}d` : "—", note: fastestPayer ? fastestPayer.clientName : "No payment data yet" },
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
            <p className="text-[0.88rem] text-[var(--muted)]">No client data yet.</p>
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
                      <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${pct}%` }} />
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

      {/* Payment intelligence */}
      {insights.length > 0 && (
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-1 text-base font-bold tracking-normal">Payment intelligence</h2>
          <p className="mb-4 text-[0.82rem] text-[var(--muted)]">How quickly each client moves from invoice to funded escrow.</p>
          <div className="grid gap-2">
            {insights.map((insight) => (
              <div key={insight.clientName} className="flex flex-wrap items-center gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <div className="flex-1">
                  <div className="text-[0.88rem] font-semibold">{insight.clientName}</div>
                  <div className="text-[0.75rem] text-[var(--muted)]">
                    {insight.invoiceCount} invoice{insight.invoiceCount !== 1 ? "s" : ""}
                    {insight.lastInvoiceDate && ` · Last: ${new Date(insight.lastInvoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[var(--accent)]">
                    {insight.totalPaid > 0 ? `${insight.totalPaid.toLocaleString()} ${insight.currency}` : "—"}
                  </div>
                  <div className="text-[0.75rem] text-[var(--muted)]">
                    {insight.avgDaysToEscrow !== null
                      ? `Avg ${insight.avgDaysToEscrow}d to pay`
                      : "No payments yet"}
                  </div>
                </div>
                <div className={`rounded-full px-3 py-1.5 text-[0.7rem] font-bold ${
                  insight.avgDaysToEscrow === null ? "bg-white/5 text-[var(--muted-2)]"
                  : insight.avgDaysToEscrow <= 1 ? "bg-[rgba(103,213,138,.12)] text-[var(--accent-2)]"
                  : insight.avgDaysToEscrow <= 3 ? "bg-[rgba(201,255,96,.12)] text-[var(--accent)]"
                  : "bg-[rgba(216,196,139,.12)] text-[var(--accent-3)]"
                }`}>
                  {insight.avgDaysToEscrow === null ? "Pending"
                  : insight.avgDaysToEscrow <= 1 ? "Fast payer"
                  : insight.avgDaysToEscrow <= 3 ? "Good"
                  : "Slow"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
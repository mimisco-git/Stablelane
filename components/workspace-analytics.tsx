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
  if (status === "Completed") return "done" as const;
  if (status === "In escrow") return "live" as const;
  if (status === "Sent") return "lock" as const;
  return "neutral" as const;
}

export function WorkspaceAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchWorkspaceAnalytics();
        if (mounted) setAnalytics(data as Analytics | null);
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
    return <LoadingState title="Loading analytics" detail="Stablelane is calculating workspace and client performance from your saved records." />;
  }

  if (!analytics || analytics.totalInvoices === 0) {
    return (
      <EmptyState
        title="No analytics yet"
        detail="Create invoices and save clients first. Stablelane will use those records to build workspace analytics here."
        action={
          <Link href="/app/invoices/new" className="inline-flex rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
            Create invoice
          </Link>
        }
      />
    );
  }

  const cards = [
    { label: "Total invoices", value: String(analytics.totalInvoices), note: "Saved drafts and active invoice records." },
    { label: "Linked invoices", value: String(analytics.linkedInvoices), note: "Invoices currently connected to a saved client record." },
    { label: "Client records", value: String(analytics.totalClients), note: "Saved client entities inside this workspace." },
    { label: "Tracked value", value: `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(analytics.totalValue)} ${analytics.defaultCurrency}`, note: "Recorded invoice value in your default workspace currency." },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
              {card.label}
            </div>
            <strong className="mb-1 block font-[family-name:var(--font-cormorant)] text-[1.85rem] tracking-[-0.04em] text-[var(--text)]">
              {card.value}
            </strong>
            <p className="text-[0.8rem] leading-6 text-[var(--muted)]">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="mb-1 text-base font-bold tracking-normal">Top clients by value</h2>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                The strongest client relationships in your workspace based on saved invoice records.
              </p>
            </div>
            <Link href="/app/clients" className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.82rem] font-semibold text-[var(--text)]">
              Open clients
            </Link>
          </div>

          <div className="grid gap-3">
            {analytics.clientTotals.slice(0, 6).map((client) => (
              <div key={client.name} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <strong>{client.name}</strong>
                  <span className="font-semibold">{new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(client.value)} {analytics.defaultCurrency}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/5">
                  <span
                    className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                    style={{
                      width: `${Math.max(12, analytics.totalValue ? (client.value / analytics.totalValue) * 100 : 12)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-[0.8rem] text-[var(--muted)]">{client.count} invoice record{client.count === 1 ? "" : "s"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Workflow health</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              A quick summary of invoice and escrow movement across the workspace.
            </p>
          </div>

          <div className="grid gap-3">
            {Object.entries(analytics.statusTotals).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                <div className="text-[0.9rem] font-semibold text-[var(--text)]">{status}</div>
                <StatusPill label={`${count}`} tone={toneForStatus(status)} />
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            {Object.entries(analytics.escrowTotals).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                <div className="text-[0.9rem] font-semibold text-[var(--text)]">Escrow: {status}</div>
                <div className="text-[0.88rem] font-semibold text-[var(--muted)]">{count}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Recent linked invoices</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            These are the latest saved invoice records feeding your workspace analytics.
          </p>
        </div>

        <div className="grid gap-3">
          {analytics.recentInvoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/app/invoices/${invoice.id}`}
              className="grid gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 md:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <div className="mb-1 font-semibold">{invoice.client_name}</div>
                <div className="text-[0.8rem] text-[var(--muted)]">{invoice.title}</div>
              </div>
              <div className="text-[0.92rem] font-semibold text-[var(--text)]">
                {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(invoice.amount || 0))} {invoice.currency}
              </div>
              <StatusPill label={invoice.status} tone={toneForStatus(invoice.status)} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

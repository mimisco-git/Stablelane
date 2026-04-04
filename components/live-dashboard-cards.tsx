"use client";

import { useEffect, useState } from "react";
import { fetchInvoiceStatusSummary, fetchDashboardStatsDetailed } from "@/lib/supabase-data";
import { LoadingState } from "@/components/ui-state";

type Stats = {
  workspaceName: string;
  defaultCurrency: string;
  roleType: string;
  clientCount: number;
  draftCount: number;
  totalDraftValue: number;
};

type Summary = {
  total: number;
  draft: number;
  sent: number;
  escrow: number;
  completed: number;
  totalValue: number;
};

export function LiveDashboardCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [statsData, summaryData] = await Promise.all([
          fetchDashboardStatsDetailed(),
          fetchInvoiceStatusSummary(),
        ]);
        if (!mounted) return;
        if (statsData) setStats(statsData as Stats);
        if (summaryData) setSummary(summaryData as Summary);
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
    return <LoadingState title="Loading dashboard metrics" detail="Stablelane is pulling live workspace totals from Supabase." />;
  }

  const cards = [
    {
      label: "Workspace invoices",
      value: String(summary?.total || 0),
      note: "Saved invoice drafts and active records in your workspace.",
    },
    {
      label: "Clients",
      value: String(stats?.clientCount || 0),
      note: "Saved client records linked to your workspace.",
    },
    {
      label: "In escrow",
      value: String(summary?.escrow || 0),
      note: "Invoices currently marked as in escrow.",
    },
    {
      label: `Tracked value`,
      value: `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(summary?.totalValue || 0)} ${stats?.defaultCurrency || "USDC"}`,
      note: "Total recorded value across your saved invoice records.",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((metric) => (
        <div key={metric.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
          <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
            {metric.label}
          </div>
          <strong className="mb-1 block font-[family-name:var(--font-cormorant)] text-[1.9rem] tracking-[-0.04em] text-[var(--text)]">
            {metric.value}
          </strong>
          <p className="text-[0.8rem] leading-6 text-[var(--muted)]">{metric.note}</p>
        </div>
      ))}
    </div>
  );
}

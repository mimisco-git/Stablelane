"use client";

import { useEffect, useState } from "react";
import { fetchDashboardStatsDetailed } from "@/lib/supabase-data";

type Stats = {
  defaultCurrency: string;
  draftCount: number;
  totalDraftValue: number;
  inEscrow: number;
  released: number;
  pendingReleases: number;
  clientCount: number;
  repeatClientCount: number;
};

function fmt(value: number, currency: string) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function DashboardMetricCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDashboardStatsDetailed().then((data) => {
      if (mounted && data) {
        setStats({
          defaultCurrency: data.defaultCurrency,
          draftCount: data.draftCount,
          totalDraftValue: data.totalDraftValue,
          inEscrow: data.inEscrow,
          released: data.released,
          pendingReleases: data.pendingReleases,
          clientCount: data.clientCount,
          repeatClientCount: data.repeatClientCount,
        });
      }
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const cards = stats
    ? [
        {
          label: "Released this month",
          value: fmt(stats.released, stats.defaultCurrency),
          suffix: stats.defaultCurrency,
          note: "Settled stablecoin revenue from completed milestones.",
          highlight: stats.released > 0,
        },
        {
          label: "Locked in escrow",
          value: fmt(stats.inEscrow, stats.defaultCurrency),
          suffix: stats.defaultCurrency,
          note: "Client-committed funds awaiting milestone approval.",
          highlight: false,
        },
        {
          label: "Pending releases",
          value: String(stats.pendingReleases),
          suffix: null,
          note: "Active escrows with funded milestones ready to approve.",
          highlight: stats.pendingReleases > 0,
        },
        {
          label: "Clients",
          value: String(stats.clientCount),
          suffix: stats.repeatClientCount > 0 ? `${stats.repeatClientCount} repeat` : null,
          note: "Saved client records in your workspace.",
          highlight: false,
        },
      ]
    : [
        { label: "Released this month", value: "—", suffix: null, note: "Sign in to see real revenue data.", highlight: false },
        { label: "Locked in escrow", value: "—", suffix: null, note: "Escrow balance from active invoices.", highlight: false },
        { label: "Pending releases", value: "—", suffix: null, note: "Milestones awaiting approval.", highlight: false },
        { label: "Clients", value: "—", suffix: null, note: "Saved client records.", highlight: false },
      ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((metric) => (
        <div
          key={metric.label}
          className={`rounded-[18px] border p-4 ${
            metric.highlight
              ? "border-[var(--line)] bg-[rgba(201,255,96,.06)]"
              : "border-white/8 bg-white/3"
          }`}
        >
          <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
            {metric.label}
          </div>
          <div className="mb-1 flex items-baseline gap-2">
            <strong className={`font-[family-name:var(--font-cormorant)] text-[1.9rem] tracking-[-0.04em] ${
              metric.highlight ? "text-[var(--accent)]" : "text-[var(--text)]"
            }`}>
              {loading ? "—" : metric.value}
            </strong>
            {metric.suffix && !loading && (
              <span className="text-[0.78rem] text-[var(--muted)]">{metric.suffix}</span>
            )}
          </div>
          <p className="text-[0.8rem] leading-6 text-[var(--muted)]">{metric.note}</p>
        </div>
      ))}
    </div>
  );
}

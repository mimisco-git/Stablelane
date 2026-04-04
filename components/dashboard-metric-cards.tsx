"use client";

import { useEffect, useState } from "react";
import { fetchDashboardStatsDetailed } from "@/lib/supabase-data";

export function DashboardMetricCards() {
  const [stats, setStats] = useState<null | {
    workspaceName: string;
    defaultCurrency: string;
    roleType: string;
    clientCount: number;
    draftCount: number;
    totalDraftValue: number;
  }>(null);

  useEffect(() => {
    let mounted = true;
    fetchDashboardStatsDetailed().then((data) => {
      if (mounted && data) {
        setStats({
          workspaceName: data.workspaceName,
          defaultCurrency: data.defaultCurrency,
          roleType: data.roleType,
          clientCount: data.clientCount,
          draftCount: data.draftCount,
          totalDraftValue: data.totalDraftValue,
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const money = stats
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(stats.totalDraftValue)
    : "18,240";

  const cards = stats
    ? [
        { label: "Workspace drafts", value: String(stats.draftCount), note: "Invoice drafts saved in your Supabase workspace." },
        { label: "Saved clients", value: String(stats.clientCount), note: "Client records ready to reuse in invoice creation." },
        { label: "Draft value", value: `${money} ${stats.defaultCurrency}`, note: "Total value across current saved invoice drafts." },
        { label: "Workspace type", value: stats.roleType, note: "Saved in your workspace settings and used as context." },
      ]
    : [
        { label: "Received this month", value: "$18.2k", note: "Settled stablecoin revenue across active invoices." },
        { label: "Locked in escrow", value: "$9.6k", note: "Capital committed by clients but not released yet." },
        { label: "Pending payouts", value: "7", note: "Collaborator splits waiting on release events." },
        { label: "Repeat clients", value: "4", note: "A trust signal that later feeds credibility and financing." },
      ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((metric) => (
        <div key={metric.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
          <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
            {metric.label}
          </div>
          <strong className="mb-1 block font-[family-name:var(--font-cormorant)] text-[1.9rem] tracking-[-0.04em]">
            {metric.value}
          </strong>
          <p className="text-[0.8rem] leading-6 text-[var(--muted)]">{metric.note}</p>
        </div>
      ))}
    </div>
  );
}

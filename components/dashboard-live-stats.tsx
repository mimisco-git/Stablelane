"use client";

import { useEffect, useState } from "react";
import { fetchDashboardStatsDetailed } from "@/lib/supabase-data";

export function DashboardLiveStats() {
  const [stats, setStats] = useState<null | {
    workspaceName: string;
    defaultCurrency: string;
    roleType: string;
    clientCount: number;
    draftCount: number;
    draftValue: number;
    sentOrReady: number;
  }>(null);

  useEffect(() => {
    let mounted = true;
    fetchDashboardStatsDetailed().then((data) => {
      if (mounted && data) setStats(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!stats) return null;

  const formattedValue = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(stats.draftValue);

  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4 text-[0.84rem] leading-6 text-[var(--accent)]">
      <strong>{stats.workspaceName}</strong> is active as a {stats.roleType.toLowerCase()} workspace.
      You now have <strong>{stats.draftCount}</strong> saved invoice drafts worth about <strong>{formattedValue} {stats.defaultCurrency}</strong>,
      plus <strong>{stats.clientCount}</strong> saved client records.
    </div>
  );
}

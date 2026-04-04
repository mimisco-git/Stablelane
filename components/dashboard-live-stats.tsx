"use client";

import { useEffect, useState } from "react";
import { fetchDashboardStats } from "@/lib/supabase-data";

export function DashboardLiveStats() {
  const [stats, setStats] = useState<null | {
    invoiceCount: number;
    clientCount: number;
    workspaceName: string;
    defaultCurrency: string;
  }>(null);

  useEffect(() => {
    let mounted = true;
    fetchDashboardStats().then((data) => {
      if (mounted && data) setStats(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!stats) return null;

  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4 text-[0.84rem] leading-6 text-[var(--accent)]">
      Workspace <strong>{stats.workspaceName}</strong> is active. You currently have <strong>{stats.invoiceCount}</strong> saved invoice drafts and <strong>{stats.clientCount}</strong> client records. Default settlement currency is <strong>{stats.defaultCurrency}</strong>.
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchDashboardStatsDetailed } from "@/lib/supabase-data";
import Link from "next/link";

export function DashboardLiveStats() {
  const [stats, setStats] = useState<{
    workspaceName: string;
    draftCount: number;
    inEscrow: number;
    pendingReleases: number;
    defaultCurrency: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchDashboardStatsDetailed().then((data) => {
      if (mounted && data) {
        setStats({
          workspaceName: data.workspaceName,
          draftCount: data.draftCount,
          inEscrow: data.inEscrow,
          pendingReleases: data.pendingReleases,
          defaultCurrency: data.defaultCurrency,
        });
      }
    });
    return () => { mounted = false; };
  }, []);

  if (!stats) return null;

  if (stats.pendingReleases > 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4">
        <p className="text-[0.84rem] leading-6 text-[var(--accent)]">
          <strong>{stats.pendingReleases}</strong> escrow{stats.pendingReleases > 1 ? "s" : ""} funded and waiting for milestone approval.
        </p>
        <Link
          href="/app/escrows"
          className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.1)] px-4 py-2 text-[0.82rem] font-bold text-[var(--accent)] transition hover:-translate-y-px"
        >
          Review escrows
        </Link>
      </div>
    );
  }

  if (stats.inEscrow > 0) {
    return (
      <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.06)] p-4 text-[0.84rem] leading-6 text-[var(--accent)]">
        <strong>{stats.workspaceName}</strong> has{" "}
        <strong>{stats.inEscrow.toLocaleString()} {stats.defaultCurrency}</strong> locked in active escrows.
      </div>
    );
  }

  if (stats.draftCount > 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/3 p-4">
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          <strong className="text-[var(--text)]">{stats.workspaceName}</strong> has {stats.draftCount} invoice {stats.draftCount === 1 ? "draft" : "drafts"} saved.
          Send payment links to clients to lock funds in escrow.
        </p>
        <Link
          href="/app/invoices/new"
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.82rem] font-bold text-[#08100b] transition hover:-translate-y-px"
        >
          Create invoice
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/3 p-4">
      <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
        Welcome to <strong className="text-[var(--text)]">{stats.workspaceName}</strong>. Create your first invoice to get started.
      </p>
      <Link
        href="/app/invoices/new"
        className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.82rem] font-bold text-[#08100b] transition hover:-translate-y-px"
      >
        Create invoice
      </Link>
    </div>
  );
}

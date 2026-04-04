"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { fetchDashboardStatsDetailed } from "@/lib/supabase-data";

type RecentRow = {
  id?: string;
  title: string;
  client_name: string;
  currency: "USDC" | "EURC";
  created_at: string;
  amount?: number | null;
};

export function RecentInvoicesLive() {
  const [rows, setRows] = useState<RecentRow[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchDashboardStatsDetailed().then((data) => {
      if (mounted && data?.recent) {
        setRows(data.recent as RecentRow[]);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
        Your saved workspace invoices will appear here once you create a few drafts.
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      {rows.map((invoice, index) => (
        <div
          key={`${invoice.title}-${index}`}
          className="grid items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 md:grid-cols-[1fr_auto_auto]"
        >
          <div>
            <strong className="mb-1 block">{invoice.client_name}</strong>
            <small className="text-[0.8rem] text-[var(--muted)]">
              {invoice.title} · saved draft
            </small>
          </div>
          <div className="text-[0.92rem] font-extrabold">
            {invoice.currency === "EURC" ? "€" : "$"}{invoice.amount ?? 0}
          </div>
          <StatusPill label="Draft" tone="neutral" />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type OverdueInvoice = {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  currency: string;
  due_date: string;
  daysOverdue: number;
};

export function OverdueBanner() {
  const [overdue, setOverdue] = useState<OverdueInvoice[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("invoice_drafts")
      .select("id,title,client_name,amount,currency,due_date,status")
      .eq("owner_id", user.id)
      .not("due_date", "is", null)
      .lt("due_date", today)
      .in("status", ["Draft", "Sent"])
      .order("due_date", { ascending: true })
      .limit(5);

    if (!data?.length) return;

    const now = Date.now();
    setOverdue(
      data.map((row: any) => ({
        id: row.id,
        title: row.title,
        client_name: row.client_name,
        amount: Number(row.amount || 0),
        currency: row.currency,
        due_date: row.due_date,
        daysOverdue: Math.floor((now - new Date(row.due_date).getTime()) / (1000 * 60 * 60 * 24)),
      }))
    );
  }

  if (!overdue.length) return null;

  return (
    <div className="rounded-[20px] border border-[rgba(224,82,82,.3)] bg-[rgba(224,82,82,.06)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="text-[0.8rem] font-bold uppercase tracking-[0.1em] text-red-400">
          {overdue.length} overdue invoice{overdue.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid gap-2">
        {overdue.map((inv) => (
          <Link
            key={inv.id}
            href={`/app/invoices/${inv.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition hover:border-white/12"
          >
            <div>
              <div className="text-[0.88rem] font-semibold">{inv.title}</div>
              <div className="text-[0.75rem] text-[var(--muted)]">
                {inv.client_name} · Due {inv.due_date}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">
                {inv.amount.toLocaleString()} {inv.currency}
              </span>
              <span className="rounded-full bg-[rgba(224,82,82,.15)] px-2.5 py-1 text-[0.72rem] font-bold text-red-400">
                {inv.daysOverdue}d overdue
              </span>
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-3 text-[0.75rem] text-[var(--muted)]">
        Send a payment reminder from the invoice page to follow up with your client.
      </p>
    </div>
  );
}
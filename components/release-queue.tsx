"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { RemoteInvoiceDraftRow } from "@/lib/types";

export function ReleaseQueue() {
  const [items, setItems] = useState<RemoteInvoiceDraftRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("invoice_drafts")
      .select("id,title,client_name,amount,currency,escrow_status,escrow_address,milestones")
      .eq("owner_id", user.id)
      .eq("escrow_status", "funded")
      .order("updated_at", { ascending: false })
      .limit(5);

    setItems((data || []) as RemoteInvoiceDraftRow[]);
    setLoading(false);
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Release queue</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Funded escrows awaiting milestone approval.
          </p>
        </div>
        <Link
          href="/app/escrows"
          className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]"
        >
          All escrows
        </Link>
      </div>

      {loading ? (
        <div className="py-6 text-center text-[0.85rem] text-[var(--muted)]">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center">
          <div className="mb-2 text-2xl opacity-20">◈</div>
          <p className="mb-3 text-[0.88rem] text-[var(--muted)]">No funded escrows waiting. Send an invoice and ask your client to fund escrow.</p>
          <Link href="/app/invoices/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.82rem] font-bold text-[#08100b]">
            Create invoice
          </Link>
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((item) => {
            const milestoneCount = Array.isArray(item.milestones) ? item.milestones.length : 0;
            return (
              <Link
                key={item.id}
                href={`/app/invoices/${item.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.04)] px-4 py-3 transition hover:bg-[rgba(201,255,96,.07)]"
              >
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-[0.78rem] text-[var(--muted)]">
                    {item.client_name} · {milestoneCount} milestone{milestoneCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--accent)]">
                    {Number(item.amount || 0).toLocaleString()} {item.currency}
                  </span>
                  <span className="rounded-full bg-[rgba(201,255,96,.15)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                    Ready to release
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
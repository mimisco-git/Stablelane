"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { invoicesTable } from "@/lib/mock-data";
import { readLocalInvoices } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { InvoiceDraft, RemoteInvoiceDraftRow } from "@/lib/types";

type FilterKey = "All" | "Draft" | "Sent" | "In escrow" | "Completed";

const filters: FilterKey[] = ["All", "Draft", "Sent", "In escrow", "Completed"];

function draftToRow(draft: InvoiceDraft) {
  const symbol = draft.currency === "EURC" ? "€" : "$";
  return {
    id: draft.id,
    title: `${draft.clientName} · ${draft.title}`,
    client: draft.clientName,
    currency: draft.currency,
    total: `${symbol}${draft.amount || "0"}`,
    status: "Draft",
    dueDate: draft.dueDate || "Not set",
    paymentMode: draft.paymentMode,
    funded: "Not funded yet",
    createdAt: draft.createdAt,
    source: "local" as const,
  };
}

function remoteToRow(row: RemoteInvoiceDraftRow) {
  const symbol = row.currency === "EURC" ? "€" : "$";
  return {
    id: row.id,
    title: `${row.client_name} · ${row.title}`,
    client: row.client_name,
    currency: row.currency,
    total: `${symbol}${row.amount ?? 0}`,
    status: "Draft",
    dueDate: row.due_date || "Not set",
    paymentMode: row.payment_mode,
    funded: "Not funded yet",
    createdAt: row.created_at,
    source: "supabase" as const,
  };
}

export function InvoicesBoard() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [filter, setFilter] = useState<FilterKey>("All");
  const [localDrafts, setLocalDrafts] = useState<InvoiceDraft[]>([]);
  const [remoteDrafts, setRemoteDrafts] = useState<RemoteInvoiceDraftRow[]>([]);
  const [sessionEmail, setSessionEmail] = useState("");

  useEffect(() => {
    setLocalDrafts(readLocalInvoices());
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRemote() {
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      setSessionEmail(session?.user?.email || "");
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("invoice_drafts")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) return;
      setRemoteDrafts((data || []) as RemoteInvoiceDraftRow[]);
    }

    loadRemote();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadRemote();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const rows = useMemo(() => {
    const merged = [
      ...remoteDrafts.map(remoteToRow),
      ...localDrafts.map(draftToRow),
      ...invoicesTable.map((item) => ({ ...item, source: "mock" as const })),
    ];

    if (filter === "All") return merged;
    return merged.filter((item) => item.status === filter);
  }, [filter, localDrafts, remoteDrafts]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Supabase drafts", value: String(remoteDrafts.length) },
          { label: "Local drafts", value: String(localDrafts.length) },
          { label: "All invoices", value: String(remoteDrafts.length + localDrafts.length + invoicesTable.length) },
          { label: "Waiting on action", value: String(invoicesTable.filter((item) => item.status === "Sent" || item.status === "In escrow").length) },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-[0.84rem] ${
                filter === item
                  ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
                  : "border border-white/8 bg-white/3 text-[var(--muted)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <Link href="/app/invoices/new" className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
          Create invoice
        </Link>
      </div>

      {sessionEmail ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] leading-6 text-[var(--accent)]">
          Signed in as {sessionEmail}. Supabase draft invoices are loaded first, then local browser drafts, then seeded demo rows.
        </div>
      ) : localDrafts.length ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] leading-6 text-[var(--accent)]">
          Local draft invoices are loaded from your browser in this test build. Sign in to start saving them to Supabase.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[22px] border border-white/8 bg-white/3">
        <div className="grid gap-3 border-b border-white/8 px-4 py-3 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)] md:grid-cols-[1.55fr_.55fr_.55fr_.7fr_.6fr_.65fr_.45fr]">
          <div>Invoice</div>
          <div>Source</div>
          <div>Currency</div>
          <div>Total</div>
          <div>Status</div>
          <div>Due</div>
          <div />
        </div>

        {rows.map((invoice) => (
          <div
            key={invoice.id}
            className="grid gap-3 border-b border-white/8 px-4 py-4 last:border-b-0 hover:bg-white/3 md:grid-cols-[1.55fr_.55fr_.55fr_.7fr_.6fr_.65fr_.45fr]"
          >
            <div>
              <div className="font-semibold">{invoice.title}</div>
              <div className="text-[0.8rem] text-[var(--muted)]">Funded: {invoice.funded}</div>
            </div>
            <div className="text-[0.8rem] text-[var(--muted)]">{invoice.source}</div>
            <div className="text-[var(--muted)]">{invoice.currency}</div>
            <div className="font-semibold">{invoice.total}</div>
            <div>
              <StatusPill
                label={invoice.status}
                tone={
                  invoice.status === "Draft"
                    ? "neutral"
                    : invoice.status === "Sent"
                      ? "lock"
                      : invoice.status === "In escrow"
                        ? "live"
                        : "done"
                }
              />
            </div>
            <div className="text-[var(--muted)]">{invoice.dueDate}</div>
            <div className="text-right">
              <Link
                href={invoice.source === "mock" ? `/app/invoices/${invoice.id}` : "/app/invoices/new"}
                className="text-[0.82rem] font-semibold text-[var(--accent)]"
              >
                Open
              </Link>
            </div>
          </div>
        ))}

        {!rows.length ? (
          <div className="px-4 py-10 text-center text-[0.9rem] text-[var(--muted)]">
            No invoices match this filter yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

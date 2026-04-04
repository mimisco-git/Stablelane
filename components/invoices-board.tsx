"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { invoicesTable } from "@/lib/mock-data";
import { readLocalInvoices } from "@/lib/storage";
import type { InvoiceDraft } from "@/lib/types";

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

export function InvoicesBoard() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [localDrafts, setLocalDrafts] = useState<InvoiceDraft[]>([]);

  useEffect(() => {
    setLocalDrafts(readLocalInvoices());
  }, []);

  const rows = useMemo(() => {
    const merged = [...localDrafts.map(draftToRow), ...invoicesTable.map((item) => ({ ...item, source: "mock" as const }))];
    if (filter === "All") return merged;
    return merged.filter((item) => item.status === filter);
  }, [filter, localDrafts]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Local drafts", value: String(localDrafts.length) },
          { label: "All invoices", value: String([...localDrafts, ...invoicesTable].length) },
          { label: "Escrow-linked", value: String(invoicesTable.filter((item) => item.paymentMode.includes("escrow")).length) },
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

      {localDrafts.length ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] leading-6 text-[var(--accent)]">
          Local draft invoices are loaded from your browser in this test build. They are only visible on this device until Supabase is connected.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[22px] border border-white/8 bg-white/3">
        <div className="grid gap-3 border-b border-white/8 px-4 py-3 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)] md:grid-cols-[1.55fr_.45fr_.55fr_.7fr_.6fr_.65fr_.45fr]">
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
            className="grid gap-3 border-b border-white/8 px-4 py-4 last:border-b-0 hover:bg-white/3 md:grid-cols-[1.55fr_.45fr_.55fr_.7fr_.6fr_.65fr_.45fr]"
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
                href={invoice.source === "local" ? "/app/invoices/new" : `/app/invoices/${invoice.id}`}
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

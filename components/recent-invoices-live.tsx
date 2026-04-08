"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { EmptyState } from "@/components/ui-state";
import { fetchRemoteInvoiceDrafts } from "@/lib/supabase-data";
import { readLocalInvoices } from "@/lib/storage";
import type { InvoiceDraft, RemoteInvoiceDraftRow } from "@/lib/types";

type Item = {
  id: string;
  client: string;
  title: string;
  amount: string;
  status: string;
  source: "workspace" | "browser";
};

function normalizeRemote(row: RemoteInvoiceDraftRow): Item {
  const symbol = row.currency === "EURC" ? "€" : "$";
  return {
    id: row.id,
    client: row.client_name || "Unnamed client",
    title: row.title || "Untitled invoice",
    amount: `${symbol}${row.amount ?? 0}`,
    status: row.status || "Draft",
    source: "workspace",
  };
}

function normalizeLocal(row: InvoiceDraft): Item {
  const symbol = row.currency === "EURC" ? "€" : "$";
  return {
    id: row.id,
    client: row.clientName || "Unnamed client",
    title: row.title || "Untitled invoice",
    amount: `${symbol}${row.amount || 0}`,
    status: row.status || "Draft",
    source: "browser",
  };
}

function toneFor(status: string) {
  if (status === "Released" || status === "Completed") return "done" as const;
  if (status === "In escrow" || status === "Partially released") return "live" as const;
  if (status === "Awaiting escrow" || status === "Sent") return "lock" as const;
  return "neutral" as const;
}

export function RecentInvoicesLive() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const local = readLocalInvoices().slice(0, 6).map(normalizeLocal);
      try {
        const remote = (await fetchRemoteInvoiceDrafts()).slice(0, 6).map(normalizeRemote);
        if (mounted) setItems([...remote, ...local].slice(0, 6));
      } catch {
        if (mounted) setItems(local);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!items.length) {
    return (
      <EmptyState
        title="No invoices yet"
        detail="No saved invoices were found in the workspace or this browser yet."
        action={
          <Link
            href="/app/invoices/new"
            className="inline-flex rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
          >
            Create invoice
          </Link>
        }
      />
    );
  }

  return (
    <>
      {items.map((invoice) => (
        <Link
          key={invoice.id}
          href={`/app/invoices/${invoice.id}`}
          className="grid items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 md:grid-cols-[1fr_auto_auto]"
        >
          <div>
            <strong className="mb-1 block">{invoice.client}</strong>
            <small className="text-[0.8rem] text-[var(--muted)]">
              {invoice.title}
            </small>
          </div>
          <div className="text-[0.92rem] font-extrabold">{invoice.amount}</div>
          <StatusPill label={invoice.status} tone={toneFor(invoice.status)} />
        </Link>
      ))}
    </>
  );
}

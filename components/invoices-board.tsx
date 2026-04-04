"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { invoicesTable } from "@/lib/mock-data";
import { readLocalInvoices } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { fetchClients, fetchRemoteInvoiceDrafts } from "@/lib/supabase-data";
import type { ClientRecord, InvoiceDraft, RemoteInvoiceDraftRow } from "@/lib/types";

type FilterKey = "All" | "Draft" | "Sent" | "In escrow" | "Completed";

type BoardRow = {
  id: string;
  title: string;
  clientName: string;
  clientId: string | null;
  currency: "USDC" | "EURC";
  total: string;
  status: FilterKey;
  dueDate: string;
  funded: string;
  source: "workspace" | "browser" | "sample";
};

const filters: FilterKey[] = ["All", "Draft", "Sent", "In escrow", "Completed"];

function formatAmount(currency: "USDC" | "EURC", amount: string | number | null | undefined) {
  const symbol = currency === "EURC" ? "€" : "$";
  const normalized = typeof amount === "number" ? amount : Number(amount || 0);
  return `${symbol}${normalized}`;
}

function draftToRow(draft: InvoiceDraft): BoardRow {
  return {
    id: draft.id,
    title: draft.title,
    clientName: draft.clientName || "Unnamed client",
    clientId: draft.clientId || null,
    currency: draft.currency,
    total: formatAmount(draft.currency, draft.amount),
    status: draft.status,
    dueDate: draft.dueDate || "Not set",
    funded: draft.fundingTxHash ? "Funding tx saved" : "Not funded yet",
    source: "browser",
  };
}

function remoteToRow(row: RemoteInvoiceDraftRow): BoardRow {
  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name || "Unnamed client",
    clientId: row.client_id || null,
    currency: row.currency,
    total: formatAmount(row.currency, row.amount),
    status: row.status,
    dueDate: row.due_date || "Not set",
    funded: row.funding_tx_hash ? "Funding tx saved" : "Not funded yet",
    source: "workspace",
  };
}

export function InvoicesBoard() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [statusFilter, setStatusFilter] = useState<FilterKey>("All");
  const [clientFilter, setClientFilter] = useState("all");
  const [localDrafts, setLocalDrafts] = useState<InvoiceDraft[]>([]);
  const [remoteDrafts, setRemoteDrafts] = useState<RemoteInvoiceDraftRow[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [sessionEmail, setSessionEmail] = useState("");

  useEffect(() => {
    setLocalDrafts(readLocalInvoices());
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAll() {
      try {
        const clientRows = await fetchClients();
        if (active) setClients(clientRows);
      } catch {
        if (active) setClients([]);
      }

      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;
      setSessionEmail(session?.user?.email || "");

      if (!session?.user) {
        setRemoteDrafts([]);
        return;
      }

      try {
        const data = await fetchRemoteInvoiceDrafts();
        if (active) setRemoteDrafts(data);
      } catch {
        if (active) setRemoteDrafts([]);
      }
    }

    loadAll();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAll();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const rows = useMemo(() => {
    const merged: BoardRow[] = [
      ...remoteDrafts.map(remoteToRow),
      ...localDrafts.map(draftToRow),
      ...invoicesTable.map((item) => ({
        id: item.id,
        title: item.title,
        clientName: item.client,
        clientId: null,
        currency: item.currency,
        total: item.total,
        status: item.status as FilterKey,
        dueDate: item.dueDate,
        funded: item.funded,
        source: "sample" as const,
      })),
    ];

    return merged.filter((row) => {
      const statusOk = statusFilter === "All" ? true : row.status === statusFilter;
      const clientOk =
        clientFilter === "all"
          ? true
          : clientFilter === "unlinked"
            ? !row.clientId
            : row.clientId === clientFilter || row.clientName === clientFilter;
      return statusOk && clientOk;
    });
  }, [statusFilter, clientFilter, localDrafts, remoteDrafts]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Workspace drafts", value: String(remoteDrafts.length) },
          { label: "Browser drafts", value: String(localDrafts.length) },
          { label: "Linked to clients", value: String([...remoteDrafts, ...localDrafts].filter((item) => Boolean(("client_id" in item ? item.client_id : item.clientId) || null)).length) },
          { label: "Client records", value: String(clients.length) },
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
              onClick={() => setStatusFilter(item)}
              className={`rounded-full px-4 py-2 text-[0.84rem] ${
                statusFilter === item
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

      <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
        <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
          <span>Client scope</span>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
          >
            <option value="all">All clients</option>
            <option value="unlinked">Only unlinked invoices</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.client_name} · {client.client_email}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sessionEmail ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] leading-6 text-[var(--accent)]">
          Signed in as {sessionEmail}. Invoice filtering is now client-scoped, so you can isolate one client relationship or find unlinked drafts that still need cleanup.
        </div>
      ) : localDrafts.length ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] leading-6 text-[var(--accent)]">
          Browser drafts are only visible on this device. Sign in to save the next ones to your workspace.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[22px] border border-white/8 bg-white/3">
        <div className="grid gap-3 border-b border-white/8 px-4 py-3 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)] md:grid-cols-[1.25fr_.9fr_.55fr_.65fr_.6fr_.65fr_.45fr]">
          <div>Invoice</div>
          <div>Client</div>
          <div>Source</div>
          <div>Total</div>
          <div>Status</div>
          <div>Due</div>
          <div />
        </div>

        {rows.map((invoice) => (
          <div
            key={invoice.id}
            className="grid gap-3 border-b border-white/8 px-4 py-4 last:border-b-0 hover:bg-white/3 md:grid-cols-[1.25fr_.9fr_.55fr_.65fr_.6fr_.65fr_.45fr]"
          >
            <div>
              <div className="font-semibold">{invoice.title}</div>
              <div className="text-[0.8rem] text-[var(--muted)]">{invoice.funded}</div>
            </div>
            <div className="text-[0.84rem] text-[var(--muted)]">{invoice.clientName}</div>
            <div className="text-[0.8rem] text-[var(--muted)]">{invoice.source}</div>
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
              <Link href={`/app/invoices/${invoice.id}`} className="text-[0.82rem] font-semibold text-[var(--accent)]">
                Open
              </Link>
            </div>
          </div>
        ))}

        {!rows.length ? (
          <div className="px-4 py-10 text-center text-[0.9rem] text-[var(--muted)]">
            No invoices match the current filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}

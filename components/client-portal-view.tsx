"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { RemoteInvoiceDraftRow } from "@/lib/types";

type ClientInfo = {
  id: string;
  client_name: string;
  client_email: string;
  client_wallet: string | null;
  notes: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Completed" ? "bg-[rgba(103,213,138,.12)] text-[var(--accent-2)]"
    : status === "In escrow" ? "bg-[rgba(201,255,96,.12)] text-[var(--accent)]"
    : status === "Sent" ? "bg-[rgba(216,196,139,.12)] text-[var(--accent-3)]"
    : "bg-white/5 text-[var(--muted)]";
  return (
    <span className={`rounded-full px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${tone}`}>
      {status}
    </span>
  );
}

export function ClientPortalView({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [invoices, setInvoices] = useState<RemoteInvoiceDraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    load();
  }, [clientId]);

  async function load() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }

    // Fetch client by ID (public read)
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

    if (!clientData) { setNotFound(true); setLoading(false); return; }
    setClient(clientData as ClientInfo);

    // Fetch all invoices for this client
    const { data: invoiceData } = await supabase
      .from("invoice_drafts")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    setInvoices((invoiceData || []) as RemoteInvoiceDraftRow[]);
    setLoading(false);
  }

  const totalValue = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const inEscrow = invoices.filter((inv) => inv.status === "In escrow").reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const completed = invoices.filter((inv) => inv.status === "Completed").reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-[0.9rem] text-[var(--muted)]">Loading client portal...</p>
        </div>
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl opacity-20">◈</div>
          <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-3xl">Client not found</h1>
          <p className="text-[var(--muted)]">This client portal link may be invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Nav */}
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between">
        <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold">
          Stablelane<span className="text-[var(--accent)]">.</span>
        </span>
        <span className="rounded-full border border-white/8 bg-white/3 px-3 py-1.5 text-[0.75rem] font-bold text-[var(--muted)]">
          Client portal
        </span>
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Client card */}
        <div className="mb-6 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.92),rgba(10,18,13,.88))] p-6 shadow-[0_28px_90px_rgba(0,0,0,.38)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">Client</div>
              <h1 className="font-[family-name:var(--font-cormorant)] text-4xl tracking-[-0.04em]">{client.client_name}</h1>
              <p className="text-[0.88rem] text-[var(--muted)]">{client.client_email}</p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-2xl font-bold text-[var(--accent)]">
              {client.client_name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total invoiced", value: `${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDC` },
              { label: "In escrow", value: `${inEscrow.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDC` },
              { label: "Settled", value: `${completed.toLocaleString("en-US", { maximumFractionDigits: 0 })} USDC` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                <div className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">{s.label}</div>
                <div className="font-[family-name:var(--font-cormorant)] text-[1.5rem] tracking-[-0.04em] text-[var(--accent)]">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.88),rgba(10,18,13,.82))] p-6">
          <h2 className="mb-4 text-base font-bold">All invoices</h2>
          {invoices.length === 0 ? (
            <p className="text-[0.88rem] text-[var(--muted)]">No invoices yet for this client.</p>
          ) : (
            <div className="grid gap-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{inv.title}</div>
                      <div className="text-[0.8rem] text-[var(--muted)]">
                        {new Date(inv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {inv.due_date && ` · Due ${inv.due_date}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{Number(inv.amount || 0).toLocaleString()} {inv.currency}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                  {inv.description && (
                    <p className="mb-3 text-[0.82rem] leading-6 text-[var(--muted)]">{inv.description}</p>
                  )}
                  {Array.isArray(inv.milestones) && inv.milestones.length > 0 && (
                    <div className="grid gap-1.5">
                      {inv.milestones.map((m: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem]">
                          <span className="text-[var(--muted)]">{m.title || `Milestone ${i + 1}`}</span>
                          <span className="font-semibold">{m.amount} {inv.currency}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(inv.status === "Draft" || inv.status === "Sent") && (
                    <div className="mt-3">
                      <Link
                        href={`/pay/${inv.id}`}
                        className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-2.5 text-[0.85rem] font-bold text-[#08100b] transition hover:-translate-y-px"
                      >
                        Pay invoice
                      </Link>
                    </div>
                  )}
                  {inv.escrow_address && (
                    <div className="mt-3">
                      <a
                        href={`https://testnet.arcscan.app/address/${inv.escrow_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.78rem] text-[var(--accent)] underline underline-offset-2"
                      >
                        View escrow on Arc ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[0.75rem] text-[var(--muted)]">
          Powered by Stablelane · Stablecoin revenue on Arc testnet
        </p>
      </div>
    </div>
  );
}
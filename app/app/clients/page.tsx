"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ClientsManager } from "@/components/clients-manager";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import Link from "next/link";

type ClientStat = {
  id: string;
  client_name: string;
  client_email: string;
  client_wallet: string | null;
  totalInvoiced: number;
  inEscrow: number;
  settled: number;
  invoiceCount: number;
  currency: string;
};

export default function ClientsPage() {
  const [stats, setStats] = useState<ClientStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "stats">("list");

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: clients }, { data: invoices }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("invoice_drafts").select("client_id,amount,currency,status,escrow_status").eq("owner_id", user.id),
    ]);

    if (!clients) { setLoading(false); return; }

    const invoicesByClient = (invoices || []).reduce<Record<string, NonNullable<typeof invoices>>>((acc, inv) => {
      if (!inv.client_id) return acc;
      if (!acc[inv.client_id]) acc[inv.client_id] = [];
      acc[inv.client_id].push(inv);
      return acc;
    }, {});

    const result: ClientStat[] = clients.map((c: any) => {
      const invs = invoicesByClient[c.id] || [];
      const total = invs.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
      const escrow = invs.filter((i: any) => i.status === "In escrow" || i.escrow_status === "funded").reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
      const settled = invs.filter((i: any) => i.status === "Completed" || i.escrow_status === "released").reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
      return {
        id: c.id,
        client_name: c.client_name,
        client_email: c.client_email,
        client_wallet: c.client_wallet,
        totalInvoiced: total,
        inEscrow: escrow,
        settled,
        invoiceCount: invs.length,
        currency: invs[0]?.currency || "USDC",
      };
    });

    setStats(result.sort((a, b) => b.totalInvoiced - a.totalInvoiced));
    setLoading(false);
  }

  const tabClass = (t: typeof view) =>
    `px-4 py-2 rounded-xl text-[0.85rem] font-semibold transition ${
      view === t ? "bg-[var(--accent)] text-[#08100b]" : "text-[var(--muted)] hover:bg-white/5"
    }`;

  return (
    <DashboardShell
      currentPath="/app/clients"
      title="Clients"
      description="Manage your client records, view revenue per client, and share portal links."
      badge="Clients"
    >
      <div className="grid gap-4">
        {/* Tab toggle */}
        <div className="flex gap-2 rounded-[16px] border border-white/8 bg-white/3 p-2">
          <button className={tabClass("list")} onClick={() => setView("list")}>Client list</button>
          <button className={tabClass("stats")} onClick={() => setView("stats")}>Revenue breakdown</button>
        </div>

        {view === "list" && <ClientsManager />}

        {view === "stats" && (
          <div className="grid gap-3">
            {loading ? (
              <div className="py-10 text-center text-[0.9rem] text-[var(--muted)]">Loading...</div>
            ) : stats.length === 0 ? (
              <div className="rounded-[20px] border border-white/8 bg-white/3 p-10 text-center">
                <div className="mb-2 text-3xl opacity-20">◎</div>
                <p className="text-[0.88rem] text-[var(--muted)]">No clients yet. Add your first client to see revenue data.</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Total clients", value: stats.length },
                    { label: "Total invoiced", value: `${stats.reduce((s, c) => s + c.totalInvoiced, 0).toLocaleString()} USDC` },
                    { label: "Total settled", value: `${stats.reduce((s, c) => s + c.settled, 0).toLocaleString()} USDC` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
                      <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{s.label}</div>
                      <div className="font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em] text-[var(--accent)]">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Client cards */}
                {stats.map((client) => (
                  <div key={client.id} className="rounded-[20px] border border-white/8 bg-white/3 p-5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-base font-bold text-[var(--accent)]">
                          {client.client_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{client.client_name}</div>
                          <div className="text-[0.78rem] text-[var(--muted)]">{client.client_email}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/app/invoices?client=${encodeURIComponent(client.client_name)}`} className="rounded-xl border border-white/8 bg-white/3 px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]">
                          {client.invoiceCount} invoice{client.invoiceCount !== 1 ? "s" : ""}
                        </Link>
                        <button
                          onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/client/${client.id}`); }}
                          className="rounded-xl border border-[var(--line)] bg-[rgba(201,255,96,.06)] px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--accent)] transition hover:bg-[rgba(201,255,96,.1)]"
                        >
                          Portal ↗
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        { label: "Total invoiced", value: client.totalInvoiced, tone: "text-[var(--text)]" },
                        { label: "In escrow", value: client.inEscrow, tone: "text-[var(--accent)]" },
                        { label: "Settled", value: client.settled, tone: "text-[var(--accent-2)]" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
                          <div className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">{s.label}</div>
                          <div className={`font-[family-name:var(--font-cormorant)] text-[1.4rem] tracking-[-0.04em] ${s.tone}`}>
                            {s.value.toLocaleString()} {client.currency}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
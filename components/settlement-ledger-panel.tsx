"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { StatusPill } from "@/components/status-pill";

type LedgerEntry = {
  id: string;
  title: string;
  client_name: string;
  amount: number;
  currency: string;
  status: string;
  escrow_status: string | null;
  escrow_address: string | null;
  created_at: string;
  updated_at: string;
};

export function SettlementLedgerPanel() {
  const [rows, setRows] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "settled" | "escrow" | "pending">("all");

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
      .select("id,title,client_name,amount,currency,status,escrow_status,escrow_address,created_at,updated_at")
      .eq("owner_id", user.id)
      .not("status", "eq", "Draft")
      .order("updated_at", { ascending: false });

    setRows((data || []) as LedgerEntry[]);
    setLoading(false);
  }

  const filtered = rows.filter((r) => {
    if (filter === "settled") return r.status === "Completed" || r.escrow_status === "released";
    if (filter === "escrow") return r.escrow_status === "funded" || r.status === "In escrow";
    if (filter === "pending") return r.status === "Sent";
    return true;
  });

  const totalSettled = rows
    .filter((r) => r.status === "Completed" || r.escrow_status === "released")
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  const totalEscrow = rows
    .filter((r) => r.escrow_status === "funded" || r.status === "In escrow")
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  function tone(r: LedgerEntry) {
    if (r.status === "Completed" || r.escrow_status === "released") return "done" as const;
    if (r.status === "In escrow" || r.escrow_status === "funded") return "live" as const;
    if (r.status === "Sent") return "lock" as const;
    return "neutral" as const;
  }

  const tabClass = (t: typeof filter) =>
    `px-3 py-2 rounded-xl text-[0.82rem] font-semibold transition ${
      filter === t ? "bg-[var(--accent)] text-[#08100b]" : "text-[var(--muted)] hover:bg-white/5"
    }`;

  return (
    <div className="grid gap-4">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total entries", value: rows.length, note: "Non-draft invoices" },
          { label: "Settled", value: `${totalSettled.toLocaleString()} USDC`, note: "Completed on-chain" },
          { label: "In escrow", value: `${totalEscrow.toLocaleString()} USDC`, note: "Locked, pending release" },
        ].map((s) => (
          <div key={s.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{s.label}</div>
            <div className="font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em] text-[var(--accent)]">{s.value}</div>
            <div className="text-[0.75rem] text-[var(--muted)]">{s.note}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 rounded-[16px] border border-white/8 bg-white/3 p-2">
        {(["all", "settled", "escrow", "pending"] as const).map((t) => (
          <button key={t} className={tabClass(t)} onClick={() => setFilter(t)}>
            {t === "all" ? `All (${rows.length})` : t === "settled" ? "Settled" : t === "escrow" ? "In escrow" : "Pending"}
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="py-10 text-center text-[0.9rem] text-[var(--muted)]">Loading ledger...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[20px] border border-white/8 bg-white/3 p-10 text-center">
          <div className="mb-2 text-3xl opacity-20">◌</div>
          <p className="text-[0.88rem] text-[var(--muted)]">No entries yet. Send invoices to start building your revenue ledger.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((row) => (
            <Link
              key={row.id}
              href={`/app/invoices/${row.id}`}
              className="grid items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:border-white/12 md:grid-cols-[1fr_auto_auto_auto]"
            >
              <div>
                <div className="font-semibold">{row.title}</div>
                <div className="text-[0.78rem] text-[var(--muted)]">
                  {row.client_name} · {new Date(row.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div className="font-semibold">{Number(row.amount || 0).toLocaleString()} {row.currency}</div>
              {row.escrow_address && (
                <div className="hidden font-mono text-[0.72rem] text-[var(--muted)] md:block">
                  {row.escrow_address.slice(0, 8)}...{row.escrow_address.slice(-4)}
                </div>
              )}
              <StatusPill label={row.status} tone={tone(row)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchSettlementLedger } from "@/lib/supabase-data";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type LedgerEntry = {
  id: string;
  invoice_id: string | null;
  entry_type: "gateway_deposit" | "escrow_funding" | "release" | "crosschain" | "manual";
  amount: number | null;
  currency: "USDC" | "EURC";
  tx_hash: string | null;
  target_address: string | null;
  note: string | null;
  created_at: string;
};

function toneFor(type: LedgerEntry["entry_type"]) {
  if (type === "release") return "done" as const;
  if (type === "gateway_deposit" || type === "escrow_funding") return "live" as const;
  return "neutral" as const;
}

export function SettlementLedgerPanel() {
  const { network } = useAppEnvironment();
  const [rows, setRows] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchSettlementLedger(120);
        if (mounted) setRows(data as LedgerEntry[]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const totals = rows.reduce(
      (acc, row) => {
        const amount = Number(row.amount || 0);
        if (row.entry_type === "release") acc.released += amount;
        else acc.locked += amount;
        return acc;
      },
      { locked: 0, released: 0 }
    );

    return {
      entries: rows.length,
      locked: totals.locked,
      released: totals.released,
    };
  }, [rows]);

  if (loading) {
    return <LoadingState title="Loading settlement ledger" detail="Stablelane is reading database-backed settlement entries." />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No ledger entries yet"
        detail="As Gateway deposits, funding actions, and releases happen, they will be written into the settlement ledger."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Ledger entries", value: String(summary.entries) },
          { label: "Locked value", value: `$${summary.locked.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
          { label: "Released value", value: `$${summary.released.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</strong>
          </div>
        ))}
      </div>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Settlement ledger</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            A database-backed ledger of deposits, escrow funding, releases, and other stablecoin settlement events.
          </p>
        </div>

        <div className="grid gap-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-[var(--text)]">{row.entry_type.replaceAll("_", " ")}</div>
                  <div className="text-[0.82rem] text-[var(--muted)]">{new Date(row.created_at).toLocaleString()}</div>
                </div>
                <StatusPill label={row.entry_type} tone={toneFor(row.entry_type)} />
              </div>

              <div className="mb-3 grid gap-2 md:grid-cols-3">
                <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                  Amount: {Number(row.amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} {row.currency}
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                  Invoice: {row.invoice_id || "General ledger event"}
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                  Target: {row.target_address || "No target recorded"}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {row.invoice_id ? (
                  <Link href={`/app/invoices/${row.invoice_id}`} className="text-[0.82rem] font-semibold text-[var(--accent)]">
                    Open invoice
                  </Link>
                ) : null}
                {row.tx_hash ? (
                  <Link href={`${network.explorerUrl}/tx/${row.tx_hash}`} target="_blank" className="text-[0.82rem] font-semibold text-[var(--accent)]">
                    Open tx
                  </Link>
                ) : null}
                {row.note ? <span className="text-[0.82rem] text-[var(--muted)]">{row.note}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

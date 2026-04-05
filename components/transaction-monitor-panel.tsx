"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchRemoteInvoiceDrafts } from "@/lib/supabase-data";
import { getNetworkConfig } from "@/lib/networks";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type MonitorRow = {
  invoiceId: string | null;
  title: string;
  kind: "Funding" | "Release";
  txHash: string;
};

type ReceiptState = {
  status: "pending" | "confirmed" | "failed" | "unknown";
  blockNumber?: string;
};

async function readReceipt(rpcUrl: string, txHash: string): Promise<ReceiptState> {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [txHash],
      }),
    });

    const json = await response.json();
    const receipt = json?.result;

    if (!receipt) {
      return { status: "pending" };
    }

    if (receipt.status === "0x1") {
      return { status: "confirmed", blockNumber: receipt.blockNumber };
    }

    if (receipt.status === "0x0") {
      return { status: "failed", blockNumber: receipt.blockNumber };
    }

    return { status: "unknown" };
  } catch {
    return { status: "unknown" };
  }
}

export function TransactionMonitorPanel() {
  const { environment, network } = useAppEnvironment();
  const [rows, setRows] = useState<MonitorRow[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, ReceiptState>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const invoices = await fetchRemoteInvoiceDrafts();
        const txRows: MonitorRow[] = [];

        invoices.forEach((invoice) => {
          if (invoice.funding_tx_hash) {
            txRows.push({
              invoiceId: invoice.id,
              title: invoice.title,
              kind: "Funding",
              txHash: invoice.funding_tx_hash,
            });
          }
          if (invoice.release_tx_hash) {
            txRows.push({
              invoiceId: invoice.id,
              title: invoice.title,
              kind: "Release",
              txHash: invoice.release_tx_hash,
            });
          }
        });

        if (!mounted) return;
        setRows(txRows);

        const rpcUrl = getNetworkConfig(environment).rpcUrl;
        const entries = await Promise.all(
          txRows.map(async (row) => [row.txHash, await readReceipt(rpcUrl, row.txHash)] as const)
        );

        if (!mounted) return;
        setStatusMap(Object.fromEntries(entries));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [environment]);

  const summary = useMemo(() => {
    const values = Object.values(statusMap);
    return {
      total: rows.length,
      confirmed: values.filter((item) => item.status === "confirmed").length,
      pending: values.filter((item) => item.status === "pending").length,
      failed: values.filter((item) => item.status === "failed").length,
    };
  }, [rows.length, statusMap]);

  if (loading) {
    return (
      <LoadingState
        title="Loading transaction monitor"
        detail="Stablelane is reading transaction hashes from invoices and checking onchain receipt state."
      />
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No transaction hashes yet"
        detail="Funding and release hashes will appear here after wallet or Gateway actions are written into workspace invoices."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Transactions", value: String(summary.total) },
          { label: "Confirmed", value: String(summary.confirmed) },
          { label: "Pending", value: String(summary.pending) },
          { label: "Failed", value: String(summary.failed) },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</strong>
          </div>
        ))}
      </div>

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">Onchain transaction monitor</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            A live receipt check for funding and release hashes saved against workspace invoices.
          </p>
        </div>

        <div className="grid gap-3">
          {rows.map((row) => {
            const receipt = statusMap[row.txHash] || { status: "unknown" as const };
            return (
              <div key={`${row.kind}_${row.txHash}`} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[var(--text)]">{row.title}</div>
                    <div className="text-[0.82rem] text-[var(--muted)]">{row.kind} transaction</div>
                  </div>
                  <StatusPill
                    label={receipt.status}
                    tone={receipt.status === "confirmed" ? "done" : receipt.status === "pending" ? "lock" : receipt.status === "failed" ? "neutral" : "live"}
                  />
                </div>

                <div className="mb-3 break-all text-[0.82rem] text-[var(--muted)]">{row.txHash}</div>

                <div className="flex flex-wrap gap-3">
                  {row.invoiceId ? (
                    <Link href={`/app/invoices/${row.invoiceId}`} className="text-[0.82rem] font-semibold text-[var(--accent)]">
                      Open invoice
                    </Link>
                  ) : null}
                  <Link href={`${network.explorerUrl}/tx/${row.txHash}`} target="_blank" className="text-[0.82rem] font-semibold text-[var(--accent)]">
                    Open explorer
                  </Link>
                  {receipt.blockNumber ? (
                    <span className="text-[0.82rem] text-[var(--muted)]">Block {parseInt(receipt.blockNumber, 16)}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

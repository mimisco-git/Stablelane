"use client";

import Link from "next/link";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { EmptyState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

export function SettlementReceiptsPanel({
  invoiceId,
  clientName,
  amount,
  currency,
  fundingTxHash,
  releaseTxHash,
}: {
  invoiceId: string;
  clientName: string;
  amount: string;
  currency: string;
  fundingTxHash?: string | null;
  releaseTxHash?: string | null;
}) {
  const { network } = useAppEnvironment();

  const receipts = [
    fundingTxHash
      ? {
          title: "Funding receipt",
          txHash: fundingTxHash,
          note: `Funding confirmed for ${amount} ${currency} toward ${clientName}.`,
          tone: "live" as const,
        }
      : null,
    releaseTxHash
      ? {
          title: "Release receipt",
          txHash: releaseTxHash,
          note: `Release completed for invoice ${invoiceId}.`,
          tone: "done" as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    txHash: string;
    note: string;
    tone: "live" | "done";
  }>;

  if (!receipts.length) {
    return (
      <EmptyState
        title="No settlement receipts yet"
        detail="Funding and release receipts appear here as soon as the invoice has transaction hashes saved against it."
      />
    );
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Settlement receipts</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          Explorer-linked receipts for the funding and release lifecycle of this invoice.
        </p>
      </div>

      <div className="grid gap-3">
        {receipts.map((receipt) => (
          <div key={receipt.txHash} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <strong>{receipt.title}</strong>
              <StatusPill label={receipt.title.includes("Release") ? "released" : "funded"} tone={receipt.tone} />
            </div>
            <div className="mb-2 break-all text-[0.84rem] font-semibold text-[var(--text)]">{receipt.txHash}</div>
            <p className="mb-3 text-[0.82rem] leading-6 text-[var(--muted)]">{receipt.note}</p>
            <Link
              href={`${network.explorerUrl}/tx/${receipt.txHash}`}
              target="_blank"
              className="text-[0.82rem] font-semibold text-[var(--accent)]"
            >
              Open receipt on explorer
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

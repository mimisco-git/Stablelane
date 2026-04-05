"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchInvoiceApprovalGate, fetchRemoteInvoiceDrafts } from "@/lib/supabase-data";
import type { RemoteInvoiceDraftRow } from "@/lib/types";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type ReleaseRow = {
  invoice: RemoteInvoiceDraftRow;
  approvalGate: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    allApproved: boolean;
    hasRejection: boolean;
  };
};

function formatAmount(amount: number | null, currency: "USDC" | "EURC") {
  const symbol = currency === "EURC" ? "€" : "$";
  return `${symbol}${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function ReleaseOrchestrationCenter() {
  const [rows, setRows] = useState<ReleaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const invoices = await fetchRemoteInvoiceDrafts();
        const queue = await Promise.all(
          invoices.map(async (invoice) => ({
            invoice,
            approvalGate: await fetchInvoiceApprovalGate(invoice.id),
          }))
        );

        if (mounted) setRows(queue);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const readyToRelease = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.invoice.escrow_status === "release_requested" &&
          row.approvalGate.allApproved &&
          row.invoice.status !== "Completed"
      ),
    [rows]
  );

  const waitingOnApprovals = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.invoice.escrow_status === "release_requested" &&
          !row.approvalGate.allApproved &&
          row.invoice.status !== "Completed"
      ),
    [rows]
  );

  const fundedNeedsReleaseRequest = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.invoice.escrow_status === "funded" &&
          row.invoice.status !== "Completed"
      ),
    [rows]
  );

  const completedReleases = useMemo(
    () => rows.filter((row) => row.invoice.status === "Completed"),
    [rows]
  );

  const totalEscrowValue = useMemo(
    () =>
      rows
        .filter((row) => row.invoice.escrow_status && row.invoice.escrow_status !== "draft")
        .reduce((sum, row) => sum + Number(row.invoice.amount || 0), 0),
    [rows]
  );

  if (loading) {
    return (
      <LoadingState
        title="Loading release orchestration"
        detail="Stablelane is reading invoice release states, approval gates, and settlement readiness."
      />
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No release records yet"
        detail="Fund a workspace invoice and move it into approval or release flow to populate this command view."
      />
    );
  }

  const summaryCards = [
    { label: "Ready to release", value: String(readyToRelease.length) },
    { label: "Waiting on approvals", value: String(waitingOnApprovals.length) },
    { label: "Funded, not requested", value: String(fundedNeedsReleaseRequest.length) },
    { label: "Escrow value", value: `$${totalEscrowValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
  ];

  function renderQueue(
    title: string,
    detail: string,
    items: ReleaseRow[],
    emptyTitle: string,
    emptyDetail: string
  ) {
    return (
      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4">
          <h2 className="mb-1 text-base font-bold tracking-normal">{title}</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{detail}</p>
        </div>

        {items.length ? (
          <div className="grid gap-3">
            {items.map((row) => (
              <div key={row.invoice.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{row.invoice.title}</div>
                    <div className="text-[0.82rem] text-[var(--muted)]">
                      {row.invoice.client_name} · {formatAmount(row.invoice.amount, row.invoice.currency)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                      label={row.invoice.escrow_status || "draft"}
                      tone={
                        row.invoice.status === "Completed"
                          ? "done"
                          : row.invoice.escrow_status === "release_requested"
                            ? "lock"
                            : row.invoice.escrow_status === "funded"
                              ? "live"
                              : "neutral"
                      }
                    />
                    <StatusPill
                      label={
                        row.approvalGate.allApproved
                          ? "all approved"
                          : row.approvalGate.hasRejection
                            ? "rejected"
                            : `${row.approvalGate.pending} pending`
                      }
                      tone={
                        row.approvalGate.allApproved
                          ? "done"
                          : row.approvalGate.hasRejection
                            ? "neutral"
                            : "lock"
                      }
                    />
                  </div>
                </div>

                <div className="mb-3 grid gap-2 md:grid-cols-3">
                  <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                    Approvals: {row.approvalGate.total}
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                    Pending: {row.approvalGate.pending}
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[.03] px-3 py-3 text-[0.82rem] text-[var(--muted)]">
                    Approved: {row.approvalGate.approved}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`/app/invoices/${row.invoice.id}`} className="text-[0.82rem] font-semibold text-[var(--accent)]">
                    Open invoice
                  </Link>
                  {row.invoice.release_tx_hash ? (
                    <span className="text-[0.82rem] text-[var(--muted)]">Release hash saved</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title={emptyTitle} detail={emptyDetail} />
        )}
      </section>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{card.label}</div>
            <strong className="block font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        {renderQueue(
          "Ready for final release",
          "These invoices have completed approval gates and can move to final release action.",
          readyToRelease,
          "Nothing is ready for release",
          "Approve more release requests or move more funded invoices into the release-request stage."
        )}
        {renderQueue(
          "Waiting on approvals",
          "These invoices are already in release-request state but still need approvals or a rejection fix.",
          waitingOnApprovals,
          "No invoices are waiting on approvals",
          "As soon as release approvals are requested, they will show here."
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        {renderQueue(
          "Funded but not yet requested for release",
          "These invoices already have funding but still need the release-request step.",
          fundedNeedsReleaseRequest,
          "No funded invoices are waiting",
          "Funded invoices will appear here until they move into release-request stage."
        )}
        {renderQueue(
          "Recently completed releases",
          "A quick look at invoices that have already passed through the full release flow.",
          completedReleases,
          "No completed releases yet",
          "Completed releases will appear here once the release lifecycle is finished."
        )}
      </div>
    </div>
  );
}

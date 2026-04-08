"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { InvoiceStatusTransitionPanel } from "@/components/invoice-status-transition-panel";
import { EscrowTransactionPanel } from "@/components/escrow-transaction-panel";
import { ContractPathPanel } from "@/components/contract-path-panel";
import { InvoiceHistoryPanel } from "@/components/invoice-history-panel";
import { SettlementReceiptsPanel } from "@/components/settlement-receipts-panel";
import { DocumentExportPanel } from "@/components/document-export-panel";
import { ReleaseApprovalPanel } from "@/components/release-approval-panel";
import { readLocalInvoices, removeLocalInvoice } from "@/lib/storage";
import { deleteRemoteInvoiceDraft, fetchRemoteInvoiceDraftById } from "@/lib/supabase-data";
import type { InvoiceDraft, RemoteInvoiceDraftRow } from "@/lib/types";

type InvoiceDetailViewProps = {
  invoiceId: string;
};

function getCurrencySymbol(currency: string) {
  return currency === "EURC" ? "€" : "$";
}

function localStatusTone(status: string) {
  if (status === "Released" || status === "Completed") return "done";
  if (status === "In escrow" || status === "Ready for approval") return "live";
  if (status === "Locked" || status === "Awaiting escrow") return "lock";
  return "neutral";
}

function normalizeRemoteInvoice(row: RemoteInvoiceDraftRow): InvoiceDraft {
  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientId: row.client_id || null,
    workspaceName: row.workspace_name || null,
    amount: String(row.amount ?? 0),
    currency: row.currency,
    escrowStatus: row.escrow_status || "draft",
    escrowAddress: row.escrow_address || null,
    fundingTxHash: row.funding_tx_hash || null,
    releaseTxHash: row.release_tx_hash || null,
    paymentMode: row.payment_mode,
    dueDate: row.due_date || "Not set",
    reference: row.reference || "",
    description: row.description || "",
    milestones: Array.isArray(row.milestones) ? row.milestones : [],
    splits: Array.isArray(row.splits) ? row.splits : [],
    createdAt: row.created_at,
    status: row.status,
  };
}

export function InvoiceDetailView({ invoiceId }: InvoiceDetailViewProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDraft | null>(null);
  const [source, setSource] = useState<"workspace" | "browser" | "sample" | "missing">("missing");
  const [busy, setBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadInvoice() {
      try {
        const remote = await fetchRemoteInvoiceDraftById(invoiceId);
        if (remote && mounted) {
          setInvoice(normalizeRemoteInvoice(remote));
          setSource("workspace");
          return;
        }
      } catch {
        // ignore and fall back
      }

      const local = readLocalInvoices().find((item) => item.id === invoiceId);
      if (local && mounted) {
        setInvoice(local);
        setSource("browser");
        return;
      }

      if (mounted) {
        setInvoice(null);
        setSource("missing");
      }
    }

    loadInvoice();
    return () => {
      mounted = false;
    };
  }, [invoiceId]);

  const totalSplit = useMemo(
    () => invoice?.splits.reduce((sum, item) => sum + Number(item.percent || 0), 0) || 0,
    [invoice]
  );

  async function handleDelete() {
    if (!invoice) return;
    const confirmed = window.confirm("Delete this invoice draft?");
    if (!confirmed) return;

    setBusy(true);
    setActionMessage("");
    try {
      if (source === "workspace") {
        await deleteRemoteInvoiceDraft(invoice.id);
      } else if (source === "browser") {
        removeLocalInvoice(invoice.id);
      }
      router.push("/app/invoices");
    } catch {
      setActionMessage("Delete failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!invoice) {
    return (
      <div className="grid gap-4">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-3 text-base font-bold tracking-normal">Invoice not found</h2>
          <p className="mb-4 text-[0.9rem] leading-7 text-[var(--muted)]">
            This invoice could not be found in your workspace records or local browser drafts.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/invoices" className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
              Back to invoices
            </Link>
            <Link href="/app/invoices/new" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">
              Create invoice
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const symbol = getCurrencySymbol(invoice.currency);

  return (
    <div className="grid gap-4">
      <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4 text-[0.84rem] leading-6 text-[var(--accent)]">
        This invoice is loaded from <strong>{source === "workspace" ? "your workspace records" : "your browser drafts"}</strong>.
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Invoice summary</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["Client", invoice.clientName],
              ["Client email", invoice.clientEmail || "Not set"],
              ["Total", `${symbol}${invoice.amount} ${invoice.currency}`],
              ["Mode", invoice.paymentMode],
              ["Status", invoice.status],
              ["Due date", invoice.dueDate || "Not set"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{label}</div>
                <div className="font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Escrow state</div>
              <div className="font-semibold">{invoice.escrowStatus || "draft"}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Funding tx</div>
              <div className="font-semibold">{invoice.fundingTxHash ? `${invoice.fundingTxHash.slice(0, 8)}...${invoice.fundingTxHash.slice(-6)}` : "Not set"}</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Release tx</div>
              <div className="font-semibold">{invoice.releaseTxHash ? `${invoice.releaseTxHash.slice(0, 8)}...${invoice.releaseTxHash.slice(-6)}` : "Not set"}</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Scope and notes</div>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              {invoice.description || "No invoice description was saved yet."}
            </p>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold tracking-normal">Actions</h2>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => {
                const link = `${window.location.origin}/pay/${invoiceId}`;
                navigator.clipboard?.writeText(link);
                const btn = document.getElementById("copy-pay-btn");
                if (btn) { btn.textContent = "Link copied!"; setTimeout(() => { btn.textContent = "Copy client payment link"; }, 2000); }
              }}
              id="copy-pay-btn"
              className="rounded-full bg-[var(--accent)] px-4 py-3 text-left text-[0.92rem] font-bold text-[#08100b]"
            >
              Copy client payment link
            </button>
            <button
              type="button"
              onClick={() => {
                if (!invoice) return;
                const template = {
                  id: `tpl_${Date.now()}`,
                  name: invoice.title,
                  description: invoice.description || "",
                  currency: invoice.currency,
                  paymentMode: invoice.paymentMode,
                  milestones: invoice.milestones || [],
                  splits: invoice.splits || [],
                  createdAt: new Date().toISOString(),
                  usageCount: 0,
                };
                const existing = JSON.parse(localStorage.getItem("stablelane_invoice_templates") || "[]");
                localStorage.setItem("stablelane_invoice_templates", JSON.stringify([template, ...existing]));
                alert(`Template "${invoice.title}" saved. Find it in Templates.`);
              }}
              className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]"
            >
              Save as template
            </button>
            <Link href={`/app/invoices/${invoiceId}/edit`} className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Edit invoice
            </Link>
            <Link href="/app/invoices/new" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Create another invoice
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--danger,#e05252)] disabled:opacity-70"
            >
              {busy ? "Deleting..." : "Delete invoice"}
            </button>
            <Link href="/app/settings" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]">
              Open settings
            </Link>
          </div>
          {actionMessage ? (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[0.84rem] text-[var(--muted)]">
              {actionMessage}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold">Payout split total</div>
            <div className="mb-2 text-[1.2rem] font-bold text-[var(--text)]">{totalSplit}%</div>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              This should reach 100% before the payout router is considered ready for release.
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <InvoiceStatusTransitionPanel invoiceId={invoiceId} currentStatus={invoice.status} />
        <EscrowTransactionPanel
          invoiceId={invoiceId}
          invoiceAmount={invoice.amount}
          escrowAddress={invoice.escrowAddress || null}
          currentEscrowStatus={invoice.escrowStatus || "draft"}
          milestones={invoice.milestones || []}
          freelancerWallet={(invoice as any).freelancerWallet || null}
        />
      </div>

      <ContractPathPanel />

      {source === "workspace" ? <InvoiceHistoryPanel invoiceId={invoiceId} /> : null}

      <SettlementReceiptsPanel
        invoiceId={invoiceId}
        clientName={invoice.clientName}
        amount={invoice.amount}
        currency={invoice.currency}
        fundingTxHash={invoice.fundingTxHash || null}
        releaseTxHash={invoice.releaseTxHash || null}
      />

      <DocumentExportPanel
        invoiceId={invoiceId}
        title={invoice.title}
        clientName={invoice.clientName}
        clientEmail={invoice.clientEmail}
        amount={invoice.amount}
        currency={invoice.currency}
        paymentMode={invoice.paymentMode}
        dueDate={invoice.dueDate}
        description={invoice.description}
        milestones={invoice.milestones}
        splits={invoice.splits}
        fundingTxHash={invoice.fundingTxHash || null}
        releaseTxHash={invoice.releaseTxHash || null}
      />

      {source === "workspace" ? (
        <ReleaseApprovalPanel
          invoiceId={invoiceId}
          clientName={invoice.clientName}
          amount={invoice.amount}
          currency={invoice.currency}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-normal">Milestones</h2>
            <StatusPill label={`${invoice.milestones.length} milestones`} tone="live" />
          </div>

          <div className="grid gap-3">
            {invoice.milestones.length ? (
              invoice.milestones.map((milestone, index) => (
                <div key={milestone.id || `${milestone.title}-${index}`} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <strong>{milestone.title || `Milestone ${index + 1}`}</strong>
                    <span className="font-semibold">{symbol}{milestone.amount || "0"} {invoice.currency}</span>
                  </div>
                  <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{milestone.detail || "No milestone detail yet."}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] text-[var(--muted)]">
                No milestones were saved for this invoice yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-normal">Payout split</h2>
            <StatusPill label={`${totalSplit}% total`} tone={totalSplit === 100 ? "done" : "lock"} />
          </div>

          <div className="grid gap-3">
            {invoice.splits.length ? (
              invoice.splits.map((split, index) => (
                <div key={split.id || `${split.member}-${index}`} className="grid gap-2 rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{split.member || "Unnamed collaborator"}</strong>
                    <span className="font-semibold">{split.percent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/5">
                    <span
                      className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                      style={{ width: `${Math.max(0, Math.min(100, split.percent))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] text-[var(--muted)]">
                No payout split was saved for this invoice yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

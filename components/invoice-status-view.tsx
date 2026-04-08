"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { RemoteInvoiceDraftRow } from "@/lib/types";

type Step = {
  label: string;
  detail: string;
  done: boolean;
  active: boolean;
};

function getSteps(invoice: RemoteInvoiceDraftRow): Step[] {
  const status = invoice.status;
  const escrow = invoice.escrow_status;

  return [
    {
      label: "Invoice created",
      detail: "Invoice drafted and sent to client.",
      done: true,
      active: status === "Draft" || status === "Sent",
    },
    {
      label: "Client reviewing",
      detail: "Client has received the payment link.",
      done: status !== "Draft",
      active: status === "Sent",
    },
    {
      label: "Escrow funded",
      detail: "Client locked USDC into the milestone escrow contract on Arc.",
      done: escrow === "funded" || escrow === "released" || status === "Completed",
      active: status === "In escrow" && escrow === "funded",
    },
    {
      label: "Work in progress",
      detail: "Milestones are being delivered.",
      done: escrow === "released" || status === "Completed",
      active: status === "In escrow",
    },
    {
      label: "Settled",
      detail: "Funds released on-chain. Revenue recorded.",
      done: status === "Completed" || escrow === "released",
      active: false,
    },
  ];
}

export function InvoiceStatusView({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<RemoteInvoiceDraftRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase
        .from("invoice_drafts")
        .select("*")
        .eq("id", invoiceId)
        .maybeSingle();
      setInvoice(data as RemoteInvoiceDraftRow | null);
      setLoading(false);
    }
    load();
  }, [invoiceId]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
    </div>
  );

  if (!invoice) return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <div className="mb-3 text-4xl opacity-20">◈</div>
        <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-3xl">Invoice not found</h1>
        <p className="text-[var(--muted)]">This invoice may have been removed or the link is invalid.</p>
      </div>
    </div>
  );

  const steps = getSteps(invoice);
  const currentStep = steps.filter((s) => s.done).length;
  const milestones = Array.isArray(invoice.milestones) ? invoice.milestones : [];
  const isPaid = invoice.status === "In escrow" || invoice.status === "Completed";

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Nav */}
      <div className="mx-auto mb-8 flex max-w-xl items-center justify-between">
        <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold">
          Stablelane<span className="text-[var(--accent)]">.</span>
        </span>
        <span className="rounded-full border border-white/8 bg-white/3 px-3 py-1.5 text-[0.75rem] font-bold text-[var(--muted)]">
          Invoice status
        </span>
      </div>

      <div className="mx-auto max-w-xl grid gap-4">
        {/* Header card */}
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.92),rgba(10,18,13,.88))] p-6 shadow-[0_28px_90px_rgba(0,0,0,.38)]">
          <div className="mb-4">
            <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">Invoice</div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl tracking-[-0.04em]">{invoice.title}</h1>
            <p className="text-[0.88rem] text-[var(--muted)]">{invoice.client_name}</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-[family-name:var(--font-cormorant)] text-[2.5rem] tracking-[-0.05em] text-[var(--accent)]">
                {Number(invoice.amount || 0).toLocaleString()} {invoice.currency}
              </div>
            </div>
            <div className={`rounded-full px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.08em] ${
              invoice.status === "Completed" ? "bg-[rgba(103,213,138,.12)] text-[var(--accent-2)]"
              : invoice.status === "In escrow" ? "bg-[rgba(201,255,96,.12)] text-[var(--accent)]"
              : "bg-white/5 text-[var(--muted)]"
            }`}>
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Progress timeline */}
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.88),rgba(10,18,13,.82))] p-6">
          <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
            Progress: {currentStep}/{steps.length} steps
          </div>
          <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-all duration-700"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <div className="grid gap-4">
            {steps.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[0.72rem] font-bold ${
                    step.done
                      ? "border-[var(--accent)] bg-[rgba(201,255,96,.12)] text-[var(--accent)]"
                      : step.active
                      ? "border-[var(--accent)] bg-transparent text-[var(--accent)]"
                      : "border-white/12 bg-white/3 text-[var(--muted-2)]"
                  }`}>
                    {step.done ? "✓" : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-px flex-1 ${step.done ? "bg-[var(--accent)] opacity-30" : "bg-white/8"}`} style={{ minHeight: 16 }} />
                  )}
                </div>
                <div className="pb-2">
                  <div className={`text-[0.88rem] font-semibold ${step.done || step.active ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
                    {step.label}
                    {step.active && <span className="ml-2 rounded-full bg-[rgba(201,255,96,.12)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--accent)]">Now</span>}
                  </div>
                  <div className="text-[0.78rem] text-[var(--muted)]">{step.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.88),rgba(10,18,13,.82))] p-6">
            <h2 className="mb-4 text-base font-bold">Milestones</h2>
            <div className="grid gap-2">
              {milestones.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                  <span className="text-[0.88rem] text-[var(--muted)]">{m.title || `Milestone ${i + 1}`}</span>
                  <span className="font-semibold">{m.amount} {invoice.currency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Escrow info */}
        {invoice.escrow_address && (
          <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(201,255,96,.04)] p-6">
            <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">On-chain escrow</div>
            <div className="mb-3 break-all font-mono text-[0.82rem] text-[var(--accent)]">{invoice.escrow_address}</div>
            <a
              href={`https://testnet.arcscan.app/address/${invoice.escrow_address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.82rem] font-semibold text-[var(--accent)] underline underline-offset-2"
            >
              View on Arc Explorer ↗
            </a>
          </div>
        )}

        {/* Pay CTA if unpaid */}
        {!isPaid && (
          <Link
            href={`/pay/${invoiceId}`}
            className="block w-full rounded-[20px] bg-[var(--accent)] px-6 py-4 text-center text-[1rem] font-bold text-[#08100b] transition hover:-translate-y-px"
          >
            Pay {Number(invoice.amount || 0).toLocaleString()} {invoice.currency}
          </Link>
        )}

        <p className="text-center text-[0.75rem] text-[var(--muted)]">
          Powered by Stablelane &middot; Stablecoin invoicing on Arc testnet
        </p>
      </div>
    </div>
  );
}
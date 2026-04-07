"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { RemoteInvoiceDraftRow } from "@/lib/types";
import { createOnChainEscrow, fundEscrow, getConnectedAddress, arcTestnet } from "@/lib/escrow-client";

type Step = "loading" | "not_found" | "review" | "connecting" | "creating_escrow" | "funding" | "paid" | "error";

function formatAmount(amount: number | null, currency: string) {
  if (!amount) return `0 ${currency}`;
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function StatusBadge({ label, tone }: { label: string; tone: "green" | "amber" | "blue" | "muted" }) {
  const colors = {
    green: "bg-[rgba(201,255,96,.12)] text-[var(--accent)]",
    amber: "bg-[rgba(216,196,139,.12)] text-[var(--accent-3)]",
    blue: "bg-[rgba(80,160,255,.12)] text-[#78B8FF]",
    muted: "bg-white/5 text-[var(--muted)]",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${colors[tone]}`}>
      {label}
    </span>
  );
}

export function ClientPaymentView({ invoiceId }: { invoiceId: string }) {
  const [step, setStep] = useState<Step>("loading");
  const [invoice, setInvoice] = useState<RemoteInvoiceDraftRow | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState("");
  const [escrowAddress, setEscrowAddress] = useState("");

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  async function loadInvoice() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setStep("not_found"); return; }

    // Public fetch - no auth required, invoice must exist by ID
    const { data } = await supabase
      .from("invoice_drafts")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

    if (!data) { setStep("not_found"); return; }
    setInvoice(data as RemoteInvoiceDraftRow);
    setStep("review");
  }

  async function connectWallet() {
    setStep("connecting");
    setMessage("");
    try {
      const win = window as Window & { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } };
      if (!win.ethereum) throw new Error("No wallet detected. Install MetaMask, Rabby, or OKX Wallet.");

      const accounts = await win.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      if (!accounts[0]) throw new Error("No account returned.");

      // Switch to Arc testnet
      try {
        await win.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${arcTestnet.id.toString(16)}` }],
        });
      } catch {
        // Try adding the network
        await win.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x${arcTestnet.id.toString(16)}`,
            chainName: "Arc Testnet",
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
            rpcUrls: ["https://rpc.testnet.arc.network"],
            blockExplorerUrls: ["https://testnet.arcscan.app"],
          }],
        });
      }

      setWalletAddress(accounts[0]);
      setStep("review");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wallet connection failed.");
      setStep("review");
    }
  }

  async function payInvoice() {
    if (!invoice || !walletAddress) return;
    setStep("creating_escrow");
    setMessage("Creating escrow on Arc testnet...");

    try {
      const amount = invoice.amount || 0;
      const milestones = Array.isArray(invoice.milestones) ? invoice.milestones : [];
      const hasMilestones = milestones.length > 0;

      const { txHash: createTx, escrowAddress: addr } = await createOnChainEscrow({
        invoiceId,
        freelancerAddress: walletAddress, // temporary - should be freelancer's address
        totalAmountUSDC: amount,
        milestoneTitles: hasMilestones
          ? milestones.map((m: any, i: number) => m.title || `Milestone ${i + 1}`)
          : ["Full payment"],
        milestoneAmountsUSDC: hasMilestones
          ? milestones.map((m: any) => parseFloat(String(m.amount || 0)))
          : [amount],
        disputeWindowDays: 7,
      });

      setEscrowAddress(addr);
      setStep("funding");
      setMessage("Escrow created. Now funding with USDC...");

      const fundTx = await fundEscrow(addr);
      setTxHash(fundTx);

      // Update invoice status in Supabase
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase
          .from("invoice_drafts")
          .update({
            status: "In escrow",
            escrow_status: "funded",
            escrow_address: addr,
            funding_tx_hash: fundTx,
          })
          .eq("id", invoiceId);
      }

      setStep("paid");
      setMessage("Payment complete. Funds are locked in escrow on Arc testnet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment failed.");
      setStep("error");
    }
  }

  // Loading state
  if (step === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-[0.9rem] text-[var(--muted)]">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (step === "not_found" || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl opacity-20">◈</div>
          <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-3xl">Invoice not found</h1>
          <p className="text-[var(--muted)]">This invoice link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  // Paid successfully
  if (step === "paid") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="rounded-[28px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(14,25,18,.92),rgba(10,18,13,.88))] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,.38)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.1)]">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14l6 6 10-10" stroke="#c9ff60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Payment complete</div>
            <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-3xl tracking-[-0.04em]">Funds locked in escrow</h1>
            <p className="mb-6 text-[0.9rem] leading-7 text-[var(--muted)]">
              {formatAmount(invoice.amount, invoice.currency)} has been locked in a milestone escrow contract on Arc testnet. Funds will release as work is approved.
            </p>
            <div className="mb-4 rounded-2xl border border-white/8 bg-white/3 p-4 text-left">
              <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">Escrow address</div>
              <div className="break-all font-mono text-[0.82rem] text-[var(--accent)]">{escrowAddress}</div>
            </div>
            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.84rem] text-[var(--accent)] underline underline-offset-2"
              >
                View on Arc explorer
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = step === "connecting" || step === "creating_escrow" || step === "funding";
  const milestones = Array.isArray(invoice.milestones) ? invoice.milestones : [];

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Nav */}
      <div className="mx-auto mb-8 flex max-w-xl items-center justify-between">
        <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold">
          Stablelane<span className="text-[var(--accent)]">.</span>
        </span>
        <StatusBadge label="Arc testnet" tone="green" />
      </div>

      <div className="mx-auto max-w-xl">
        {/* Invoice card */}
        <div className="mb-4 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.92),rgba(10,18,13,.88))] p-6 shadow-[0_28px_90px_rgba(0,0,0,.38)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">Invoice from</div>
              <h1 className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[-0.04em]">{invoice.title || "Invoice"}</h1>
              <p className="text-[0.85rem] text-[var(--muted)]">{invoice.client_name}</p>
            </div>
            <StatusBadge
              label={invoice.status === "In escrow" ? "In escrow" : invoice.status === "Completed" ? "Paid" : "Awaiting payment"}
              tone={invoice.status === "In escrow" ? "amber" : invoice.status === "Completed" ? "green" : "blue"}
            />
          </div>

          {/* Amount */}
          <div className="mb-5 rounded-[16px] border border-[var(--line)] bg-[rgba(201,255,96,.04)] p-5">
            <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">Amount due</div>
            <div className="font-[family-name:var(--font-cormorant)] text-4xl tracking-[-0.05em] text-[var(--accent)]">
              {formatAmount(invoice.amount, invoice.currency)}
            </div>
            <div className="mt-1 text-[0.78rem] text-[var(--muted)]">{invoice.payment_mode}</div>
          </div>

          {/* Description */}
          {invoice.description && (
            <div className="mb-5 text-[0.88rem] leading-7 text-[var(--muted)]">{invoice.description}</div>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">Milestones</div>
              <div className="grid gap-2">
                {milestones.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                    <div>
                      <div className="text-[0.88rem] font-semibold">{m.title || `Milestone ${i + 1}`}</div>
                      {m.detail && <div className="text-[0.78rem] text-[var(--muted)]">{m.detail}</div>}
                    </div>
                    <div className="text-[0.9rem] font-bold">{m.amount} {invoice.currency}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="grid gap-2 text-[0.82rem]">
            {invoice.due_date && (
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Due date</span>
                <span>{invoice.due_date}</span>
              </div>
            )}
            {invoice.reference && (
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Reference</span>
                <span>{invoice.reference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment panel */}
        {invoice.status !== "Completed" && invoice.status !== "In escrow" && (
          <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.88),rgba(10,18,13,.82))] p-6">
            <div className="mb-4">
              <h2 className="mb-1 text-[1rem] font-semibold">Pay with USDC on Arc</h2>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
                Funds lock into a milestone escrow contract. They release automatically when work is approved. Sub-second settlement on Arc testnet.
              </p>
            </div>

            {!walletAddress ? (
              <button
                type="button"
                onClick={connectWallet}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--accent)] px-5 py-4 text-[0.95rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-70"
              >
                {step === "connecting" ? "Connecting..." : "Connect wallet to pay"}
              </button>
            ) : (
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                  <div className="text-[0.82rem] text-[var(--muted)]">Connected wallet</div>
                  <div className="font-mono text-[0.82rem] text-[var(--accent)]">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={payInvoice}
                  disabled={isProcessing}
                  className="w-full rounded-2xl bg-[var(--accent)] px-5 py-4 text-[0.95rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-70"
                >
                  {step === "creating_escrow" ? "Creating escrow on Arc..." :
                   step === "funding" ? "Funding escrow..." :
                   `Pay ${formatAmount(invoice.amount, invoice.currency)}`}
                </button>
              </div>
            )}

            {message && (
              <div className={`mt-3 rounded-2xl px-4 py-3 text-[0.84rem] leading-6 ${
                step === "error"
                  ? "border border-white/8 bg-white/3 text-[var(--danger)]"
                  : "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
              }`}>
                {message}
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[0.75rem] text-[var(--muted)]">Secured by Arc testnet smart contracts</span>
            </div>
          </div>
        )}

        {(invoice.status === "In escrow" || invoice.status === "Completed") && (
          <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(201,255,96,.06)] p-6 text-center">
            <div className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
              {invoice.status === "Completed" ? "Payment complete" : "Funds locked in escrow"}
            </div>
            <p className="text-[0.88rem] text-[var(--muted)]">
              {invoice.status === "Completed"
                ? "This invoice has been fully settled."
                : "Funds are locked in the escrow contract and will release as milestones are approved."}
            </p>
            {invoice.escrow_address && (
              <a
                href={`https://testnet.arcscan.app/address/${invoice.escrow_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-[0.82rem] text-[var(--accent)] underline underline-offset-2"
              >
                View escrow on Arc explorer
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

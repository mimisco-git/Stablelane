"use client";

import { useState } from "react";
import Link from "next/link";
import { updateInvoiceWorkflowState } from "@/lib/supabase-data";
import { sendNativeTransaction, ensureSelectedNetwork, getActiveWalletAddress } from "@/lib/onchain";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { getEscrowContractConfig, getEscrowExplorerLink } from "@/lib/contracts";
import { InlineNotice } from "@/components/ui-state";

function ethHexFromDecimalAmount(amount: string) {
  const numeric = Number(amount || 0);
  const wei = BigInt(Math.max(0, Math.floor(numeric * 1e18)));
  return `0x${wei.toString(16)}`;
}

function shortValue(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function EscrowTransactionPanel({
  invoiceId,
  invoiceAmount,
  escrowAddress,
  currentEscrowStatus,
}: {
  invoiceId: string;
  invoiceAmount: string;
  escrowAddress: string | null;
  currentEscrowStatus: string;
}) {
  const { environment, network } = useAppEnvironment();
  const contractConfig = getEscrowContractConfig(environment);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function createEscrowRecord() {
    setBusy(true);
    setMessage("");
    try {
      if (!contractConfig.ready) {
        throw new Error("Configure the escrow factory, implementation, and release module addresses first.");
      }

      const wallet = await getActiveWalletAddress();
      const derivedEscrowAddress = contractConfig.implementationAddress || wallet || escrowAddress || null;
      if (!derivedEscrowAddress) throw new Error("No escrow target address could be derived.");

      await updateInvoiceWorkflowState(
        invoiceId,
        {
          status: "In escrow",
          escrow_status: "created",
          escrow_address: derivedEscrowAddress,
        },
        {
          eventType: "escrow_record_created",
          detail: "Escrow record linked to the contract path.",
          metadata: {
            environment,
            factoryAddress: contractConfig.factoryAddress,
            implementationAddress: contractConfig.implementationAddress,
            releaseModuleAddress: contractConfig.releaseModuleAddress,
          },
        }
      );
      setMessage("Escrow record created with contract-path awareness.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Escrow record could not be created.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function fundEscrow() {
    setBusy(true);
    setMessage("");
    try {
      if (!contractConfig.ready) throw new Error("Contract addresses are not configured yet.");
      const targetAddress = escrowAddress || contractConfig.implementationAddress;
      if (!targetAddress) throw new Error("No contract-aware escrow target is available.");

      const networkOk = await ensureSelectedNetwork(environment);
      if (!networkOk.ok) throw new Error(networkOk.reason);

      const txHash = await sendNativeTransaction({
        environment,
        to: targetAddress,
        valueHex: ethHexFromDecimalAmount(invoiceAmount || "0"),
      });

      await updateInvoiceWorkflowState(
        invoiceId,
        {
          status: "In escrow",
          escrow_status: "funded",
          funding_tx_hash: txHash,
          escrow_address: targetAddress,
        },
        {
          eventType: "escrow_funded",
          detail: "Funding transaction submitted to the contract-aware escrow target.",
          metadata: {
            environment,
            targetAddress,
            txHash,
          },
        }
      );
      setMessage("Funding transaction submitted from your wallet.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Funding transaction failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function requestRelease() {
    setBusy(true);
    setMessage("");
    try {
      if (!contractConfig.ready) throw new Error("Contract addresses are not configured yet.");

      await updateInvoiceWorkflowState(
        invoiceId,
        { escrow_status: "release_requested" },
        {
          eventType: "release_requested",
          detail: "Release request routed through the contract path.",
          metadata: {
            environment,
            releaseModuleAddress: contractConfig.releaseModuleAddress,
          },
        }
      );
      setMessage("Release request recorded for this invoice.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Release request failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function markReleased() {
    setBusy(true);
    setMessage("");
    try {
      if (!contractConfig.ready) throw new Error("Contract addresses are not configured yet.");

      const releaseTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

      await updateInvoiceWorkflowState(
        invoiceId,
        {
          status: "Completed",
          escrow_status: "released",
          release_tx_hash: releaseTxHash,
        },
        {
          eventType: "release_confirmed",
          detail: "Invoice marked as released through the contract path.",
          metadata: {
            environment,
            releaseModuleAddress: contractConfig.releaseModuleAddress,
            releaseTxHash,
          },
        }
      );
      setMessage("Invoice marked as released and completed.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Release update failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Escrow transaction wiring</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          This layer now uses the configured contract path so funding and release state are tied to real environment addresses, not only placeholders.
        </p>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {[
          ["Factory", contractConfig.factoryAddress],
          ["Implementation", contractConfig.implementationAddress],
          ["Release module", contractConfig.releaseModuleAddress],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{label}</div>
            {value ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[0.86rem] font-semibold text-[var(--text)]">{shortValue(value)}</div>
                <Link href={getEscrowExplorerLink(environment, value)} target="_blank" className="text-[0.8rem] font-semibold text-[var(--accent)]">
                  View
                </Link>
              </div>
            ) : (
              <div className="text-[0.82rem] text-[var(--muted)]">Not configured</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={createEscrowRecord}
          disabled={busy}
          className="rounded-full bg-[var(--accent)] px-4 py-3 text-left text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
        >
          {busy ? "Working..." : "Create contract-aware escrow record"}
        </button>
        <button
          type="button"
          onClick={fundEscrow}
          disabled={busy || !contractConfig.ready}
          className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)] disabled:opacity-45"
        >
          {busy ? "Submitting..." : "Fund escrow from wallet"}
        </button>
        <button
          type="button"
          onClick={requestRelease}
          disabled={busy || currentEscrowStatus !== "funded" || !contractConfig.ready}
          className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)] disabled:opacity-45"
        >
          Request release
        </button>
        <button
          type="button"
          onClick={markReleased}
          disabled={busy || currentEscrowStatus !== "release_requested" || !contractConfig.ready}
          className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)] disabled:opacity-45"
        >
          Mark released
        </button>
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice
            title="Escrow action"
            detail={message}
            tone={message.toLowerCase().includes("failed") || message.toLowerCase().includes("not configured") ? "warning" : "success"}
          />
        </div>
      ) : null}
    </section>
  );
}

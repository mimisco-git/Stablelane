"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { updateInvoiceWorkflowState, fetchInvoiceApprovalGate, createWorkspaceAuditEvent, createSettlementLedgerEntry } from "@/lib/supabase-data";
import { getActiveWalletAddress } from "@/lib/onchain";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { getEscrowExplorerLink } from "@/lib/contracts";
import { canFinalizeRelease, canPrepareFunding, readActingRole } from "@/lib/role-session";
import { fetchRealAccessContext } from "@/lib/workspace-access";
import { InlineNotice } from "@/components/ui-state";
import { pushActivityItem } from "@/lib/activity-feed";
import { createOnChainEscrow, fundEscrow as fundOnChainEscrow, approveMilestone as approveOnChainMilestone, FACTORY_ADDRESS } from "@/lib/escrow-client";
import { useState as useLocalState } from "react";

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
  milestones = [],
  freelancerWallet,
}: {
  invoiceId: string;
  invoiceAmount: string;
  escrowAddress: string | null;
  currentEscrowStatus: string;
  milestones?: Array<{ title?: string; amount?: string | number }>;
  freelancerWallet?: string | null;
}) {
  const { environment } = useAppEnvironment();
  const contractConfig = {
    ready: Boolean(FACTORY_ADDRESS),
    factoryAddress: FACTORY_ADDRESS || "",
    implementationAddress: "",
    releaseModuleAddress: "",
  };
  const [message, setMessage] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [busy, setBusy] = useState(false);
  const [actingRole, setActingRole] = useState("Owner");
  const [realRole, setRealRole] = useState<"Owner" | "Admin" | "Operator" | "Viewer" | "">("");
  const effectiveRole = (realRole || actingRole) as "Owner" | "Admin" | "Operator" | "Viewer";
  const [approvalGate, setApprovalGate] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    allApproved: false,
    hasRejection: false,
  });

  async function loadGate() {
    try {
      const gate = await fetchInvoiceApprovalGate(invoiceId);
      setApprovalGate(gate);
    } catch {
      // ignore approval gate load failure
    }
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setActingRole(readActingRole());
      try {
        const access = await fetchRealAccessContext();
        if (mounted && access.hasDatabaseWorkspace) {
          setRealRole(access.role);
        }
      } catch {
        // ignore role resolution failure and keep preview fallback
      }
      await loadGate();
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [invoiceId]);

  async function createEscrowRecord() {
    setBusy(true);
    setMessage("");
    try {
      if (!canPrepareFunding(effectiveRole)) {
        throw new Error(`${effectiveRole} cannot create escrow records.`);
      }
      if (!FACTORY_ADDRESS) {
        throw new Error("Escrow factory address is not configured. Add NEXT_PUBLIC_TESTNET_ESCROW_FACTORY_ADDRESS to Vercel.");
      }

      const connectedAddress = await getActiveWalletAddress();
      if (!connectedAddress) throw new Error("Connect your wallet first.");
      const freelancerAddress = freelancerWallet || connectedAddress;
      if (!freelancerWallet) {
        setMessage("Warning: no freelancer wallet set on invoice. Using your connected wallet as fallback.");
      }

      const amount = parseFloat(invoiceAmount || "0");
      if (!amount) throw new Error("Invoice amount is required.");

      setMessage("Creating escrow on Arc testnet. Approve the transactions in your wallet...");

      const { txHash, escrowAddress: newEscrowAddress } = await createOnChainEscrow({
        invoiceId,
        freelancerAddress,
        totalAmountUSDC: amount,
        milestoneTitles: ["Milestone 1"],
        milestoneAmountsUSDC: [amount],
        disputeWindowDays: 7,
      });

      await updateInvoiceWorkflowState(
        invoiceId,
        {
          status: "In escrow",
          escrow_status: "created",
          escrow_address: newEscrowAddress,
          funding_tx_hash: txHash,
        },
        {
          eventType: "escrow_record_created",
          detail: "On-chain escrow created on Arc testnet.",
          metadata: { environment, txHash, escrowAddress: newEscrowAddress },
        }
      );
      await createWorkspaceAuditEvent({
        event_type: "escrow_created_onchain",
        title: "Escrow created on Arc testnet",
        detail: `Escrow deployed for invoice ${invoiceId} at ${newEscrowAddress}.`,
        metadata: { invoiceId, escrowAddress: newEscrowAddress, txHash },
      });
      setMessage(`Escrow created on Arc testnet. Address: ${newEscrowAddress.slice(0, 10)}...`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Escrow creation failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function fundEscrow() {
    setBusy(true);
    setMessage("");
    try {
      if (!canPrepareFunding(effectiveRole)) {
        throw new Error(`${effectiveRole} cannot fund escrow.`);
      }
      const targetAddress = escrowAddress;
      if (!targetAddress) throw new Error("Create the escrow first before funding.");

      setMessage("Funding escrow on Arc testnet. Approve the transactions in your wallet...");

      const txHash = await fundOnChainEscrow(targetAddress);

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

      pushActivityItem({
        title: "Escrow funding submitted",
        detail: `${invoiceAmount} submitted into the contract-aware escrow target.`,
        kind: "escrow_funding",
        status: "submitted",
        txHash,
        invoiceId,
        targetAddress,
      });

      await createSettlementLedgerEntry({
        invoice_id: invoiceId,
        entry_type: "escrow_funding",
        amount: Number(invoiceAmount || 0),
        currency: "USDC",
        tx_hash: txHash,
        target_address: targetAddress,
        note: "Wallet funding submitted into the escrow path.",
      });

      await createWorkspaceAuditEvent({
        event_type: "escrow_wallet_funding_submitted",
        title: "Escrow wallet funding submitted",
        detail: `Funding was submitted for invoice ${invoiceId}.`,
        metadata: { invoiceId, txHash, targetAddress },
      });
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
      if (!canFinalizeRelease(effectiveRole)) {
        throw new Error(`${effectiveRole} cannot request release in this access state.`);
      }
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
      await loadGate();
      await createWorkspaceAuditEvent({
        event_type: "release_request_recorded",
        title: "Release request recorded",
        detail: `Release was requested for invoice ${invoiceId}.`,
        metadata: { invoiceId },
      });
      setMessage("Release request recorded for this invoice.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Release request failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function approveSpecificMilestone(index: number) {
    setBusy(true);
    setMessage("");
    try {
      if (!escrowAddress) throw new Error("No escrow found. Create and fund escrow first.");
      setMessage(`Approving milestone ${index + 1} on Arc testnet. Confirm in your wallet...`);
      const txHash = await approveOnChainMilestone(escrowAddress, index);
      await updateInvoiceWorkflowState(
        invoiceId,
        { escrow_status: "release_requested", release_tx_hash: txHash },
        {
          eventType: "escrow_milestone_released",
          detail: `Milestone ${index + 1} approved and funds released on Arc testnet.`,
          metadata: { environment, txHash, escrowAddress, milestoneIndex: index },
        }
      );
      await createWorkspaceAuditEvent({
        event_type: "escrow_milestone_released_onchain",
        title: `Milestone ${index + 1} released`,
        detail: `Funds released for invoice ${invoiceId} milestone ${index + 1}.`,
        metadata: { invoiceId, txHash, escrowAddress, milestoneIndex: index },
      });
      setMessage(`Milestone ${index + 1} released. Tx: ${txHash.slice(0, 10)}...`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Milestone release failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

    async function markReleased() {
    setBusy(true);
    setMessage("");
    try {
      if (!canFinalizeRelease(effectiveRole)) {
        throw new Error(`${effectiveRole} cannot finalize release.`);
      }
      if (!escrowAddress) throw new Error("No escrow found. Create and fund escrow first.");

      setMessage("Approving milestone release on Arc testnet. Confirm in your wallet...");
      const releaseTxHash = await approveOnChainMilestone(escrowAddress, 0);

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
            releaseTxHash,
          },
        }
      );

      pushActivityItem({
        title: "Release confirmed",
        detail: `Invoice ${invoiceId} was marked released through the contract path.`,
        kind: "release",
        status: "confirmed",
        txHash: releaseTxHash,
        invoiceId,
      });

      await createSettlementLedgerEntry({
        invoice_id: invoiceId,
        entry_type: "release",
        amount: Number(invoiceAmount || 0),
        currency: "USDC",
        tx_hash: releaseTxHash,
        target_address: escrowAddress || "",
        note: "Release completed through the contract path.",
      });

      await createWorkspaceAuditEvent({
        event_type: "release_completed",
        title: "Invoice released",
        detail: `Invoice ${invoiceId} was released and completed.`,
        metadata: { invoiceId, releaseTxHash },
      });
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
        <h2 className="mb-1 text-base font-bold tracking-normal">Escrow actions</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          Create and fund a milestone escrow on Arc testnet. Release funds on-chain when work is approved.
        </p>
      </div>

      {escrowAddress && (
        <div className="mb-4 rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">Escrow contract</div>
          <div className="flex items-center justify-between gap-3">
            <span className="break-all font-mono text-[0.82rem] text-[var(--accent)]">{escrowAddress}</span>
            <Link
              href={`https://testnet.arcscan.app/address/${escrowAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[0.78rem] font-semibold text-[var(--accent)]"
            >
              View
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        <button
          type="button"
          onClick={createEscrowRecord}
          disabled={busy}
          className="rounded-full bg-[var(--accent)] px-4 py-3 text-center text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
        >
          {busy ? "Working..." : escrowAddress ? "Re-create escrow" : "Create escrow on Arc"}
        </button>

        {escrowAddress && (
          <button
            type="button"
            onClick={fundEscrow}
            disabled={busy}
            className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-center text-[0.92rem] font-bold text-[var(--text)] disabled:opacity-45"
          >
            {busy ? "Processing..." : "Fund escrow with USDC"}
          </button>
        )}

        {escrowAddress && milestones.length > 0 && (
          <div className="rounded-[16px] border border-white/8 bg-white/3 p-4">
            <div className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">
              Approve milestone release
            </div>
            <div className="grid gap-2 mb-3">
              {milestones.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedMilestone(i)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-[0.86rem] transition ${
                    selectedMilestone === i
                      ? "border-[var(--accent)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
                      : "border-white/8 bg-white/3 text-[var(--text)]"
                  }`}
                >
                  <span className="font-semibold">{(m as any).title || `Milestone ${i + 1}`}</span>
                  <span>{(m as any).amount} USDC</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => approveSpecificMilestone(selectedMilestone)}
              disabled={busy}
              className="w-full rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.1)] px-4 py-3 text-center text-[0.88rem] font-bold text-[var(--accent)] disabled:opacity-50"
            >
              {busy ? "Releasing on Arc..." : `Release Milestone ${selectedMilestone + 1} on-chain`}
            </button>
          </div>
        )}

        {escrowAddress && milestones.length === 0 && (
          <button
            type="button"
            onClick={() => approveSpecificMilestone(0)}
            disabled={busy}
            className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.1)] px-4 py-3 text-center text-[0.88rem] font-bold text-[var(--accent)] disabled:opacity-50"
          >
            {busy ? "Releasing on Arc..." : "Approve full release on-chain"}
          </button>
        )}
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice title="Escrow action" detail={message} tone={message.toLowerCase().includes("cannot") || message.toLowerCase().includes("not configured") || message.toLowerCase().includes("must") ? "warning" : "success"} />
        </div>
      ) : null}
    </section>
  );
}

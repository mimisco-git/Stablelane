"use client";

import { useMemo, useState } from "react";
import { getEscrowContractConfig } from "@/lib/contracts";
import { sendErc20Transfer, ensureSelectedNetwork } from "@/lib/onchain";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { createWorkspaceAuditEvent } from "@/lib/supabase-data";
import { pushActivityItem } from "@/lib/activity-feed";
import { InlineNotice } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type AssetKey = "USDC" | "EURC";

function getAssetConfig(asset: AssetKey) {
  if (asset === "EURC") {
    return {
      symbol: "EURC",
      tokenAddress: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
      decimals: 6,
    };
  }

  return {
    symbol: "USDC",
    tokenAddress: "0x3600000000000000000000000000000000000000",
    decimals: 6,
  };
}

export function EscrowTokenFundingPanel() {
  const { environment } = useAppEnvironment();
  const contracts = getEscrowContractConfig(environment);
  const [asset, setAsset] = useState<AssetKey>("USDC");
  const [amount, setAmount] = useState("75.00");
  const [customTarget, setCustomTarget] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const assetConfig = useMemo(() => getAssetConfig(asset), [asset]);
  const targetAddress = customTarget || contracts.implementationAddress || contracts.factoryAddress;

  async function runFunding() {
    setBusy(true);
    setMessage("");

    try {
      if (environment !== "testnet") {
        throw new Error("Real token funding is enabled for Arc testnet only right now.");
      }
      if (!targetAddress) {
        throw new Error("Add an escrow target address or configure the contract path first.");
      }

      const networkOk = await ensureSelectedNetwork("testnet");
      if (!networkOk.ok) throw new Error(networkOk.reason);

      const txHash = await sendErc20Transfer({
        environment: "testnet",
        tokenAddress: assetConfig.tokenAddress,
        to: targetAddress,
        amount,
        decimals: assetConfig.decimals,
      });

      pushActivityItem({
        title: "Escrow funding submitted",
        detail: `${amount} ${assetConfig.symbol} submitted into the escrow funding path.`,
        kind: "escrow_funding",
        status: "submitted",
        txHash,
        targetAddress,
      });
      await createWorkspaceAuditEvent({
        event_type: "escrow_token_funding_submitted",
        title: "Escrow token funding submitted",
        detail: `${amount} ${assetConfig.symbol} was sent into the escrow target.`,
        metadata: { txHash, targetAddress, tokenAddress: assetConfig.tokenAddress },
      });
      setMessage(`Escrow funding transfer submitted. Tx: ${txHash}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Escrow transfer failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Real token funding into escrow</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Send Arc testnet USDC or EURC through the ERC-20 token interface into the configured escrow target so funding stops being only conceptual.
          </p>
        </div>
        <StatusPill label={environment === "testnet" ? "Testnet live" : "Coming soon"} tone={environment === "testnet" ? "done" : "lock"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Funding asset</span>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value as AssetKey)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
            >
              <option value="USDC">USDC ERC-20</option>
              <option value="EURC">EURC</option>
            </select>
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Funding amount</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
              placeholder="0.00"
            />
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Escrow target override</span>
            <input
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
              placeholder="Leave blank to use configured contract path"
            />
          </label>

          <button
            type="button"
            onClick={runFunding}
            disabled={busy}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
          >
            {busy ? "Submitting..." : "Fund escrow now"}
          </button>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Escrow target</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{targetAddress || "Not configured yet"}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Implementation address</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{contracts.implementationAddress || "Not configured yet"}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Token contract</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{assetConfig.tokenAddress}</div>
          </div>
        </div>
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice title="Escrow funding" detail={message} tone={message.includes("Tx: 0x") ? "success" : "warning"} />
        </div>
      ) : null}
    </section>
  );
}

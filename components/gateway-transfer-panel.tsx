"use client";

import { useMemo, useState } from "react";
import { arcFundingEnv, arcFundingReadiness } from "@/lib/arc-funding";
import { arcTestnetFinance } from "@/lib/arc-finance";
import { ensureSelectedNetwork, sendErc20Transfer } from "@/lib/onchain";
import { createWorkspaceAuditEvent } from "@/lib/supabase-data";
import { pushActivityItem } from "@/lib/activity-feed";
import { useAppEnvironment } from "@/lib/use-app-environment";
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

export function GatewayTransferPanel() {
  const { environment } = useAppEnvironment();
  const [asset, setAsset] = useState<AssetKey>("USDC");
  const [amount, setAmount] = useState("150.00");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const assetConfig = useMemo(() => getAssetConfig(asset), [asset]);

  async function runGatewayTransfer() {
    setBusy(true);
    setMessage("");

    try {
      if (environment !== "testnet") {
        throw new Error("Gateway transfer is currently enabled for Arc testnet only.");
      }

      if (!arcFundingReadiness.gatewayReady || !arcFundingEnv.gatewayAddress) {
        throw new Error("Add the Gateway and GatewayMinter addresses before running this action.");
      }

      const networkOk = await ensureSelectedNetwork("testnet");
      if (!networkOk.ok) throw new Error(networkOk.reason);

      const txHash = await sendErc20Transfer({
        environment: "testnet",
        tokenAddress: assetConfig.tokenAddress,
        to: arcFundingEnv.gatewayAddress,
        amount,
        decimals: assetConfig.decimals,
      });

      pushActivityItem({
        title: "Gateway deposit submitted",
        detail: `${amount} ${assetConfig.symbol} sent into the Gateway deposit lane.`,
        kind: "gateway_deposit",
        status: "submitted",
        txHash,
        targetAddress: arcFundingEnv.gatewayAddress,
      });
      await createWorkspaceAuditEvent({
        event_type: "gateway_transfer_submitted",
        title: "Gateway transfer submitted",
        detail: `${amount} ${assetConfig.symbol} was submitted into the Gateway lane.`,
        metadata: { txHash, gatewayAddress: arcFundingEnv.gatewayAddress, tokenAddress: assetConfig.tokenAddress },
      });
      setMessage(`Gateway transfer submitted. Tx: ${txHash}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Gateway transfer failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Gateway-triggered deposit action</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Submit a real Arc testnet ERC-20 stablecoin transfer into the configured Gateway address and keep the deposit lane feeling operational.
          </p>
        </div>
        <StatusPill label={environment === "testnet" ? "Testnet live" : "Coming soon"} tone={environment === "testnet" ? "done" : "lock"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Asset</span>
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
            <span>Amount</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
              placeholder="0.00"
            />
          </label>

          <button
            type="button"
            onClick={runGatewayTransfer}
            disabled={busy}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
          >
            {busy ? "Submitting..." : "Send deposit to Gateway"}
          </button>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Gateway address</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{arcFundingEnv.gatewayAddress || "Not configured yet"}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">GatewayMinter address</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{arcFundingEnv.gatewayMinterAddress || "Not configured yet"}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Transfer token</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{assetConfig.tokenAddress}</div>
            <p className="mt-2 text-[0.8rem] leading-6 text-[var(--muted)]">
              Use the ERC-20 interface for real transfer calls while keeping settlement math visible in stablecoin terms.
            </p>
          </div>
        </div>
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice
            title="Gateway action"
            detail={message}
            tone={message.includes("Tx: 0x") ? "success" : "warning"}
          />
        </div>
      ) : (
        <div className="mt-4">
          <InlineNotice
            title="Arc-native funding rule"
            detail={`This uses the ERC-20 token interface while the workspace still frames fees and balances around ${arcTestnetFinance.gasToken.symbol}.`}
            tone="success"
          />
        </div>
      )}
    </section>
  );
}

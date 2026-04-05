"use client";

import { useMemo, useState } from "react";
import { arcFundingEnv, arcFundingReadiness } from "@/lib/arc-funding";
import { InlineNotice } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type AssetKey = "USDC" | "EURC";

export function GatewayDepositWorkbench() {
  const [amount, setAmount] = useState("250.00");
  const [asset, setAsset] = useState<AssetKey>("USDC");
  const [destination, setDestination] = useState("Escrow reserve");
  const [message, setMessage] = useState("");

  const preview = useMemo(() => {
    const numeric = Number(amount || 0);
    const safe = Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
    return {
      depositAmount: safe.toFixed(2),
      destination,
      asset,
    };
  }, [amount, destination, asset]);

  function createPlan() {
    if (!arcFundingReadiness.gatewayReady) {
      setMessage("Gateway values are still incomplete. Add the Gateway and GatewayMinter addresses first.");
      return;
    }

    setMessage(
      `Gateway funding plan prepared for ${preview.depositAmount} ${preview.asset} into ${preview.destination}.`
    );
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Gateway deposit workbench</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            This is the next Arc-native funding layer. It prepares a Gateway deposit route so settlement can evolve beyond wallet-only funding.
          </p>
        </div>
        <StatusPill
          label={arcFundingReadiness.gatewayReady ? "Gateway ready" : "Needs config"}
          tone={arcFundingReadiness.gatewayReady ? "done" : "lock"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[.95fr_1.05fr]">
        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Deposit asset</span>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value as AssetKey)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
            >
              <option value="USDC">USDC</option>
              <option value="EURC">EURC</option>
            </select>
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Deposit amount</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
              placeholder="0.00"
            />
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Destination bucket</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
              placeholder="Escrow reserve"
            />
          </label>

          <button
            type="button"
            onClick={createPlan}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
          >
            Create Gateway funding plan
          </button>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Gateway address</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">
              {arcFundingEnv.gatewayAddress || "Not configured yet"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">GatewayMinter address</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">
              {arcFundingEnv.gatewayMinterAddress || "Not configured yet"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Deposit preview</div>
            <div className="mb-1 font-semibold">{preview.depositAmount} {preview.asset}</div>
            <div className="text-[0.82rem] text-[var(--muted)]">Destination: {preview.destination}</div>
          </div>
        </div>
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice
            title="Gateway funding plan"
            detail={message}
            tone={message.toLowerCase().includes("incomplete") ? "warning" : "success"}
          />
        </div>
      ) : (
        <div className="mt-4">
          <InlineNotice
            title="Why this matters"
            detail="Deposit via Arc Gateway for a dedicated funding lane, separate from direct wallet funding."
            tone="success"
          />
        </div>
      )}
    </section>
  );
}

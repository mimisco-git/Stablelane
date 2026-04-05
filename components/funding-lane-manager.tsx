"use client";

import { useEffect, useState } from "react";
import { arcFundingEnv, arcFundingLanes, fundingLaneStorageKey, type FundingLaneKey } from "@/lib/arc-funding";
import { InlineNotice } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

export function FundingLaneManager() {
  const [selected, setSelected] = useState<FundingLaneKey>("wallet");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(fundingLaneStorageKey);
    if (stored === "wallet" || stored === "gateway" || stored === "crosschain") {
      setSelected(stored);
    }
  }, []);

  function choose(next: FundingLaneKey) {
    setSelected(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(fundingLaneStorageKey, next);
    }
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Funding lane manager</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          Choose how Stablelane should treat invoice funding on Arc testnet right now, and keep the next settlement lanes visible as the product grows.
        </p>
      </div>

      <div className="grid gap-3">
        {arcFundingLanes.map((lane) => {
          const active = selected === lane.key;
          return (
            <button
              key={lane.key}
              type="button"
              onClick={() => choose(lane.key)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-[var(--line)] bg-[rgba(201,255,96,.08)]"
                  : "border-white/8 bg-white/3"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <strong>{lane.title}</strong>
                <StatusPill
                  label={lane.status}
                  tone={lane.status === "Active now" ? "done" : lane.status === "Ready for next step" ? "lock" : "neutral"}
                />
              </div>
              <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{lane.detail}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Preferred lane</div>
          <div className="font-semibold">{selected}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Gateway address</div>
          <div className="break-all text-[0.82rem] font-semibold">{arcFundingEnv.gatewayAddress || "Not configured yet"}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Crosschain readiness</div>
          <div className="font-semibold">
            {arcFundingEnv.cctpTokenMessenger && arcFundingEnv.cctpMessageTransmitter ? "Configured" : "Planning mode"}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <InlineNotice
          title="Product direction"
          detail="Keep wallet-funded settlement fully active now. Use Gateway and crosschain lanes as structured next steps, not hidden future ideas."
          tone="success"
        />
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { arcFundingReadiness } from "@/lib/arc-funding";
import { StatusPill } from "@/components/status-pill";

type RouteKey = "wallet_to_escrow" | "gateway_to_escrow" | "crosschain_to_gateway_to_escrow";

export function SettlementRoutePlanner() {
  const [route, setRoute] = useState<RouteKey>("wallet_to_escrow");
  const [sourceChain, setSourceChain] = useState("Arc testnet");
  const [invoiceTag, setInvoiceTag] = useState("Invoice settlement");

  const routes = useMemo(
    () => [
      {
        key: "wallet_to_escrow" as RouteKey,
        title: "Wallet → Escrow",
        status: "Live now",
        detail: "Fund a Stablelane invoice directly from an Arc wallet into the escrow path.",
      },
      {
        key: "gateway_to_escrow" as RouteKey,
        title: "Gateway → Escrow",
        status: arcFundingReadiness.gatewayReady ? "Ready next" : "Awaiting config",
        detail: "Move funds through a Gateway-style balance lane before routing into escrow settlement.",
      },
      {
        key: "crosschain_to_gateway_to_escrow" as RouteKey,
        title: "Crosschain → Gateway → Escrow",
        status: arcFundingReadiness.crosschainReady ? "Planned route" : "Design stage",
        detail: "Bring crosschain stablecoins into Arc, then route them through a structured balance layer before invoice settlement.",
      },
    ],
    []
  );

  const selected = routes.find((item) => item.key === route) || routes[0];

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Settlement route planner</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          Keep the next Stablelane funding architecture visible so Arc relevance stays strong as the product moves from direct wallet funding into richer settlement rails.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="grid gap-3">
          {routes.map((item) => {
            const active = route == item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setRoute(item.key)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-[var(--line)] bg-[rgba(201,255,96,.08)]"
                    : "border-white/8 bg-white/3"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <strong>{item.title}</strong>
                  <StatusPill
                    label={item.status}
                    tone={item.status === "Live now" ? "done" : item.status === "Ready next" ? "lock" : "neutral"}
                  />
                </div>
                <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.detail}</p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Funding source chain</span>
            <input
              value={sourceChain}
              onChange={(e) => setSourceChain(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Settlement label</span>
            <input
              value={invoiceTag}
              onChange={(e) => setInvoiceTag(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Route preview</div>
            <div className="mb-1 font-semibold">{selected.title}</div>
            <div className="text-[0.82rem] text-[var(--muted)]">Source chain: {sourceChain}</div>
            <div className="text-[0.82rem] text-[var(--muted)]">Use case: {invoiceTag}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

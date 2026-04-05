"use client";

import { useEffect, useMemo, useState } from "react";
import { arcFundingEnv, arcFundingReadiness } from "@/lib/arc-funding";
import { pushActivityItem, replaceActivityItem } from "@/lib/activity-feed";
import { InlineNotice } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type RouteKey = "cctp" | "gateway";
type IntentStatus = "planned" | "broadcasted" | "settled";

type ExecutionIntent = {
  id: string;
  route: RouteKey;
  asset: string;
  amount: string;
  sourceChain: string;
  destinationBucket: string;
  status: IntentStatus;
  activityId?: string;
  txHash?: string;
  createdAt: string;
};

const STORAGE_KEY = "stablelane_crosschain_execution_intents_v2";

function readIntents(): ExecutionIntent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ExecutionIntent[]) : [];
  } catch {
    return [];
  }
}

function writeIntents(intents: ExecutionIntent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(intents));
}

export function CrosschainExecutionDesk() {
  const [route, setRoute] = useState<RouteKey>("cctp");
  const [asset, setAsset] = useState("USDC");
  const [amount, setAmount] = useState("400.00");
  const [sourceChain, setSourceChain] = useState("Base Sepolia");
  const [destinationBucket, setDestinationBucket] = useState("Arc Gateway reserve");
  const [message, setMessage] = useState("");
  const [intents, setIntents] = useState<ExecutionIntent[]>([]);

  useEffect(() => {
    setIntents(readIntents());
  }, []);

  const ready = route === "cctp" ? arcFundingReadiness.crosschainReady : arcFundingReadiness.gatewayReady;

  const preview = useMemo(() => {
    return `${sourceChain} → Arc testnet → ${destinationBucket}`;
  }, [sourceChain, destinationBucket]);

  function sync(next: ExecutionIntent[]) {
    setIntents(next);
    writeIntents(next);
  }

  function prepareExecution() {
    if (!ready) {
      setMessage("The selected route still needs its Arc testnet configuration values.");
      return;
    }

    const activity = pushActivityItem({
      title: "Crosschain execution intent",
      detail: `${amount} ${asset} prepared on the ${route.toUpperCase()} lane from ${sourceChain} into ${destinationBucket}.`,
      kind: "crosschain_intent",
      status: "planned",
    });

    const intent: ExecutionIntent = {
      id: `intent_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      route,
      asset,
      amount,
      sourceChain,
      destinationBucket,
      status: "planned",
      activityId: activity?.id,
      createdAt: new Date().toISOString(),
    };

    sync([intent, ...intents].slice(0, 12));
    setMessage(`Execution intent prepared for ${amount} ${asset} on the ${route.toUpperCase()} lane.`);
  }

  function broadcastIntent(intentId: string) {
    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    const next: ExecutionIntent[] = intents.map((intent): ExecutionIntent => {
      if (intent.id !== intentId) return intent;
      if (intent.activityId) {
        replaceActivityItem(intent.activityId, {
          status: "submitted",
          txHash,
          detail: `${intent.amount} ${intent.asset} broadcasted on the ${intent.route.toUpperCase()} route from ${intent.sourceChain}.`,
        });
      }
      pushActivityItem({
        title: "Crosschain broadcast",
        detail: `${intent.amount} ${intent.asset} broadcasted into ${intent.destinationBucket}.`,
        kind: "crosschain_broadcast",
        status: "submitted",
        txHash,
      });
      return { ...intent, status: "broadcasted" as const, txHash };
    });
    sync(next);
    setMessage("Crosschain execution broadcasted.");
  }

  function settleIntent(intentId: string) {
    const next: ExecutionIntent[] = intents.map((intent): ExecutionIntent => {
      if (intent.id !== intentId) return intent;
      if (intent.activityId) {
        replaceActivityItem(intent.activityId, {
          status: "confirmed",
          detail: `${intent.amount} ${intent.asset} settled into ${intent.destinationBucket}.`,
        });
      }
      pushActivityItem({
        title: "Crosschain settlement confirmed",
        detail: `${intent.amount} ${intent.asset} settled from ${intent.sourceChain} into ${intent.destinationBucket}.`,
        kind: "crosschain_settled",
        status: "confirmed",
        txHash: intent.txHash,
      });
      return { ...intent, status: "settled" as const };
    });
    sync(next);
    setMessage("Crosschain execution settled.");
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Crosschain settlement execution runner</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            Turn crosschain settlement into a real operating lane with stored intents, broadcast steps, and a settlement-ready runner.
          </p>
        </div>
        <StatusPill label={ready ? "Execution-ready config" : "Config needed"} tone={ready ? "done" : "lock"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Route</span>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value as RouteKey)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
            >
              <option value="cctp">CCTP route</option>
              <option value="gateway">Gateway reserve route</option>
            </select>
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Asset</span>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)]"
            >
              <option value="USDC">USDC</option>
              <option value="EURC">EURC</option>
            </select>
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Amount</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Source chain</span>
            <input
              value={sourceChain}
              onChange={(e) => setSourceChain(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
            <span>Destination bucket</span>
            <input
              value={destinationBucket}
              onChange={(e) => setDestinationBucket(e.target.value)}
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none"
            />
          </label>

          <button
            type="button"
            onClick={prepareExecution}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
          >
            Prepare execution intent
          </button>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Execution route</div>
            <div className="font-semibold">{preview}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Token messenger</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{arcFundingEnv.cctpTokenMessenger || "Not configured yet"}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Message transmitter</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{arcFundingEnv.cctpMessageTransmitter || "Not configured yet"}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {intents.length ? intents.map((intent) => (
          <div key={intent.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{intent.amount} {intent.asset} · {intent.route.toUpperCase()}</div>
                <div className="text-[0.8rem] text-[var(--muted)]">{intent.sourceChain} → {intent.destinationBucket}</div>
              </div>
              <StatusPill
                label={intent.status}
                tone={intent.status === "settled" ? "done" : intent.status === "broadcasted" ? "live" : "neutral"}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => broadcastIntent(intent.id)}
                disabled={intent.status !== "planned"}
                className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45"
              >
                Broadcast
              </button>
              <button
                type="button"
                onClick={() => settleIntent(intent.id)}
                disabled={intent.status !== "broadcasted"}
                className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] disabled:opacity-45"
              >
                Mark settled
              </button>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] text-[var(--muted)]">
            No execution intents yet.
          </div>
        )}
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice title="Execution runner" detail={message} tone={message.includes("prepared") || message.includes("settled") || message.includes("broadcasted") ? "success" : "warning"} />
        </div>
      ) : null}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { StatusPill } from "@/components/status-pill";
import { WalletConnectPanel } from "@/components/wallet-connect-panel";
import { EmptyState, InlineNotice } from "@/components/ui-state";

type EscrowStage =
  | "draft"
  | "created"
  | "awaiting_funding"
  | "funded"
  | "release_requested"
  | "released";

type EscrowState = {
  invoiceId: string;
  status: EscrowStage;
  contractAddress: string | null;
  fundingTxHash: string | null;
  releaseTxHash: string | null;
  createdAt: string;
};

const STORAGE_KEY = "stablelane_escrow_states_v1";

function readStates(): EscrowState[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EscrowState[]) : [];
  } catch {
    return [];
  }
}

function writeStates(states: EscrowState[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

function randomHex(length: number) {
  const chars = "abcdef0123456789";
  return Array.from({ length }).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function upsertState(next: EscrowState) {
  const current = readStates();
  const updated = current.some((item) => item.invoiceId === next.invoiceId)
    ? current.map((item) => (item.invoiceId === next.invoiceId ? next : item))
    : [next, ...current];
  writeStates(updated);
  return next;
}

function statusTone(status: EscrowStage) {
  if (status === "released") return "done" as const;
  if (status === "funded" || status === "release_requested") return "live" as const;
  if (status === "created" || status === "awaiting_funding") return "lock" as const;
  return "neutral" as const;
}

function labelFor(status: EscrowStage) {
  if (status === "draft") return "Draft";
  if (status === "created") return "Escrow created";
  if (status === "awaiting_funding") return "Awaiting funding";
  if (status === "funded") return "Funded";
  if (status === "release_requested") return "Release requested";
  return "Released";
}

function shortValue(value: string | null) {
  if (!value) return "Not available";
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function EscrowWorkbench({
  invoiceId,
  amount,
  currency,
}: {
  invoiceId: string;
  amount: string;
  currency: string;
}) {
  const { network, environment, ready } = useAppEnvironment();
  const [state, setState] = useState<EscrowState | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const current = readStates().find((item) => item.invoiceId === invoiceId) || null;
    setState(current);
  }, [invoiceId]);

  const effectiveStatus: EscrowStage = state?.status || "draft";

  const steps = useMemo(
    () => [
      ["draft", "Invoice draft ready"],
      ["created", "Escrow shell created"],
      ["awaiting_funding", "Waiting for funding"],
      ["funded", "Escrow funded"],
      ["release_requested", "Release requested"],
      ["released", "Funds released"],
    ] as Array<[EscrowStage, string]>,
    []
  );

  function update(next: EscrowState, nextMessage: string) {
    const saved = upsertState(next);
    setState(saved);
    setMessage(nextMessage);
    setTimeout(() => setMessage(""), 2800);
  }

  const actionsLocked = environment === "mainnet" && !network.hasCompleteConfig;

  function createEscrowShell() {
    if (actionsLocked) return;
    update(
      {
        invoiceId,
        status: "awaiting_funding",
        contractAddress: `0x${randomHex(40)}`,
        fundingTxHash: null,
        releaseTxHash: null,
        createdAt: new Date().toISOString(),
      },
      "Escrow shell created for this invoice."
    );
  }

  function markFunded() {
    if (!state || actionsLocked) return;
    update(
      {
        ...state,
        status: "funded",
        fundingTxHash: `0x${randomHex(64)}`,
      },
      "Escrow marked as funded."
    );
  }

  function requestRelease() {
    if (!state || actionsLocked) return;
    update(
      {
        ...state,
        status: "release_requested",
      },
      "Release request added to the timeline."
    );
  }

  function markReleased() {
    if (!state || actionsLocked) return;
    update(
      {
        ...state,
        status: "released",
        releaseTxHash: `0x${randomHex(64)}`,
      },
      "Escrow marked as released."
    );
  }

  return (
    <div className="grid gap-4">
      <WalletConnectPanel />

      {environment === "mainnet" && !network.hasCompleteConfig ? (
        <InlineNotice
          title="Mainnet guardrail active"
          detail="Mainnet is visible in the UI, but escrow write actions stay disabled until the full mainnet config is supplied."
          tone="warning"
        />
      ) : null}

      <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
              Escrow foundation
            </div>
            <h2 className="text-base font-bold tracking-normal">Contract-ready escrow center</h2>
            <p className="mt-1 max-w-2xl text-[0.84rem] leading-6 text-[var(--muted)]">
              This is the first Arc testnet escrow workbench for the invoice. It tracks the lifecycle, keeps explorer links visible, and prepares the UI for real contract wiring.
            </p>
          </div>
          <StatusPill label={labelFor(effectiveStatus)} tone={statusTone(effectiveStatus)} />
        </div>

        {!state ? (
          <EmptyState
            title="No escrow created yet"
            detail="Create the first escrow shell for this invoice. This gives you the contract timeline, explorer slots, and a place to keep funding and release state visible."
            action={
              <button
                type="button"
                onClick={createEscrowShell}
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
              >
                Create escrow shell
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Invoice value</div>
                  <div className="font-semibold">{amount} {currency}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Created</div>
                  <div className="font-semibold">{new Date(state.createdAt).toLocaleString()}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Escrow address</div>
                  <div className="font-semibold">{shortValue(state.contractAddress)}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Funding tx</div>
                  <div className="font-semibold">{shortValue(state.fundingTxHash)}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-3 text-[0.9rem] font-semibold">Escrow timeline</div>
                <div className="grid gap-3">
                  {steps.map(([key, title], index) => {
                    const reached = steps.findIndex(([name]) => name === effectiveStatus) >= index;
                    return (
                      <div key={key} className="flex items-start gap-3">
                        <div className={`mt-1 h-3 w-3 rounded-full ${reached ? "bg-[var(--accent)]" : "bg-white/10"}`} />
                        <div className="rounded-xl border border-white/8 bg-white/[.02] px-4 py-3">
                          <div className="text-[0.88rem] font-semibold text-[var(--text)]">{title}</div>
                          <div className="text-[0.8rem] leading-6 text-[var(--muted)]">
                            {key === effectiveStatus ? "Current state for this escrow." : reached ? "Completed in the local escrow foundation." : "Still pending."}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-3 text-[0.9rem] font-semibold">Escrow actions</div>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={markFunded}
                    disabled={effectiveStatus !== "awaiting_funding" || actionsLocked}
                    className="rounded-full bg-[var(--accent)] px-4 py-3 text-left text-[0.92rem] font-bold text-[#08100b] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Mark funded
                  </button>
                  <button
                    type="button"
                    onClick={requestRelease}
                    disabled={effectiveStatus !== "funded" || actionsLocked}
                    className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Request release
                  </button>
                  <button
                    type="button"
                    onClick={markReleased}
                    disabled={effectiveStatus !== "release_requested" || actionsLocked}
                    className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Mark released
                  </button>
                  <Link
                    href={state.fundingTxHash ? `${network.explorerUrl || siteConfig.arc.explorerUrl}/tx/${state.fundingTxHash}` : network.explorerUrl || siteConfig.arc.explorerUrl}
                    target="_blank"
                    className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-left text-[0.92rem] font-bold text-[var(--text)]"
                  >
                    Open Arcscan
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-2 text-[0.9rem] font-semibold">Release tx</div>
                <div className="text-[0.84rem] leading-6 text-[var(--muted)]">{shortValue(state.releaseTxHash)}</div>
              </div>
            </div>
          </div>
        )}

        {message ? (
          <div className="mt-4">
            <InlineNotice title="Escrow update" detail={message} tone="success" />
          </div>
        ) : null}
      </section>
    </div>
  );
}

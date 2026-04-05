"use client";

import { useAppEnvironment } from "@/lib/use-app-environment";
import { InlineNotice } from "@/components/ui-state";

export function EnvironmentSwitcher() {
  const { ready, environment, setEnvironment, network } = useAppEnvironment();

  if (!ready) return null;

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
            Environment
          </div>
          <div className="text-[0.98rem] font-semibold text-[var(--text)]">Choose where Stablelane is operating</div>
          <p className="mt-1 max-w-2xl text-[0.82rem] leading-6 text-[var(--muted)]">
            Stablelane is currently optimized for Arc testnet. Mainnet stays visible in the product, but it should read as coming soon until you are ready to turn on live production values.
          </p>
        </div>
        <div className={`rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${
          network.mode === "active"
            ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
            : "border border-white/8 bg-white/3 text-[var(--muted)]"
        }`}>
          {network.mode === "active" ? "Configured" : "Preview only"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["testnet", "mainnet"] as const).map((option) => {
          const active = environment === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setEnvironment(option)}
              className={`rounded-full px-4 py-3 text-[0.9rem] font-semibold transition ${
                active
                  ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
                  : "border border-white/8 bg-white/3 text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {option === "testnet" ? "Arc testnet" : "Arc mainnet · coming soon"}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[.02] p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Selected mode</div>
          <div className="font-semibold">{network.label}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[.02] p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Chain ID</div>
          <div className="font-semibold">{network.chainId || "Not configured"}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[.02] p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Gas token</div>
          <div className="font-semibold">{network.gasToken}</div>
        </div>
      </div>

      {!network.hasCompleteConfig ? (
        <div className="mt-4">
          <InlineNotice
            title="Mainnet is coming soon"
            detail="Add the mainnet RPC, chain ID, and explorer environment values before enabling real write actions in this mode."
            tone="warning"
          />
        </div>
      ) : null}
    </section>
  );
}

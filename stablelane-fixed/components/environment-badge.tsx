"use client";

import { useAppEnvironment } from "@/lib/use-app-environment";

export function EnvironmentBadge() {
  const { ready, network, environment } = useAppEnvironment();

  if (!ready) return null;

  return (
    <div className={`rounded-full px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] ${
      environment === "testnet"
        ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
        : network.hasCompleteConfig
          ? "border border-white/8 bg-white/3 text-[var(--text)]"
          : "border border-white/8 bg-white/3 text-[var(--muted)]"
    }`}>
      {network.label} · {network.mode === "active" ? "live mode" : "preview mode"}
    </div>
  );
}

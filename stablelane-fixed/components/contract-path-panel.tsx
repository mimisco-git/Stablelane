"use client";

import Link from "next/link";
import { useAppEnvironment } from "@/lib/use-app-environment";
import { getEscrowContractConfig, getEscrowExplorerLink } from "@/lib/contracts";
import { InlineNotice } from "@/components/ui-state";

function shortValue(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function ContractPathPanel() {
  const { environment, network } = useAppEnvironment();
  const config = getEscrowContractConfig(environment);

  const rows = [
    ["Escrow factory", config.factoryAddress],
    ["Escrow implementation", config.implementationAddress],
    ["Release module", config.releaseModuleAddress],
  ] as const;

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
            Contract path
          </div>
          <h2 className="text-base font-bold tracking-normal">Escrow contract readiness</h2>
          <p className="mt-1 max-w-2xl text-[0.84rem] leading-6 text-[var(--muted)]">
            Contract addresses for the escrow, invoice registry, and split router. Configure these to enable on-chain release logic.
          </p>
        </div>
        <div className={`rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${
          config.ready
            ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
            : "border border-white/8 bg-white/3 text-[var(--muted)]"
        }`}>
          {config.ready ? "Configured" : "Needs addresses"}
        </div>
      </div>

      <div className="grid gap-3">
        {rows.map(([label, address]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{label}</div>
            {address ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold text-[var(--text)]">{shortValue(address)}</div>
                <Link
                  href={getEscrowExplorerLink(environment, address)}
                  target="_blank"
                  className="text-[0.84rem] font-semibold text-[var(--accent)]"
                >
                  View on explorer
                </Link>
              </div>
            ) : (
              <div className="text-[0.84rem] text-[var(--muted)]">Not configured yet</div>
            )}
          </div>
        ))}
      </div>

      {!config.ready ? (
        <div className="mt-4">
          <InlineNotice
            title="Contract path still needs final addresses"
            detail={`Add the ${environment.toUpperCase()} escrow factory, implementation, and release module addresses in Vercel before enabling stricter contract-first release logic.`}
            tone="warning"
          />
        </div>
      ) : (
        <div className="mt-4">
          <InlineNotice
            title="Contract path is ready for the next step"
            detail={`The selected ${network.label} environment now has the addresses needed for a stronger escrow contract path.`}
            tone="success"
          />
        </div>
      )}
    </section>
  );
}

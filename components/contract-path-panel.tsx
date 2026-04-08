"use client";

import Link from "next/link";
import { FACTORY_ADDRESS, ROUTER_ADDRESS, USDC_ADDRESS } from "@/lib/escrow-client";

function shortAddr(addr: string) {
  if (!addr) return "Not set";
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
}

export function ContractPathPanel() {
  const contracts = [
    {
      label: "Escrow factory",
      address: FACTORY_ADDRESS,
      note: "Deploys a new MilestoneEscrow per invoice",
    },
    {
      label: "Payout router",
      address: ROUTER_ADDRESS,
      note: "Splits released funds to collaborators",
    },
    {
      label: "USDC on Arc",
      address: USDC_ADDRESS,
      note: "Native stablecoin used for escrow and gas",
    },
  ];

  const allReady = contracts.every((c) => Boolean(c.address));

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
            On-chain contracts
          </div>
          <h2 className="text-base font-bold tracking-normal">Arc testnet deployment</h2>
          <p className="mt-1 max-w-2xl text-[0.84rem] leading-6 text-[var(--muted)]">
            Live contract addresses deployed on Arc testnet. All escrow creation, funding, and milestone release flows through these contracts.
          </p>
        </div>
        <div className={`rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${
          allReady
            ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
            : "border border-white/8 bg-white/3 text-[var(--muted)]"
        }`}>
          {allReady ? "Live on Arc" : "Not configured"}
        </div>
      </div>

      <div className="grid gap-3">
        {contracts.map(({ label, address, note }) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">{label}</div>
              {address && (
                <Link
                  href={`https://testnet.arcscan.app/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.78rem] font-semibold text-[var(--accent)]"
                >
                  View on Arc
                </Link>
              )}
            </div>
            <div className="mb-1 font-mono text-[0.84rem] text-[var(--text)]">
              {address ? shortAddr(address) : "Not configured"}
            </div>
            <p className="text-[0.78rem] text-[var(--muted)]">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

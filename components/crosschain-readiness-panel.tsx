import { arcFundingEnv } from "@/lib/arc-funding";
import { InlineNotice } from "@/components/ui-state";

const rows = [
  {
    label: "Gateway address",
    value: arcFundingEnv.gatewayAddress,
  },
  {
    label: "CCTP token messenger",
    value: arcFundingEnv.cctpTokenMessenger,
  },
  {
    label: "CCTP message transmitter",
    value: arcFundingEnv.cctpMessageTransmitter,
  },
];

export function CrosschainReadinessPanel() {
  const ready = rows.every((row) => Boolean(row.value));

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Gateway and crosschain readiness</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          This keeps the next Arc-native funding path visible, so Stablelane can grow into deposit routing and crosschain settlement without redesigning the product later.
        </p>
      </div>

      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">{row.label}</div>
            <div className="break-all text-[0.84rem] font-semibold text-[var(--text)]">{row.value || "Not configured yet"}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <InlineNotice
          title={ready ? "Crosschain lane is ready for the next implementation step" : "Crosschain lane still needs configuration"}
          detail={ready
            ? "The funding lane can now evolve from planning into a real deposit and settlement path."
            : "Add the Arc testnet Gateway and CCTP environment values before turning this lane into a live route."}
          tone={ready ? "success" : "warning"}
        />
      </div>
    </section>
  );
}

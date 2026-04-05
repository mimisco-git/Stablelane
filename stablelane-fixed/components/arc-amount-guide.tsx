"use client";

import { useMemo, useState } from "react";
import { arcTestnetFinance } from "@/lib/arc-finance";

function formatBigInt(value: bigint) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function ArcAmountGuide() {
  const [amount, setAmount] = useState("125.50");

  const values = useMemo(() => {
    const numeric = Number(amount || 0);
    const safe = Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
    const native = BigInt(Math.round(safe * 1e6)) * BigInt(10 ** 12);
    const erc20 = BigInt(Math.round(safe * 1e6));
    return { safe, native, erc20 };
  }, [amount]);

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4">
        <h2 className="mb-1 text-base font-bold tracking-normal">Arc amount guide</h2>
        <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
          This helps you keep Arc amount handling clean when native USDC and the optional ERC-20 interface use different decimal precision.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <label className="grid gap-2 text-[0.82rem] text-[var(--muted)]">
          <span>Settlement amount</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[1rem] font-semibold text-[var(--text)] outline-none"
            placeholder="0.00"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Native USDC units</div>
            <div className="mb-1 font-semibold">{formatBigInt(values.native)}</div>
            <p className="text-[0.8rem] leading-6 text-[var(--muted)]">
              Native Arc gas-token precision, {arcTestnetFinance.gasToken.decimals} decimals.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">USDC ERC-20 units</div>
            <div className="mb-1 font-semibold">{formatBigInt(values.erc20)}</div>
            <p className="text-[0.8rem] leading-6 text-[var(--muted)]">
              Optional ERC-20 interface precision, 6 decimals.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
        Keep wallet balances, fee display, and escrow amounts clearly labeled so native USDC and ERC-20 USDC are never mixed by mistake.
      </div>
    </section>
  );
}

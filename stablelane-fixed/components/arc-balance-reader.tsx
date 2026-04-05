"use client";

import { useEffect, useMemo, useState } from "react";
import { arcTestnetFinance } from "@/lib/arc-finance";
import { InlineNotice, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

function formatUnits(valueHex: string, decimals: number) {
  try {
    const raw = BigInt(valueHex);
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = raw / divisor;
    const fraction = raw % divisor;
    const fractionText = fraction.toString().padStart(decimals, "0").slice(0, 4).replace(/0+$/, "");
    return fractionText ? `${whole.toString()}.${fractionText}` : whole.toString();
  } catch {
    return "0";
  }
}

export function ArcBalanceReader() {
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [nativeBalanceHex, setNativeBalanceHex] = useState("0x0");
  const [chainId, setChainId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const provider = getEthereumProvider();
      if (!provider) {
        if (mounted) {
          setMessage("No wallet was detected in this browser.");
          setLoading(false);
        }
        return;
      }

      try {
        const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
        const selected = accounts?.[0] || "";
        const currentChain = (await provider.request({ method: "eth_chainId" })) as string;

        if (!mounted) return;

        setWalletAddress(selected);
        setChainId(currentChain ? parseInt(currentChain, 16) : null);

        if (selected) {
          const balance = (await provider.request({
            method: "eth_getBalance",
            params: [selected, "latest"],
          })) as string;

          if (!mounted) return;
          setNativeBalanceHex(balance || "0x0");
        }
      } catch {
        if (mounted) setMessage("Wallet balance could not be read right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const balanceText = useMemo(
    () => formatUnits(nativeBalanceHex, arcTestnetFinance.gasToken.decimals),
    [nativeBalanceHex]
  );

  if (loading) {
    return (
      <LoadingState
        title="Reading Arc wallet balance"
        detail="Stablelane is checking the native Arc balance so fee and settlement amounts can stay in USDC terms."
      />
    );
  }

  return (
    <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-base font-bold tracking-normal">Arc balance reader</h2>
          <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
            This reads the connected wallet’s native Arc balance and keeps the UX aligned with USDC-denominated fee language.
          </p>
        </div>
        <StatusPill
          label={chainId === arcTestnetFinance.chainId ? "Arc testnet" : chainId ? `Chain ${chainId}` : "Wallet idle"}
          tone={chainId === arcTestnetFinance.chainId ? "done" : "neutral"}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Wallet</div>
          <div className="break-all text-[0.86rem] font-semibold">{walletAddress || "Not connected"}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Native balance</div>
          <div className="font-semibold">{balanceText} USDC</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
          <div className="mb-1 text-[0.76rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Fee language</div>
          <div className="font-semibold">Show fees in USDC</div>
        </div>
      </div>

      {message ? (
        <div className="mt-4">
          <InlineNotice title="Balance reader" detail={message} tone="warning" />
        </div>
      ) : (
        <div className="mt-4">
          <InlineNotice
            title="Arc-native balance rule"
            detail="Keep wallet balance, invoice total, and transaction fee displays in USDC terms so the settlement UX feels native to Arc instead of generic EVM."
            tone="success"
          />
        </div>
      )}
    </section>
  );
}

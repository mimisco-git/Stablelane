"use client";

import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { arcTestnet, USDC_ADDRESS } from "@/lib/escrow-client";
import { USDC_ABI } from "@/lib/escrow-abi";

type Props = {
  walletAddress?: string;
  compact?: boolean;
};

export function ArcFaucetGuide({ walletAddress, compact = false }: Props) {
  const [balance, setBalance] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (walletAddress) checkBalance(walletAddress);
  }, [walletAddress]);

  async function checkBalance(address: string) {
    setChecking(true);
    try {
      const client = createPublicClient({
        chain: arcTestnet,
        transport: http("https://rpc.testnet.arc.network"),
      });
      const raw = await client.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      }) as bigint;
      setBalance((Number(raw) / 1_000_000).toFixed(2));
    } catch {
      setBalance(null);
    }
    setChecking(false);
  }

  function copyAddress() {
    if (!walletAddress) return;
    navigator.clipboard?.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasBalance = balance !== null && parseFloat(balance) > 0;
  const noBalance = balance !== null && parseFloat(balance) === 0;

  if (compact) {
    // Inline compact version for pay page
    return (
      <div className="rounded-[18px] border border-[rgba(216,196,139,.3)] bg-[rgba(216,196,139,.06)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent-3,#d4c58c)]">
            Need testnet USDC?
          </span>
          {checking && <span className="text-[0.72rem] text-[var(--muted)]">Checking balance...</span>}
          {hasBalance && !checking && (
            <span className="rounded-full bg-[rgba(103,213,138,.12)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--accent-2)]">
              {balance} USDC ready
            </span>
          )}
        </div>
        <p className="mb-3 text-[0.82rem] leading-6 text-[var(--muted)]">
          Arc testnet uses USDC as the gas token. Get free testnet USDC from the Circle Faucet to fund this escrow.
        </p>
        <div className="flex flex-wrap gap-2">
          {walletAddress && (
            <button
              onClick={copyAddress}
              className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] font-semibold text-[var(--text)] transition hover:bg-white/5"
            >
              {copied ? "Copied!" : "Copy my address"}
            </button>
          )}
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[rgba(216,196,139,.15)] px-3 py-2 text-[0.8rem] font-bold text-[var(--accent-3,#d4c58c)] transition hover:bg-[rgba(216,196,139,.22)]"
          >
            Open Circle Faucet ↗
          </a>
          {walletAddress && (
            <button
              onClick={() => checkBalance(walletAddress)}
              disabled={checking}
              className="rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.8rem] text-[var(--muted)] transition hover:text-[var(--text)] disabled:opacity-50"
            >
              {checking ? "Checking..." : "Refresh balance"}
            </button>
          )}
        </div>
        {noBalance && !checking && (
          <p className="mt-2 text-[0.74rem] text-[var(--muted)]">
            Select Arc Testnet on the faucet, paste your address, and click Send 10 USDC. Takes about 10 seconds.
          </p>
        )}
      </div>
    );
  }

  // Full version for onboarding / treasury
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="mb-1 text-base font-bold">Get testnet USDC</h3>
          <p className="text-[0.82rem] text-[var(--muted)]">
            Arc testnet uses USDC as gas. You need testnet USDC to fund escrows, send transfers, and test invoices.
          </p>
        </div>
        {hasBalance && (
          <div className="shrink-0 text-right">
            <div className="font-[family-name:var(--font-cormorant)] text-[1.6rem] tracking-[-0.04em] text-[var(--accent)]">
              {balance} USDC
            </div>
            <div className="text-[0.72rem] text-[var(--muted)]">Current balance</div>
          </div>
        )}
      </div>

      <div className="mb-4 grid gap-2">
        {[
          {
            step: "1",
            title: walletAddress ? "Your wallet address is ready" : "Copy your wallet address",
            detail: walletAddress
              ? `${walletAddress.slice(0, 16)}...${walletAddress.slice(-8)}`
              : "Connect your wallet first to see your address.",
            action: walletAddress ? (
              <button
                onClick={copyAddress}
                className="shrink-0 rounded-xl bg-[rgba(201,255,96,.1)] px-3 py-2 text-[0.78rem] font-bold text-[var(--accent)]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            ) : null,
          },
          {
            step: "2",
            title: "Open the Circle Faucet",
            detail: "Go to faucet.circle.com and select Arc Testnet from the dropdown.",
            action: (
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl bg-[var(--accent)] px-3 py-2 text-[0.78rem] font-bold text-[#08100b]"
              >
                Open ↗
              </a>
            ),
          },
          {
            step: "3",
            title: "Paste your address and request USDC",
            detail: "Select USDC, paste your wallet address, and click Send. You will receive 10 USDC instantly.",
            action: null,
          },
          {
            step: "4",
            title: "Check your balance",
            detail: hasBalance
              ? `Your wallet has ${balance} USDC and is ready to fund escrow.`
              : "After requesting, click Refresh to confirm it arrived.",
            action: walletAddress ? (
              <button
                onClick={() => checkBalance(walletAddress)}
                disabled={checking}
                className="shrink-0 rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-[0.78rem] font-semibold text-[var(--muted)]"
              >
                {checking ? "Checking..." : "Refresh"}
              </button>
            ) : null,
          },
        ].map((item) => (
          <div key={item.step} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(201,255,96,.12)] text-[0.78rem] font-bold text-[var(--accent)]">
              {item.step}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.86rem] font-semibold">{item.title}</div>
              <div className="text-[0.76rem] text-[var(--muted)]">{item.detail}</div>
            </div>
            {item.action}
          </div>
        ))}
      </div>

      {hasBalance && (
        <div className="rounded-xl border border-[var(--line)] bg-[rgba(201,255,96,.06)] px-4 py-3 text-[0.84rem] font-semibold text-[var(--accent)]">
          ✓ Your wallet has {balance} USDC. You are ready to fund escrow.
        </div>
      )}
    </div>
  );
}
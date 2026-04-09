"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPublicClient, http } from "viem";
import { arcTestnet, USDC_ADDRESS } from "@/lib/escrow-client";
import { USDC_ABI } from "@/lib/escrow-abi";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export function ArcBalanceWidget() {
  const [balance, setBalance] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profile } = await supabase
      .from("workspace_profiles")
      .select("linked_wallet_address,wallet_address")
      .eq("user_id", user.id)
      .maybeSingle();

    const addr = (profile as any)?.linked_wallet_address || (profile as any)?.wallet_address;
    if (!addr) { setLoading(false); return; }

    setWallet(addr);

    try {
      const client = createPublicClient({
        chain: arcTestnet,
        transport: http("https://rpc.testnet.arc.network"),
      });
      const raw = await client.readContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [addr as `0x${string}`],
      }) as bigint;
      setBalance((Number(raw) / 1_000_000).toFixed(2));
    } catch {
      setBalance(null);
    }
    setLoading(false);
  }

  if (loading || !wallet) return null;

  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.04)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[rgba(201,255,96,.1)] text-lg">
            ◎
          </div>
          <div>
            <div className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
              Arc testnet wallet
            </div>
            <div className="font-mono text-[0.8rem] text-[var(--muted)]">
              {wallet.slice(0, 10)}...{wallet.slice(-6)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em] text-[var(--accent)]">
              {balance !== null ? `${balance} USDC` : "—"}
            </div>
            <div className="text-[0.72rem] text-[var(--muted)]">Live balance</div>
          </div>
          <Link
            href="/app/treasury"
            className="rounded-xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.8rem] font-bold text-[var(--accent)] transition hover:bg-[rgba(201,255,96,.12)]"
          >
            Treasury
          </Link>
        </div>
      </div>
    </div>
  );
}
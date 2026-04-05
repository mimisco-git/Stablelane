"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { readAccessMode, readWalletHint, shortWallet, type AccessMode } from "@/lib/access-flow";

export function AccessModeBanner() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AccessMode>("preview");
  const [walletHint, setWalletHint] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setMode(readAccessMode());
      setWalletHint(readWalletHint());

      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setEmail(data.session?.user?.email || "");
    }

    load();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || "");
      setMode(readAccessMode());
      setWalletHint(readWalletHint());
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const summary = email
    ? `Signed in as ${email}. Wallet connection stays optional until you need a wallet action.`
    : walletHint
      ? `Using wallet-first access with ${shortWallet(walletHint)}. You can add email later for synced account access.`
      : mode === "preview"
        ? "You are browsing in preview mode. Sign in or connect a wallet later when needed."
        : mode === "wallet"
          ? "Wallet-first access is selected. You can still add email later."
          : "Email-first access is selected. Connect a wallet later when you need funding or release actions.";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4">
      <p className="max-w-3xl text-[0.84rem] leading-6 text-[var(--accent)]">
        {summary}
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/start" className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-2 text-[0.84rem] font-bold text-[var(--accent)]">
          Access options
        </Link>
        {!email ? (
          <Link href="/auth" className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.84rem] font-bold text-[#08100b]">
            Sign in
          </Link>
        ) : null}
      </div>
    </div>
  );
}

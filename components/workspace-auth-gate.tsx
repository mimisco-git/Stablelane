"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { readAccessMode, readWalletHint, type AccessMode } from "@/lib/access-flow";

export function WorkspaceAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<AccessMode>("preview");
  const [walletHint, setWalletHint] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const currentMode = readAccessMode();
      const currentWalletHint = readWalletHint();

      if (!supabase) {
        if (!mounted) return;
        setMode(currentMode);
        setWalletHint(currentWalletHint);
        setAllowed(currentMode === "preview" || Boolean(currentWalletHint));
        setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const activeEmail = data.session?.user?.email || "";
      setEmail(activeEmail);
      setMode(currentMode);
      setWalletHint(currentWalletHint);
      setAllowed(Boolean(activeEmail) || currentMode === "preview" || Boolean(currentWalletHint));
      setReady(true);
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
      setAllowed(Boolean(session?.user?.email) || readAccessMode() === "preview" || Boolean(readWalletHint()));
      setReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!ready) {
    return (
      <div className="mx-auto w-[min(calc(100%-36px),1360px)] py-12">
        <div className="rounded-[24px] border border-white/8 bg-white/3 p-6 text-[0.9rem] text-[var(--muted)]">
          Checking workspace access...
        </div>
      </div>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <main className="mx-auto w-[min(calc(100%-36px),1360px)] py-12">
      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-8 shadow-[0_24px_80px_rgba(0,0,0,.28)]">
        <div className="mb-3 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Protected workspace
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Sign in or connect before entering.
        </h1>
        <p className="mb-5 max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          The workspace now prefers a real access state. Use the unified login screen, connect a wallet, or enter preview mode first.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/auth" className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
            Open unified login
          </Link>
          <Link href="/start" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">
            Open access options
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Email session</div>
            <div className="text-[0.88rem] text-[var(--muted)]">{email || "No email session"}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Access mode</div>
            <div className="text-[0.88rem] text-[var(--muted)]">{mode}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Wallet hint</div>
            <div className="text-[0.88rem] text-[var(--muted)]">{walletHint || "No linked wallet hint"}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

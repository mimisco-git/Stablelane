"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

export function AuthBanner() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      if (!supabase) {
        if (mounted) {
          setEmail("");
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setEmail(data.session?.user?.email || "");
      setLoading(false);
    }

    loadSession();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || "");
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-4 text-[0.84rem] text-[var(--muted)]">
        Checking workspace session...
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4 text-[0.84rem] leading-6 text-[var(--accent)]">
        Authentication is not configured. Add your Supabase project URL and publishable key to your environment variables to enable sign-in.
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4">
        <p className="max-w-3xl text-[0.84rem] leading-6 text-[var(--accent)]">
          You are browsing in preview mode. Sign in to keep invoices and workspace data synced across devices.
        </p>
        <Link href="/auth" className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.84rem] font-bold text-[#08100b]">
          Open sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-white/3 px-4 py-3 text-[0.84rem]">
      <p className="text-[var(--muted)]">
        Signed in as <strong className="text-[var(--text)]">{email}</strong>. Wallet connection stays optional until you need a wallet action.
      </p>
      <Link href="/app/account" className="rounded-full border border-white/8 bg-white/3 px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--text)] transition hover:bg-white/5">
        Access options
      </Link>
    </div>
  );
}

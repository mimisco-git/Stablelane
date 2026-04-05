"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { writeAccessMode } from "@/lib/access-flow";
import {
  clearPendingAuthMethod,
  clearPostAuthNextPath,
  readPendingAuthMethod,
  readPostAuthNextPath,
  sanitizeNextPath,
} from "@/lib/auth-intent";
import { saveLinkedAuthMethod } from "@/lib/supabase-data";

function resolveMethodFromProvider(provider: string | undefined) {
  if (provider === "google") return "google_oauth" as const;
  if (provider === "apple") return "apple_oauth" as const;
  if (provider === "twitter") return "x_oauth" as const;
  return null;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [message, setMessage] = useState("Finishing secure sign-in...");

  useEffect(() => {
    let mounted = true;

    async function finishAuth() {
      if (!supabase) {
        if (mounted) setMessage("Supabase is not configured yet.");
        return;
      }

      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
      const errorDescription = params.get("error_description");

      if (errorDescription) {
        if (mounted) setMessage(errorDescription.replace(/\+/g, " "));
        return;
      }

      const pendingMethod = readPendingAuthMethod();
      const nextPath = sanitizeNextPath(readPostAuthNextPath());

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        writeAccessMode("email");

        const providerMethod = resolveMethodFromProvider(data.session.user.app_metadata?.provider);
        const finalMethod = pendingMethod || providerMethod;
        if (finalMethod && finalMethod !== "wallet_siwe") {
          try {
            await saveLinkedAuthMethod(finalMethod);
          } catch {}
        }

        clearPendingAuthMethod();
        clearPostAuthNextPath();

        if (mounted) setMessage("Secure sign-in complete. Redirecting to your workspace...");
        setTimeout(() => router.push(nextPath || "/app"), 800);
        return;
      }

      if (mounted) setMessage("No active session was found. You can return to sign in.");
    }

    finishAuth();
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  return (
    <main className="mx-auto w-[min(calc(100%-36px),940px)] py-16">
      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.88),rgba(10,18,13,.82))] p-8 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
        <div className="mb-4 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Secure callback
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Stablelane access
        </h1>
        <p className="mb-6 max-w-2xl text-[0.96rem] leading-7 text-[var(--muted)]">
          {message}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/auth" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">
            Back to access
          </Link>
          <Link href="/app" className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]">
            Open workspace
          </Link>
        </div>
      </div>
    </main>
  );
}

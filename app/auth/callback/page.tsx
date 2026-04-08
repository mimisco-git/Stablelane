"use client";

import { useEffect, useMemo } from "react";
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
  if (provider === "twitter") return "x_oauth" as const;
  return null;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    let mounted = true;

    async function finishAuth() {
      if (!supabase) return;

      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
      const errorDescription = params.get("error_description");

      if (errorDescription) {
        router.push(`/auth?error=${encodeURIComponent(errorDescription.replace(/\+/g, " "))}`);
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
          try { await saveLinkedAuthMethod(finalMethod); } catch {}
        }
        clearPendingAuthMethod();
        clearPostAuthNextPath();
        if (mounted) router.push(nextPath || "/app");
        return;
      }

      if (mounted) router.push("/auth");
    }

    finishAuth();
    return () => { mounted = false; };
  }, [router, supabase]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-[0.9rem] text-[var(--muted)]">Signing you in...</p>
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type AuthMode = "signin" | "signup";

export function AuthPanel() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!supabase) {
      setMessage("Supabase environment variables are missing. Add them in Vercel and .env.local first.");
      return;
    }

    if (!email || !password) {
      setMessage("Enter your email and password first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Account created. If email confirmation is enabled, check your inbox before signing in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Signed in successfully. Redirecting to your workspace...");
        setTimeout(() => router.push("/app"), 700);
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Authentication failed.";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
      <section className="rounded-[24px] border border-white/8 bg-white/3 p-6">
        <div className="mb-4 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Stage 4 auth
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Sign in to save real invoice drafts
        </h1>
        <p className="mb-6 max-w-2xl text-[0.96rem] leading-7 text-[var(--muted)]">
          This stage connects Stablelane to Supabase so draft invoices can live in a real database instead of only inside one browser.
        </p>

        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setMode("signin")}
            className={`rounded-full px-4 py-2 text-[0.86rem] font-semibold ${
              mode === "signin"
                ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
                : "border border-white/8 bg-white/3 text-[var(--muted)]"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-2 text-[0.86rem] font-semibold ${
              mode === "signup"
                ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
                : "border border-white/8 bg-white/3 text-[var(--muted)]"
            }`}
          >
            Create account
          </button>
        </div>

        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
            />
          </label>

          <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password"
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
            />
          </label>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
          >
            {loading ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>

          {message ? (
            <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] leading-6 text-[var(--accent)]">
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <aside className="rounded-[24px] border border-white/8 bg-white/3 p-6">
        <h2 className="mb-4 text-base font-bold tracking-normal">What this stage unlocks</h2>
        <div className="grid gap-3">
          {[
            "Invoices saved to Supabase instead of only local browser storage.",
            "The invoices screen can load your own draft records across devices once you sign in.",
            "The app now has a path toward real workspace ownership and per-user data.",
            "Next we can connect dashboard numbers, clients, and contract states to the same source of truth.",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
              {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

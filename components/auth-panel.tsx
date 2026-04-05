"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getBaseUrl } from "@/lib/url";
import { readWalletHint, shortWallet, writeAccessMode } from "@/lib/access-flow";

type AuthMode = "signin" | "signup";
type AuthMethod = "password" | "magic";

type SessionState = {
  email: string;
} | null;

export function AuthPanel() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [method, setMethod] = useState<AuthMethod>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>(null);
  const [walletHint, setWalletHint] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadState() {
      setWalletHint(readWalletHint());

      if (!supabase) return;

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const activeEmail = data.session?.user?.email || "";
      if (activeEmail) {
        setSessionState({ email: activeEmail });
      }
    }

    loadState();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeEmail = session?.user?.email || "";
      setSessionState(activeEmail ? { email: activeEmail } : null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handlePasswordSubmit() {
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
          options: {
            emailRedirectTo: `${getBaseUrl()}/auth/callback`,
          },
        });
        if (error) throw error;
        writeAccessMode("email");
        setMessage("Account created. Check your inbox for the confirmation email, then return here and sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        writeAccessMode("email");
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

  async function handleMagicLink() {
    if (!supabase) {
      setMessage("Supabase environment variables are missing. Add them in Vercel and .env.local first.");
      return;
    }

    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${getBaseUrl()}/auth/callback`,
        },
      });
      if (error) throw error;
      writeAccessMode("email");
      setMessage(
        mode === "signup"
          ? "Magic signup link sent. Open the email to finish creating your workspace access."
          : "Magic sign-in link sent. Open the email to continue securely."
      );
    } catch (error) {
      const text = error instanceof Error ? error.message : "Magic link failed.";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  async function continueToWorkspace() {
    writeAccessMode("email");
    router.push("/app");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
      <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.26)]">
        <div className="mb-4 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Fintech access
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Clean sign-in, wallet later.
        </h1>
        <p className="mb-6 max-w-2xl text-[0.96rem] leading-7 text-[var(--muted)]">
          Stablelane now treats email account access and wallet connection as two separate layers. Sign in like a finance product first, then connect your wallet later only when a real Arc action needs it.
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
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

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setMethod("password")}
            className={`rounded-full px-4 py-2 text-[0.82rem] font-semibold ${
              method === "password"
                ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
                : "border border-white/8 bg-white/3 text-[var(--muted)]"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMethod("magic")}
            className={`rounded-full px-4 py-2 text-[0.82rem] font-semibold ${
              method === "magic"
                ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
                : "border border-white/8 bg-white/3 text-[var(--muted)]"
            }`}
          >
            Magic link
          </button>
        </div>

        {sessionState ? (
          <div className="mb-5 rounded-[22px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4">
            <div className="mb-1 text-[0.8rem] uppercase tracking-[0.08em] text-[var(--accent)]">Active session</div>
            <div className="mb-2 text-lg font-semibold text-[var(--text)]">{sessionState.email}</div>
            <p className="mb-3 text-[0.84rem] leading-6 text-[var(--accent)]">
              You are already signed in. Open the workspace now, then connect wallet later only when you need funding or release actions.
            </p>
            <button
              onClick={continueToWorkspace}
              className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
            >
              Continue to workspace
            </button>
          </div>
        ) : null}

        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Work email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
            />
          </label>

          {method === "password" ? (
            <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
              <span>Password</span>
              <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Create a secure password" : "Enter your password"}
                  className="w-full bg-transparent px-1 py-1 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((value) => !value)}
                  className="rounded-full border border-white/8 bg-white/3 px-3 py-2 text-[0.75rem] font-semibold text-[var(--text)]"
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
              Send a secure email link and finish sign-in without typing a password on this device.
            </div>
          )}

          <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[0.82rem] text-[var(--muted)]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>{rememberMe ? "Keep this workspace remembered on this device" : "Session will be treated as lightweight on this device"}</span>
          </label>

          <button
            onClick={method === "password" ? handlePasswordSubmit : handleMagicLink}
            disabled={loading}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
          >
            {loading
              ? "Working..."
              : method === "magic"
                ? mode === "signup"
                  ? "Send magic signup link"
                  : "Send magic sign-in link"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
          </button>

          <div className="flex flex-wrap gap-2">
            <Link href="/app" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.86rem] font-semibold text-[var(--text)]">
              Browse in preview
            </Link>
            <Link href="/start" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.86rem] font-semibold text-[var(--text)]">
              Open access options
            </Link>
          </div>

          {message ? (
            <div className={`rounded-2xl px-4 py-3 text-[0.84rem] leading-6 ${
              message.toLowerCase().includes("failed") || message.toLowerCase().includes("missing")
                ? "border border-white/8 bg-white/3 text-[var(--muted)]"
                : "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
            }`}>
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <aside className="rounded-[28px] border border-white/8 bg-white/3 p-6">
        <div className="mb-4 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Why this feels better
        </div>

        <div className="grid gap-3">
          {[
            {
              title: "Email-first account access",
              body: "The saved workspace, invoices, approvals, and team records all belong to your email account flow. That keeps sign-in clear and finance-like.",
            },
            {
              title: "Wallet stays optional",
              body: "Wallet connection should only happen when you explicitly need Arc funding, Gateway, escrow, or release actions.",
            },
            {
              title: "Magic link fallback",
              body: "A cleaner login option for devices where you do not want to type a password or where you want a lighter sign-in experience.",
            },
            {
              title: "Wallet hint, not wallet pressure",
              body: walletHint
                ? `A wallet is already remembered here as ${shortWallet(walletHint)}. You can attach it later inside the product.`
                : "No wallet is attached yet, which is completely fine until a real payment action is needed.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 font-semibold text-[var(--text)]">{item.title}</div>
              <div className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.body}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4">
          <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--accent)]">Fintech login rule</div>
          <p className="text-[0.84rem] leading-6 text-[var(--accent)]">
            Users should never feel forced into wallet connection before basic account access is settled.
          </p>
        </div>
      </aside>
    </div>
  );
}

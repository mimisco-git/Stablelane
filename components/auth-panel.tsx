"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getBaseUrl } from "@/lib/url";
import { buildWalletAuthMessage } from "@/lib/wallet-auth";
import {
  getSocialProviderOptions,
  getWalletProviderOptions,
  type SocialProviderKey,
} from "@/lib/auth-options";
import {
  readVerifiedWallet,
  readWalletHint,
  shortWallet,
  writeAccessMode,
  writeVerifiedWallet,
  writeWalletHint,
} from "@/lib/access-flow";
import { saveLinkedAuthMethod } from "@/lib/supabase-data";

type AuthMode = "signin" | "signup";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

function WalletIcon({ label }: { label: string }) {
  const base = "flex h-9 w-9 items-center justify-center rounded-full text-[0.82rem] font-black";
  if (label.toLowerCase().includes("meta")) return <div className={`${base} bg-[rgba(249,115,22,.16)] text-[#fb923c]`}>M</div>;
  if (label.toLowerCase().includes("coin")) return <div className={`${base} bg-[rgba(59,130,246,.16)] text-[#60a5fa]`}>C</div>;
  return <div className={`${base} bg-[rgba(168,85,247,.16)] text-[#c084fc]`}>W</div>;
}

function SocialIcon({ label }: { label: "Google" | "Apple" | "X" }) {
  const base = "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-sm font-black";
  if (label === "Google") return <div className={`${base} text-[#fbbc05]`}>G</div>;
  if (label === "Apple") return <div className={`${base} text-white`}></div>;
  return <div className={`${base} text-white`}>X</div>;
}

export function AuthPanel() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const socialProviders = useMemo(() => getSocialProviderOptions().filter((item) => item.enabled), []);
  const walletProviders = useMemo(() => getWalletProviderOptions(), []);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [walletHint, setWalletHint] = useState("");
  const [verifiedWallet, setVerifiedWallet] = useState("");
  const [activeEmail, setActiveEmail] = useState("");
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setWalletHint(readWalletHint());
      setVerifiedWallet(readVerifiedWallet());

      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setActiveEmail(data.session?.user?.email || "");

      try {
        const response = await fetch("/api/wallet-auth/session");
        const json = await response.json();
        if (mounted && json?.verified && json?.address) {
          setVerifiedWallet(json.address);
          writeVerifiedWallet(json.address);
        }
      } catch {}
    }

    load();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setActiveEmail(session?.user?.email || "");
      setWalletHint(readWalletHint());
      setVerifiedWallet(readVerifiedWallet());
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handlePasswordSubmit() {
    if (!supabase) {
      setMessage("Supabase environment variables are missing. Add them first.");
      return;
    }

    if (!email || !password) {
      setMessage("Enter your email and password first.");
      return;
    }

    setLoading("password");
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
        setMessage("Account created. Check your email to confirm the account, then come back and continue.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        writeAccessMode("email");
        try { await saveLinkedAuthMethod("email_password"); } catch {}
        setMessage("Signed in successfully. Redirecting to your workspace...");
        setTimeout(() => router.push("/app"), 700);
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Authentication failed.";
      setMessage(text);
    } finally {
      setLoading("");
    }
  }

  async function handleMagicLink() {
    if (!supabase) {
      setMessage("Supabase environment variables are missing. Add them first.");
      return;
    }

    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    setLoading("magic");
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
      try { await saveLinkedAuthMethod("email_magic_link"); } catch {}
      setMessage(
        mode === "signup"
          ? "Magic signup link sent. Open your email to finish joining."
          : "Magic sign-in link sent. Open your email to continue securely."
      );
    } catch (error) {
      const text = error instanceof Error ? error.message : "Magic link failed.";
      setMessage(text);
    } finally {
      setLoading("");
    }
  }

  async function handleOAuth(provider: SocialProviderKey) {
    if (!supabase) {
      setMessage("Supabase environment variables are missing. Add them first.");
      return;
    }

    setLoading(provider);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${getBaseUrl()}/auth/callback`,
        },
      });
      if (error) throw error;
      writeAccessMode("email");
      try {
        await saveLinkedAuthMethod(provider === "google" ? "google_oauth" : provider === "apple" ? "apple_oauth" : "x_oauth");
      } catch {}
    } catch (error) {
      const text = error instanceof Error ? error.message : "OAuth sign-in failed.";
      setMessage(text);
      setLoading("");
    }
  }

  async function handleWalletVerify() {
    const provider = getEthereumProvider();

    if (!provider) {
      setMessage("No supported browser wallet was detected. Use email or preview mode, or install a wallet first.");
      return;
    }

    setLoading("wallet");
    setMessage("");

    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const selected = accounts?.[0] || "";
      if (!selected) throw new Error("No wallet account was returned.");

      const chainIdHex = (await provider.request({ method: "eth_chainId" })) as string;
      const chainId = Number.parseInt(chainIdHex, 16);

      const nonceResponse = await fetch("/api/wallet-auth/nonce", {
        method: "POST",
      });
      const challenge = await nonceResponse.json();

      if (!challenge?.nonce || !challenge?.issuedAt || !challenge?.domain || !challenge?.uri) {
        throw new Error("Wallet challenge could not be created.");
      }

      const messageToSign = buildWalletAuthMessage({
        address: selected,
        nonce: challenge.nonce,
        domain: challenge.domain,
        uri: challenge.uri,
        chainId,
        issuedAt: challenge.issuedAt,
      });

      const signature = (await provider.request({
        method: "personal_sign",
        params: [messageToSign, selected],
      })) as string;

      const verifyResponse = await fetch("/api/wallet-auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: selected,
          signature,
          chainId,
        }),
      });

      const verifyJson = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyJson?.ok || !verifyJson?.address) {
        throw new Error(verifyJson?.error || "Wallet verification failed.");
      }

      writeAccessMode("wallet");
      writeWalletHint(selected);
      writeVerifiedWallet(verifyJson.address);
      setWalletHint(selected);
      setVerifiedWallet(verifyJson.address);
      setMessage(`Wallet verified as ${shortWallet(verifyJson.address)}. This is now stronger than a plain wallet connect step.`);
      setTimeout(() => router.push("/app"), 700);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Wallet verification failed.";
      setMessage(text);
    } finally {
      setLoading("");
    }
  }

  function continueExistingSession() {
    writeAccessMode(activeEmail ? "email" : "wallet");
    router.push("/app");
  }

  const currentAccess = activeEmail || verifiedWallet || walletHint;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.04fr_.96fr]">
      <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.94),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.3)]">
        <div className="mb-4 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Unified access
        </div>

        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-[clamp(2.8rem,5vw,4.5rem)] leading-none tracking-[-0.055em] text-[var(--text)]">
          One premium login, now with verified wallet access.
        </h1>
        <p className="mb-6 max-w-2xl text-[0.96rem] leading-7 text-[var(--muted)]">
          Email, wallet, and social entry now live on one screen, and the wallet path now verifies a signed challenge instead of only asking for a connection.
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
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
            type="button"
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

        {currentAccess ? (
          <div className="mb-5 rounded-[22px] border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4">
            <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--accent)]">Current access</div>
            <div className="mb-2 text-lg font-semibold text-[var(--text)]">
              {activeEmail || shortWallet(verifiedWallet || walletHint)}
            </div>
            <p className="mb-3 text-[0.84rem] leading-6 text-[var(--accent)]">
              {activeEmail
                ? "You already have an active email session. Continue straight into the workspace."
                : verifiedWallet
                  ? "A verified wallet session already exists in this browser."
                  : "A wallet hint exists in this browser, but wallet verification is still better for stronger access."}
            </p>
            <button
              type="button"
              onClick={continueExistingSession}
              className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
            >
              Continue to workspace
            </button>
          </div>
        ) : null}

        <div className="grid gap-3">
          <label className="grid gap-2 text-[0.84rem] text-[var(--muted)]">
            <span>Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--muted-2)]"
            />
          </label>

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

          <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-[0.82rem] text-[var(--muted)]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>{rememberMe ? "Keep this workspace remembered on this device" : "Use a lighter session on this device"}</span>
          </label>

          <button
            type="button"
            onClick={handlePasswordSubmit}
            disabled={Boolean(loading)}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.96rem] font-bold text-[#08100b] disabled:opacity-70"
          >
            {loading === "password" ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={Boolean(loading)}
            className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.9rem] font-semibold text-[var(--text)] disabled:opacity-70"
          >
            {loading === "magic" ? "Sending..." : mode === "signup" ? "Join with magic link" : "Sign in with magic link"}
          </button>

          <div className="relative py-1">
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
            <div className="relative mx-auto flex w-fit items-center justify-center bg-[rgb(12,18,14)] px-4 text-[0.82rem] text-[var(--muted)]">
              or continue with
            </div>
          </div>

          {walletProviders.length ? (
            <div className="grid gap-2 md:grid-cols-2">
              {walletProviders.map((wallet) => (
                <button
                  key={wallet.key}
                  type="button"
                  onClick={handleWalletVerify}
                  disabled={Boolean(loading)}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-70"
                >
                  <WalletIcon label={wallet.label} />
                  <div>
                    <div className="text-[0.9rem] font-semibold text-[var(--text)]">{wallet.label}</div>
                    <div className="text-[0.72rem] text-[var(--muted)]">Verified wallet access</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
              No supported browser wallet is detected on this device right now.
            </div>
          )}

          {socialProviders.length ? (
            <div className="grid gap-2 md:grid-cols-3">
              {socialProviders.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleOAuth(item.key)}
                  disabled={Boolean(loading)}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-70"
                >
                  <SocialIcon label={item.label} />
                  <div>
                    <div className="text-[0.9rem] font-semibold text-[var(--text)]">Continue with {item.label}</div>
                    <div className="text-[0.72rem] text-[var(--muted)]">Enabled provider</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
              No social providers are enabled yet. Turn them on in Supabase and Vercel first.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link href="/app" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.86rem] font-semibold text-[var(--text)]">
              Browse in preview
            </Link>
            <Link href="/app/identity" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.86rem] font-semibold text-[var(--text)]">
              Open identity center
            </Link>
          </div>

          {message ? (
            <div className={`rounded-2xl px-4 py-3 text-[0.84rem] leading-6 ${
              message.toLowerCase().includes("failed") || message.toLowerCase().includes("missing") || message.toLowerCase().includes("no supported")
                ? "border border-white/8 bg-white/3 text-[var(--muted)]"
                : "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--accent)]"
            }`}>
              {message}
            </div>
          ) : null}
        </div>
      </section>

      <aside className="rounded-[30px] border border-white/8 bg-white/3 p-6">
        <div className="mb-4 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Verified wallet auth
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold text-[var(--text)]">Stronger than plain connect</div>
            <div className="text-[0.84rem] leading-6 text-[var(--muted)]">
              The wallet path now signs a challenge and verifies it on the server before the workspace treats the wallet as a verified session.
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold text-[var(--text)]">Still compatible with email</div>
            <div className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Email remains the primary synced identity layer, but verified wallet access now feels more real when users want a web3-first entry.
            </div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-2 font-semibold text-[var(--text)]">Ready for better linking</div>
            <div className="text-[0.84rem] leading-6 text-[var(--muted)]">
              The next step after this is to merge verified wallet sessions and email sessions even more tightly across the workspace profile.
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4">
          <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--accent)]">Implementation note</div>
          <p className="text-[0.84rem] leading-6 text-[var(--accent)]">
            This stage adds a SIWE-style signed challenge and verification flow using viem. It is stronger than plain wallet connect, but it is not yet full wallet-to-Supabase account unification.
          </p>
        </div>
      </aside>
    </div>
  );
}

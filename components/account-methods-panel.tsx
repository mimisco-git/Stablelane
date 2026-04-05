"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import {
  getSocialProviderOptions,
  getWalletProviderOptions,
  type SocialProviderKey,
} from "@/lib/auth-options";
import { readWalletHint, shortWallet, writeAccessMode, writeWalletHint } from "@/lib/access-flow";
import { getBaseUrl } from "@/lib/url";
import { InlineNotice, LoadingState } from "@/components/ui-state";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function AccountMethodsPanel() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const socialProviders = useMemo(() => getSocialProviderOptions(), []);
  const walletProviders = useMemo(() => getWalletProviderOptions(), []);
  const [email, setEmail] = useState("");
  const [walletHint, setWalletHint] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setWalletHint(readWalletHint());

      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setEmail(data.session?.user?.email || "");
      setLoading(false);
    }

    load();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || "");
      setWalletHint(readWalletHint());
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function connectWallet() {
    const provider = getEthereumProvider();
    if (!provider) {
      setMessage("No browser wallet was detected on this device.");
      return;
    }

    setBusy("wallet");
    setMessage("");

    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const selected = accounts?.[0] || "";
      if (!selected) throw new Error("No wallet account was returned.");

      writeWalletHint(selected);
      writeAccessMode(email ? "email" : "wallet");
      setWalletHint(selected);
      setMessage(`Wallet linked in this browser as ${shortWallet(selected)}.`);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Wallet linking failed.";
      setMessage(text);
    } finally {
      setBusy("");
    }
  }

  function unlinkWallet() {
    writeWalletHint("");
    setWalletHint("");
    setMessage("Wallet hint removed from this browser.");
  }

  async function continueWithProvider(provider: SocialProviderKey) {
    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    setBusy(provider);
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
    } catch (error) {
      const text = error instanceof Error ? error.message : "OAuth could not start.";
      setMessage(text);
      setBusy("");
    }
  }

  async function signOutEmail() {
    if (!supabase) return;
    setBusy("signout");
    setMessage("");
    try {
      await supabase.auth.signOut();
      setEmail("");
      setMessage("Email session signed out.");
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return <LoadingState title="Loading account methods" detail="Stablelane is checking your email session, wallet hint, and enabled access methods." />;
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Account methods
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Make access feel real.
        </h1>
        <p className="max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          This page shows the methods currently attached to this workspace session and hides providers that are not actually enabled or available.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Current methods</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Your current email session and wallet hint for this browser.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Email account</div>
              <div className="font-semibold text-[var(--text)]">{email || "No active email session"}</div>
              {email ? (
                <button
                  type="button"
                  onClick={signOutEmail}
                  disabled={busy === "signout"}
                  className="mt-3 rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.82rem] font-semibold text-[var(--text)] disabled:opacity-70"
                >
                  {busy === "signout" ? "Signing out..." : "Sign out email"}
                </button>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Wallet</div>
              <div className="font-semibold text-[var(--text)]">{walletHint ? shortWallet(walletHint) : "No wallet linked in this browser"}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={busy === "wallet"}
                  className="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.82rem] font-bold text-[#08100b] disabled:opacity-70"
                >
                  {busy === "wallet" ? "Connecting..." : walletHint ? "Replace wallet" : "Connect wallet"}
                </button>
                {walletHint ? (
                  <button
                    type="button"
                    onClick={unlinkWallet}
                    className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.82rem] font-semibold text-[var(--text)]"
                  >
                    Unlink wallet hint
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Enabled providers</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Social methods only appear when they are actually enabled. Wallet methods only appear when they are actually detected.
            </p>
          </div>

          <div className="grid gap-3">
            {socialProviders.filter((item) => item.enabled).length ? (
              socialProviders.filter((item) => item.enabled).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => continueWithProvider(item.key)}
                  disabled={busy === item.key}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-left disabled:opacity-70"
                >
                  <div>
                    <div className="font-semibold text-[var(--text)]">{item.label}</div>
                    <div className="text-[0.78rem] text-[var(--muted)]">OAuth provider enabled</div>
                  </div>
                  <span className="text-[0.78rem] font-semibold text-[var(--accent)]">
                    {busy === item.key ? "Opening..." : "Use"}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
                No social providers are enabled yet. Add the corresponding Vercel and Supabase settings first.
              </div>
            )}

            {walletProviders.length ? (
              walletProviders.map((item) => (
                <div key={item.key} className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                  <div className="font-semibold text-[var(--text)]">{item.label}</div>
                  <div className="text-[0.78rem] text-[var(--muted)]">Detected in this browser</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
                No injected wallet was detected in this browser right now.
              </div>
            )}
          </div>
        </section>
      </div>

      {message ? (
        <InlineNotice
          title="Account methods"
          detail={message}
          tone={message.toLowerCase().includes("failed") || message.toLowerCase().includes("not") ? "warning" : "success"}
        />
      ) : null}
    </div>
  );
}

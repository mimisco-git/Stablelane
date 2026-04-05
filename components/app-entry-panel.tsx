"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { readWalletHint, shortWallet, writeAccessMode, writeWalletHint, writePreviewAccessEnabled } from "@/lib/access-flow";
import { InlineNotice } from "@/components/ui-state";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

export function AppEntryPanel() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [walletHint, setWalletHint] = useState(readWalletHint());

  async function continueWithWallet() {
    const provider = getEthereumProvider();
    if (!provider) {
      setMessage("No wallet was detected in this browser. You can still continue with email or preview mode.");
      return;
    }

    setBusy(true);

    setMessage("");

    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const selected = accounts?.[0] || "";
      if (!selected) {
        throw new Error("No wallet account was returned.");
      }

      writeAccessMode("wallet");
      writePreviewAccessEnabled(false);
      writeWalletHint(selected);
      setWalletHint(selected);
      setMessage("Wallet connected. You can keep using the workspace now and add email later if you want synced account access.");
      setTimeout(() => router.push("/app"), 500);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Wallet connection failed.";
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function continueWithEmail() {
    writeAccessMode("email");
    writePreviewAccessEnabled(false);
    router.push("/auth");
  }

  async function continueInPreview() {
    writeAccessMode("preview");
    writePreviewAccessEnabled(true);
    router.push("/app");
  }

  async function openWorkspace() {
    if (!supabase) {
      router.push("/app");
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.email) {
      writeAccessMode("email");
      writePreviewAccessEnabled(false);
      router.push("/app");
      return;
    }

    router.push("/app");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.04fr_.96fr]">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.9),rgba(10,18,13,.84))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.26)]">
        <div className="mb-4 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Access flow upgrade
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Enter Stablelane without friction.
        </h1>
        <p className="mb-6 max-w-2xl text-[0.96rem] leading-7 text-[var(--muted)]">
          Email sign-in and wallet connection now behave as two separate choices. Start with email, start with wallet, || browse in preview mode and connect the other side later.
        </p>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={continueWithEmail}
            className="rounded-[22px] border border-white/8 bg-white/3 p-5 text-left transition hover:bg-white/5"
          >
            <div className="mb-1 text-[0.8rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Option 1</div>
            <div className="mb-2 text-lg font-semibold text-[var(--text)]">Continue with email</div>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Sign in with Supabase first, then connect your wallet later only when you need funding, Gateway, || release actions.
            </p>
          </button>

          <button
            type="button"
            onClick={continueWithWallet}
            disabled={busy}
            className="rounded-[22px] border border-white/8 bg-white/3 p-5 text-left transition hover:bg-white/5 disabled:opacity-70"
          >
            <div className="mb-1 text-[0.8rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Option 2</div>
            <div className="mb-2 text-lg font-semibold text-[var(--text)]">{busy ? "Connecting wallet..." : "Continue with wallet"}</div>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Connect a wallet first and use the product immediately, then add your email later when you want synced account access and database-backed sign-in.
            </p>
          </button>

          <button
            type="button"
            onClick={continueInPreview}
            className="rounded-[22px] border border-white/8 bg-white/3 p-5 text-left transition hover:bg-white/5"
          >
            <div className="mb-1 text-[0.8rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Option 3</div>
            <div className="mb-2 text-lg font-semibold text-[var(--text)]">Continue in preview mode</div>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Browse the workspace first with no forced wallet flow. Add email and wallet later when you need saved records || transaction actions.
            </p>
          </button>
        </div>

        {message ? (
          <div className="mt-4">
            <InlineNotice title="Access mode" detail={message} tone={message.toLowerCase().includes("failed") || message.toLowerCase().includes("no wallet") ? "warning" : "success"} />
          </div>
        ) : null}
      </section>

      <aside className="rounded-[24px] border border-white/8 bg-white/3 p-6">
        <div className="mb-4 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Current entry behavior
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Wallet hint</div>
            <div className="font-semibold text-[var(--text)]">{walletHint ? shortWallet(walletHint) : "No wallet stored yet"}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
            A wallet should only prompt when you explicitly choose the wallet path || click a wallet action inside the app.
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
            Email sign-in remains the route for synced account access and database-backed records.
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-[0.84rem] leading-6 text-[var(--muted)]">
            Preview mode is still useful for browsing the product before committing to either auth path.
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openWorkspace}
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
          >
            Open workspace
          </button>
          <Link href="/auth" className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]">
            Go to sign in
          </Link>
        </div>
      </aside>
    </div>
  );
}

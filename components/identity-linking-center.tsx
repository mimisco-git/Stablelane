"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearLinkedWalletAddress,
  createWorkspaceAuditEvent,
  fetchIdentitySummary,
  saveLinkedWalletAddress,
} from "@/lib/supabase-data";
import { getSocialProviderOptions, getWalletProviderOptions } from "@/lib/auth-options";
import { readWalletHint, shortWallet, writeWalletHint } from "@/lib/access-flow";
import { InlineNotice, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type IdentitySummary = {
  workspace_name: string;
  role_type: string;
  default_currency: "USDC" | "EURC";
  linked_wallet_address: string | null;
  linked_auth_methods: string[];
  email: string | null;
};

export function IdentityLinkingCenter() {
  const socialProviders = useMemo(() => getSocialProviderOptions(), []);
  const walletProviders = useMemo(() => getWalletProviderOptions(), []);
  const [identity, setIdentity] = useState<IdentitySummary | null>(null);
  const [walletHint, setWalletHint] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function loadIdentity() {
    setLoading(true);
    try {
      const [summary] = await Promise.all([
        fetchIdentitySummary(),
      ]);
      setIdentity(summary as IdentitySummary | null);
      setWalletHint(readWalletHint());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIdentity();
  }, []);

  async function linkWalletHintToProfile() {
    if (!identity?.email) {
      setMessage("Sign in with email first before linking a wallet to the workspace profile.");
      return;
    }
    if (!walletHint) {
      setMessage("Connect a wallet first so there is a wallet hint to link.");
      return;
    }

    setBusy("link-wallet");
    setMessage("");
    try {
      await saveLinkedWalletAddress(walletHint);
      await createWorkspaceAuditEvent({
        event_type: "identity_wallet_linked",
        title: "Wallet linked to workspace identity",
        detail: `Wallet ${shortWallet(walletHint)} was linked to the signed-in workspace identity.`,
        metadata: { walletHint },
      });
      setMessage("Wallet linked into the workspace profile.");
      await loadIdentity();
    } catch {
      setMessage("Wallet could not be linked into the workspace profile.");
    } finally {
      setBusy("");
    }
  }

  async function unlinkWalletFromProfile() {
    setBusy("unlink-wallet");
    setMessage("");
    try {
      await clearLinkedWalletAddress();
      writeWalletHint("");
      await createWorkspaceAuditEvent({
        event_type: "identity_wallet_unlinked",
        title: "Wallet unlinked from workspace identity",
        detail: "The workspace-linked wallet was removed from the profile.",
      });
      setMessage("Wallet removed from the workspace profile.");
      await loadIdentity();
    } catch {
      setMessage("Wallet could not be removed from the workspace profile.");
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return <LoadingState title="Loading identity center" detail="Stablelane is reading the current email session, linked wallet state, and enabled providers." />;
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Identity center
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Link access methods more realistically.
        </h1>
        <p className="max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          This build starts moving Stablelane from browser-only hints toward a real linked identity model inside the workspace profile.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.04fr_.96fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Current identity state</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              See how the workspace currently understands the signed-in account and wallet linkage.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Signed-in email</div>
              <div className="font-semibold text-[var(--text)]">{identity?.email || "No active email session"}</div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Browser wallet hint</div>
              <div className="font-semibold text-[var(--text)]">{walletHint ? shortWallet(walletHint) : "No wallet hint in this browser"}</div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Profile-linked wallet</div>
              <div className="font-semibold text-[var(--text)]">
                {identity?.linked_wallet_address ? shortWallet(identity.linked_wallet_address) : "No workspace-linked wallet yet"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Linked auth methods</div>
              <div className="flex flex-wrap gap-2">
                {identity?.linked_auth_methods?.length ? (
                  identity.linked_auth_methods.map((method) => (
                    <StatusPill key={method} label={method} tone="live" />
                  ))
                ) : (
                  <span className="text-[0.84rem] text-[var(--muted)]">No linked methods stored yet.</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={linkWalletHintToProfile}
                disabled={busy === "link-wallet"}
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
              >
                {busy === "link-wallet" ? "Linking..." : "Link browser wallet to profile"}
              </button>
              <button
                type="button"
                onClick={unlinkWalletFromProfile}
                disabled={busy === "unlink-wallet"}
                className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)] disabled:opacity-70"
              >
                {busy === "unlink-wallet" ? "Removing..." : "Remove linked wallet"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Method readiness</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              A clearer look at which access methods are genuinely available right now.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 font-semibold text-[var(--text)]">Enabled social providers</div>
              <div className="flex flex-wrap gap-2">
                {socialProviders.filter((item) => item.enabled).length ? (
                  socialProviders.filter((item) => item.enabled).map((item) => (
                    <StatusPill key={item.key} label={item.label} tone="done" />
                  ))
                ) : (
                  <span className="text-[0.84rem] text-[var(--muted)]">No social providers enabled yet.</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="mb-2 font-semibold text-[var(--text)]">Detected wallets</div>
              <div className="flex flex-wrap gap-2">
                {walletProviders.length ? (
                  walletProviders.map((item) => (
                    <StatusPill key={item.key} label={item.label} tone="done" />
                  ))
                ) : (
                  <span className="text-[0.84rem] text-[var(--muted)]">No browser wallet detected right now.</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] p-4">
              <div className="mb-2 font-semibold text-[var(--accent)]">What this stage makes real</div>
              <div className="grid gap-2 text-[0.84rem] leading-6 text-[var(--accent)]">
                <div>• the linked wallet can now be stored on the workspace profile</div>
                <div>• the auth screen only shows methods that are actually available</div>
                <div>• identity linking actions now write into the audit trail</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {message ? (
        <InlineNotice
          title="Identity center"
          detail={message}
          tone={message.toLowerCase().includes("could not") || message.toLowerCase().includes("sign in") ? "warning" : "success"}
        />
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createWorkspaceAuditEvent,
  fetchIdentitySummary,
  saveVerifiedWalletLink,
  clearLinkedWalletAddress,
} from "@/lib/supabase-data";
import { getSocialProviderOptions, getWalletProviderOptions } from "@/lib/auth-options";
import { readVerifiedWallet, shortWallet, writeVerifiedWallet, writeWalletHint } from "@/lib/access-flow";
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
  const [verifiedWallet, setVerifiedWallet] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function loadIdentity() {
    setLoading(true);
    try {
      const [summary] = await Promise.all([fetchIdentitySummary()]);
      setIdentity(summary as IdentitySummary | null);
      setVerifiedWallet(readVerifiedWallet());

      try {
        const response = await fetch("/api/wallet-auth/session");
        const json = await response.json();
        if (json?.verified && json?.address) {
          setVerifiedWallet(json.address);
          writeVerifiedWallet(json.address);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIdentity();
  }, []);

  async function linkVerifiedWalletToProfile() {
    if (!identity?.email) {
      setMessage("Sign in with email first before linking a verified wallet to the workspace profile.");
      return;
    }
    if (!verifiedWallet) {
      setMessage("Verify a wallet first from the auth screen before linking it to the workspace profile.");
      return;
    }

    setBusy("link-wallet");
    setMessage("");
    try {
      await saveVerifiedWalletLink(verifiedWallet);
      await createWorkspaceAuditEvent({
        event_type: "identity_wallet_verified_linked",
        title: "Verified wallet linked to workspace identity",
        detail: `Verified wallet ${shortWallet(verifiedWallet)} was linked to the signed-in workspace identity.`,
        metadata: { verifiedWallet },
      });
      setMessage("Verified wallet linked into the workspace profile.");
      await loadIdentity();
    } catch {
      setMessage("Verified wallet could not be linked into the workspace profile.");
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
      writeVerifiedWallet("");
      await fetch("/api/wallet-auth/logout", { method: "POST" });
      await createWorkspaceAuditEvent({
        event_type: "identity_wallet_unlinked",
        title: "Wallet unlinked from workspace identity",
        detail: "The workspace-linked wallet was removed from the profile and verified session cache.",
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
    return <LoadingState title="Loading identity center" detail="Stablelane is reading the current email session, verified wallet state, and enabled providers." />;
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Identity center
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Link verified identity methods.
        </h1>
        <p className="max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          This build moves Stablelane beyond browser-only wallet hints by letting a server-verified wallet session become part of the workspace profile.
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
              <div className="mb-1 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--muted-2)]">Verified wallet session</div>
              <div className="font-semibold text-[var(--text)]">{verifiedWallet ? shortWallet(verifiedWallet) : "No verified wallet session yet"}</div>
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
                onClick={linkVerifiedWalletToProfile}
                disabled={busy === "link-wallet"}
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b] disabled:opacity-70"
              >
                {busy === "link-wallet" ? "Linking..." : "Link verified wallet to profile"}
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
                <div>• wallet access now uses a signed challenge</div>
                <div>• verified wallet sessions can now be linked to the workspace profile</div>
                <div>• the workspace gate now prefers verified wallet access over plain wallet hints</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {message ? (
        <InlineNotice
          title="Identity center"
          detail={message}
          tone={message.toLowerCase().includes("could not") || message.toLowerCase().includes("sign in") || message.toLowerCase().includes("verify") ? "warning" : "success"}
        />
      ) : null}
    </div>
  );
}

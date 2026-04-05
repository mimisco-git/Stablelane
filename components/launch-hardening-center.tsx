"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site";
import {
  fetchIdentitySummary,
  fetchNotificationPreferences,
  fetchWorkspaceAuditEvents,
  fetchSettlementLedger,
  fetchRemoteInvoiceDrafts,
} from "@/lib/supabase-data";
import {
  readPreviewAccessEnabled,
  writePreviewAccessEnabled,
  readVerifiedWallet,
  readWalletHint,
  writeVerifiedWallet,
  writeWalletHint,
} from "@/lib/access-flow";
import { getSocialProviderOptions, getWalletProviderOptions } from "@/lib/auth-options";
import { EmptyState, InlineNotice, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type IdentitySummary = {
  linked_wallet_address: string | null;
  linked_auth_methods: string[];
  email: string | null;
};

type NotificationSummary = {
  email_approvals: boolean;
  email_invitations: boolean;
  email_releases: boolean;
  in_app_activity: boolean;
  weekly_summary: boolean;
};

export function LaunchHardeningCenter() {
  const socialProviders = useMemo(() => getSocialProviderOptions(), []);
  const walletProviders = useMemo(() => getWalletProviderOptions(), []);
  const [identity, setIdentity] = useState<IdentitySummary | null>(null);
  const [preferences, setPreferences] = useState<NotificationSummary | null>(null);
  const [auditCount, setAuditCount] = useState(0);
  const [ledgerCount, setLedgerCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [hasFundingHash, setHasFundingHash] = useState(false);
  const [hasReleaseHash, setHasReleaseHash] = useState(false);
  const [verifiedWallet, setVerifiedWallet] = useState("");
  const [walletHint, setWalletHint] = useState("");
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [identityData, preferenceData, auditRows, ledgerRows, invoices] = await Promise.all([
        fetchIdentitySummary(),
        fetchNotificationPreferences(),
        fetchWorkspaceAuditEvents(40),
        fetchSettlementLedger(40),
        fetchRemoteInvoiceDrafts(),
      ]);

      setIdentity(identityData as IdentitySummary | null);
      setPreferences(preferenceData as NotificationSummary | null);
      setAuditCount(Array.isArray(auditRows) ? auditRows.length : 0);
      setLedgerCount(Array.isArray(ledgerRows) ? ledgerRows.length : 0);
      setInvoiceCount(Array.isArray(invoices) ? invoices.length : 0);
      setHasFundingHash(Array.isArray(invoices) ? invoices.some((item) => Boolean(item.funding_tx_hash)) : false);
      setHasReleaseHash(Array.isArray(invoices) ? invoices.some((item) => Boolean(item.release_tx_hash)) : false);
      setVerifiedWallet(readVerifiedWallet());
      setWalletHint(readWalletHint());
      setPreviewEnabled(readPreviewAccessEnabled());

      try {
        const response = await fetch("/api/wallet-auth/session");
        const json = await response.json();
        if (json?.verified && json?.address) {
          setVerifiedWallet(json.address);
          writeVerifiedWallet(json.address);
        }
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const hardeningItems = [
    {
      label: "Site URL configured",
      ready: Boolean(siteConfig.siteUrl && !siteConfig.siteUrl.includes("localhost")),
      detail: siteConfig.siteUrl && !siteConfig.siteUrl.includes("localhost")
        ? `Live-looking site URL is set to ${siteConfig.siteUrl}.`
        : "NEXT_PUBLIC_SITE_URL still looks local or incomplete.",
      href: "/app/readiness",
    },
    {
      label: "Supabase configured",
      ready: Boolean(siteConfig.supabase.url && siteConfig.supabase.publishableKey),
      detail: siteConfig.supabase.url && siteConfig.supabase.publishableKey
        ? "Supabase URL and publishable key are present."
        : "Supabase URL or publishable key is still missing.",
      href: "/app/readiness",
    },
    {
      label: "Email identity",
      ready: Boolean(identity?.email),
      detail: identity?.email ? `Signed in as ${identity.email}.` : "No signed-in email identity yet.",
      href: "/auth",
    },
    {
      label: "Verified wallet session",
      ready: Boolean(verifiedWallet),
      detail: verifiedWallet ? "A verified wallet session exists in this browser." : "No verified wallet session exists yet.",
      href: "/auth",
    },
    {
      label: "Linked wallet on profile",
      ready: Boolean(identity?.linked_wallet_address),
      detail: identity?.linked_wallet_address ? "A wallet is linked to the workspace profile." : "The workspace profile still has no linked wallet.",
      href: "/app/identity",
    },
    {
      label: "Live social auth",
      ready: socialProviders.some((item) => item.enabled),
      detail: socialProviders.some((item) => item.enabled)
        ? `${socialProviders.filter((item) => item.enabled).length} social provider(s) enabled.`
        : "No social auth provider is enabled yet.",
      href: "/app/account",
    },
    {
      label: "Detected wallet support",
      ready: walletProviders.length > 0,
      detail: walletProviders.length
        ? `${walletProviders.length} supported wallet option(s) detected in this browser.`
        : "No supported browser wallet is detected right now.",
      href: "/auth",
    },
    {
      label: "Notifications configured",
      ready: Boolean(preferences?.in_app_activity),
      detail: preferences ? "Database-backed notification preferences are available." : "Notification preferences are still not loaded.",
      href: "/app/preferences",
    },
    {
      label: "Audit trail active",
      ready: auditCount > 0,
      detail: auditCount > 0 ? `${auditCount} audit event(s) exist in the workspace.` : "No audit events exist yet.",
      href: "/app/audit",
    },
    {
      label: "Settlement ledger active",
      ready: ledgerCount > 0,
      detail: ledgerCount > 0 ? `${ledgerCount} settlement ledger entr${ledgerCount === 1 ? "y" : "ies"} exist.` : "No settlement ledger entries exist yet.",
      href: "/app/ledger",
    },
    {
      label: "Transaction monitoring data",
      ready: hasFundingHash || hasReleaseHash,
      detail: hasFundingHash || hasReleaseHash
        ? "At least one funding or release hash exists for monitoring."
        : "No funding or release hash is stored yet.",
      href: "/app/transactions",
    },
    {
      label: "Preview mode disabled",
      ready: !previewEnabled,
      detail: previewEnabled
        ? "Preview access is still enabled in this browser."
        : "Preview access is disabled in this browser.",
      href: "/start",
    },
  ];

  const readyCount = hardeningItems.filter((item) => item.ready).length
  const score = Math.round((readyCount / hardeningItems.length) * 100);
  const blockers = hardeningItems.filter((item) => !item.ready);

  async function disablePreviewAndClearWalletFallback() {
    setMessage("");
    writePreviewAccessEnabled(false);

    writeWalletHint("");
    if (!verifiedWallet) {
      writeVerifiedWallet("");
    }
    setPreviewEnabled(false);
    setWalletHint("");
    if (!verifiedWallet) {
      setVerifiedWallet("");
    }
    setMessage("Preview mode has been disabled in this browser.");
  }

  async function clearWalletSessionCache() {
    setMessage("");
    try {
      await fetch("/api/wallet-auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    writeVerifiedWallet("");
    writeWalletHint("");
    setVerifiedWallet("");
    setWalletHint("");
    setMessage("Browser wallet session cache was cleared.");
  }

  if (loading) {
    return <LoadingState title="Loading launch hardening" detail="Stablelane is checking the final pieces that matter before public launch." />;
  }

  if (!hardeningItems.length) {
    return <EmptyState title="No launch hardening data" detail="Stablelane could not calculate launch-hardening state yet." />;
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Launch hardening
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Final checks before go-live.
        </h1>
        <p className="max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          This page pulls together the real blockers that still matter before Stablelane should be treated like a live-facing product.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill label={`${score}% hardened`} tone={score >= 85 ? "done" : score >= 60 ? "live" : "lock"} />
          <StatusPill label={`${blockers.length} blocker${blockers.length === 1 ? "" : "s"}`} tone={blockers.length ? "lock" : "done"} />
          <StatusPill label={`${invoiceCount} invoice${invoiceCount === 1 ? "" : "s"}`} tone={invoiceCount ? "live" : "neutral"} />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.04fr_.96fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Launch checklist</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              The fastest way to see which parts are truly ready and which still need work.
            </p>
          </div>

          <div className="grid gap-3">
            {hardeningItems.map((item) => (
              <Link key={item.label} href={item.href} className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="font-semibold text-[var(--text)]">{item.label}</div>
                  <StatusPill label={item.ready ? "ready" : "needs work"} tone={item.ready ? "done" : "lock"} />
                </div>
                <div className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.detail}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Immediate blockers</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              These are the items that still stop a clean production launch.
            </p>
          </div>

          {blockers.length ? (
            <div className="grid gap-3">
              {blockers.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-[var(--text)]">{item.label}</div>
                    <StatusPill label="blocker" tone="lock" />
                  </div>
                  <div className="mb-3 text-[0.84rem] leading-6 text-[var(--muted)]">{item.detail}</div>
                  <Link href={item.href} className="text-[0.84rem] font-semibold text-[var(--accent)]">
                    Open related page
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <InlineNotice
              title="No major blockers right now"
              detail="This workspace looks much closer to a clean go-live state."
              tone="success"
            />
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.04fr_.96fr]">
        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Hardening actions</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              Quick cleanup actions you can take from this browser before launch.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={disablePreviewAndClearWalletFallback}
              className="rounded-full bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-[#08100b]"
            >
              Disable preview in this browser
            </button>
            <button
              type="button"
              onClick={clearWalletSessionCache}
              className="rounded-full border border-white/8 bg-white/3 px-4 py-3 text-[0.92rem] font-bold text-[var(--text)]"
            >
              Clear wallet session cache
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Link href="/app/readiness" className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
              <div className="mb-1 font-semibold text-[var(--text)]">Open readiness</div>
              <div className="text-[0.84rem] leading-6 text-[var(--muted)]">Review provider, identity, preview, and notification readiness.</div>
            </Link>
            <Link href="/app/account" className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
              <div className="mb-1 font-semibold text-[var(--text)]">Open account methods</div>
              <div className="text-[0.84rem] leading-6 text-[var(--muted)]">Inspect current email session, wallet state, and enabled providers.</div>
            </Link>
            <Link href="/app/identity" className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
              <div className="mb-1 font-semibold text-[var(--text)]">Open identity center</div>
              <div className="text-[0.84rem] leading-6 text-[var(--muted)]">Link verified wallet access into the workspace profile.</div>
            </Link>
            <Link href="/app/preferences" className="rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
              <div className="mb-1 font-semibold text-[var(--text)]">Open notification preferences</div>
              <div className="text-[0.84rem] leading-6 text-[var(--muted)]">Make sure alert defaults are intentional before launch.</div>
            </Link>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <div className="mb-4">
            <h2 className="mb-1 text-base font-bold tracking-normal">Go-live notes</h2>
            <p className="text-[0.84rem] leading-6 text-[var(--muted)]">
              The last practical reminders before this product is treated like a live system.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              "Use a real public site URL instead of localhost in production.",
              "Enable only the social providers that are fully configured in Supabase and Vercel.",
              "Disable preview mode in your main browser before live testing.",
              "Make sure at least one verified wallet session and one email identity flow have both been tested successfully.",
              "Confirm audit trail, ledger, and transaction monitor all show real data before launch.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4 text-[0.84rem] leading-6 text-[var(--muted)]">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      {message ? (
        <InlineNotice
          title="Launch hardening"
          detail={message}
          tone={message.toLowerCase().includes("cleared") || message.toLowerCase().includes("disabled") ? "success" : "warning"}
        />
      ) : null}
    </div>
  );
}

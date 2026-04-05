"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSocialProviderOptions, getWalletProviderOptions } from "@/lib/auth-options";
import { readVerifiedWallet, readPreviewAccessEnabled } from "@/lib/access-flow";
import { fetchIdentitySummary, fetchNotificationPreferences } from "@/lib/supabase-data";
import { EmptyState, LoadingState } from "@/components/ui-state";
import { StatusPill } from "@/components/status-pill";

type IdentitySummary = {
  linked_wallet_address: string | null;
  linked_auth_methods: string[];
  email: string | null;
};

type PreferenceSummary = {
  email_approvals: boolean;
  email_invitations: boolean;
  email_releases: boolean;
  in_app_activity: boolean;
  weekly_summary: boolean;
};

export function ProductionReadinessCenter() {
  const socialProviders = useMemo(() => getSocialProviderOptions(), []);
  const walletProviders = useMemo(() => getWalletProviderOptions(), []);
  const [identity, setIdentity] = useState<IdentitySummary | null>(null);
  const [preferences, setPreferences] = useState<PreferenceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [identityData, preferenceData] = await Promise.all([
          fetchIdentitySummary(),
          fetchNotificationPreferences(),
        ]);
        if (!mounted) return;
        setIdentity(identityData as IdentitySummary | null);
        setPreferences(preferenceData as PreferenceSummary | null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const readinessItems = [
    {
      label: "Email identity",
      ready: Boolean(identity?.email),
      detail: identity?.email ? `Signed in as ${identity.email}.` : "No signed-in email identity yet.",
      href: "/auth",
    },
    {
      label: "Verified wallet session",
      ready: Boolean(readVerifiedWallet()),
      detail: readVerifiedWallet() ? "A verified wallet session exists in this browser." : "No verified wallet session exists yet.",
      href: "/auth",
    },
    {
      label: "Linked wallet on profile",
      ready: Boolean(identity?.linked_wallet_address),
      detail: identity?.linked_wallet_address ? "A wallet is linked to the workspace profile." : "The workspace profile still has no linked wallet.",
      href: "/app/identity",
    },
    {
      label: "Enabled social providers",
      ready: socialProviders.some((item) => item.enabled),
      detail: socialProviders.some((item) => item.enabled)
        ? `${socialProviders.filter((item) => item.enabled).length} social provider(s) enabled.`
        : "No social providers are enabled yet.",
      href: "/app/account",
    },
    {
      label: "Notification defaults",
      ready: Boolean(preferences?.in_app_activity),
      detail: preferences ? "Database-backed notification preferences are configured." : "Notification preferences are not loaded yet.",
      href: "/app/preferences",
    },
    {
      label: "Preview safety",
      ready: !readPreviewAccessEnabled(),
      detail: readPreviewAccessEnabled()
        ? "Preview access is enabled in this browser. Turn it off before a stricter live launch."
        : "Preview access is not enabled in this browser.",
      href: "/start",
    },
  ];

  const score = Math.round((readinessItems.filter((item) => item.ready).length / readinessItems.length) * 100);

  if (loading) {
    return <LoadingState title="Loading production readiness" detail="Stablelane is checking identity, provider, preview, and notification readiness." />;
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,27,20,.92),rgba(10,18,13,.86))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.24)]">
        <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          Production readiness
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-cormorant)] text-5xl leading-none tracking-[-0.05em] text-[var(--text)]">
          Tighten the last major launch gaps.
        </h1>
        <p className="max-w-3xl text-[0.92rem] leading-7 text-[var(--muted)]">
          This page highlights the identity, provider, preview, and notification settings that matter before Stablelane should be treated like a live-facing product.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill label={`${score}% ready`} tone={score >= 80 ? "done" : score >= 50 ? "live" : "lock"} />
          <StatusPill label={`${walletProviders.length} wallet provider(s) detected`} tone={walletProviders.length ? "done" : "neutral"} />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {readinessItems.map((item) => (
          <Link key={item.label} href={item.href} className="rounded-[18px] border border-white/8 bg-white/3 p-4 transition hover:bg-white/5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[0.82rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">{item.label}</div>
              <StatusPill label={item.ready ? "ready" : "needs work"} tone={item.ready ? "done" : "lock"} />
            </div>
            <div className="text-[0.86rem] leading-6 text-[var(--muted)]">{item.detail}</div>
          </Link>
        ))}
      </div>

      {!readinessItems.length ? (
        <EmptyState title="No readiness data" detail="Stablelane could not calculate readiness in this workspace yet." />
      ) : null}
    </div>
  );
}

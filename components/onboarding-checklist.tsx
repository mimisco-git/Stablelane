"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { fetchWorkspaceProfile } from "@/lib/supabase-data";

type Step = {
  id: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  done: boolean;
};

export function OnboardingChecklist() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user dismissed onboarding
    if (typeof window !== "undefined") {
      const d = localStorage.getItem("stablelane_onboarding_dismissed");
      if (d === "true") { setDismissed(true); setLoading(false); return; }
    }
    loadSteps();
  }, []);

  async function loadSteps() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [profile, { count: invoiceCount }, { count: clientCount }] = await Promise.all([
      fetchWorkspaceProfile(),
      supabase.from("invoice_drafts").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
      supabase.from("clients").select("*", { count: "exact", head: true }),
    ]);

    const hasWallet = Boolean(profile?.wallet_address);
    const hasContactEmail = Boolean((profile as any)?.contact_email);
    const hasInvoice = (invoiceCount || 0) > 0;
    const hasClient = (clientCount || 0) > 0;

    const newSteps: Step[] = [
      {
        id: "workspace",
        title: "Name your workspace",
        detail: "Set your workspace name and role type so your invoices look professional.",
        href: "/app/settings",
        cta: "Open settings",
        done: Boolean(profile?.workspace_name && profile.workspace_name !== "Stablelane Workspace"),
      },
      {
        id: "wallet",
        title: "Add your wallet address",
        detail: "Your Arc testnet wallet receives USDC when clients approve milestones.",
        href: "/app/settings",
        cta: "Add wallet",
        done: hasWallet,
      },
      {
        id: "email",
        title: "Set notification email",
        detail: "Get an instant email when a client funds your escrow.",
        href: "/app/settings",
        cta: "Set email",
        done: hasContactEmail,
      },
      {
        id: "client",
        title: "Add your first client",
        detail: "Save a client record so you can reuse their details across invoices.",
        href: "/app/clients",
        cta: "Add client",
        done: hasClient,
      },
      {
        id: "invoice",
        title: "Create your first invoice",
        detail: "Build an invoice with milestones, send the payment link to your client.",
        href: "/app/invoices/new",
        cta: "Create invoice",
        done: hasInvoice,
      },
    ];

    setSteps(newSteps);
    setLoading(false);
  }

  function dismiss() {
    if (typeof window !== "undefined") {
      localStorage.setItem("stablelane_onboarding_dismissed", "true");
    }
    setDismissed(true);
  }

  if (loading || dismissed) return null;

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (allDone) return null;

  const percent = Math.round((doneCount / steps.length) * 100);
  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="rounded-[22px] border border-white/8 bg-white/3 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
              Getting started
            </div>
            <div className="rounded-full bg-[rgba(201,255,96,.12)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--accent)]">
              {doneCount}/{steps.length}
            </div>
          </div>
          <h2 className="text-base font-bold">Set up your workspace</h2>
          <p className="text-[0.82rem] text-[var(--muted)]">Complete these steps to start collecting payments on Arc.</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-[0.78rem] text-[var(--muted)] hover:text-[var(--text)] transition"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition ${
              step.done
                ? "border-white/5 bg-white/[.015] opacity-50"
                : "border-white/8 bg-white/3"
            }`}
          >
            {/* Checkmark */}
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
              step.done
                ? "border-[var(--accent)] bg-[rgba(201,255,96,.15)]"
                : "border-white/15 bg-white/5"
            }`}>
              {step.done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 2.5" stroke="#c9ff60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className={`text-[0.88rem] font-semibold ${step.done ? "line-through text-[var(--muted)]" : "text-[var(--text)]"}`}>
                {step.title}
              </div>
              {!step.done && (
                <div className="text-[0.78rem] text-[var(--muted)]">{step.detail}</div>
              )}
            </div>

            {!step.done && (
              <Link
                href={step.href}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--text)] transition hover:bg-white/8"
              >
                {step.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {nextStep && (
        <div className="mt-4">
          <Link
            href={nextStep.href}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.9rem] font-bold text-[#08100b] transition hover:-translate-y-px"
          >
            {nextStep.cta}: {nextStep.title}
          </Link>
        </div>
      )}
    </div>
  );
}

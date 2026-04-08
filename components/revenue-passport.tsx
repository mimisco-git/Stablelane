"use client";

import { useEffect, useState } from "react";
import { fetchDashboardStatsDetailed } from "@/lib/supabase-data";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type PassportData = {
  workspaceName: string;
  roleType: string;
  totalInvoices: number;
  totalValue: number;
  released: number;
  inEscrow: number;
  clientCount: number;
  repeatClientCount: number;
  currency: string;
  walletAddress: string | null;
  generatedAt: string;
};

function creditScore(data: PassportData): number {
  let score = 0;
  if (data.totalInvoices >= 1) score += 20;
  if (data.totalInvoices >= 5) score += 10;
  if (data.totalInvoices >= 10) score += 10;
  if (data.released > 0) score += 20;
  if (data.released >= 5000) score += 10;
  if (data.released >= 20000) score += 10;
  if (data.clientCount >= 1) score += 5;
  if (data.clientCount >= 3) score += 5;
  if (data.repeatClientCount >= 1) score += 5;
  if (data.repeatClientCount >= 3) score += 5;
  return Math.min(100, score);
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Established";
  if (score >= 60) return "Growing";
  if (score >= 40) return "Building";
  if (score >= 20) return "Early stage";
  return "Getting started";
}

export function RevenuePassport() {
  const [data, setData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const stats = await fetchDashboardStatsDetailed();
    if (!stats) { setLoading(false); return; }
    const supabase = getSupabaseBrowserClient();
    let walletAddress: string | null = null;
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("workspace_profiles")
          .select("wallet_address")
          .eq("user_id", user.id)
          .maybeSingle();
        walletAddress = (profile as any)?.wallet_address || null;
      }
    }
    setData({
      workspaceName: stats.workspaceName,
      roleType: stats.roleType,
      totalInvoices: stats.draftCount,
      totalValue: stats.totalDraftValue,
      released: stats.released,
      inEscrow: stats.inEscrow,
      clientCount: stats.clientCount,
      repeatClientCount: stats.repeatClientCount,
      currency: stats.defaultCurrency,
      walletAddress,
      generatedAt: new Date().toISOString(),
    });
    setLoading(false);
  }

  function copyLink() {
    if (typeof window !== "undefined") navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadJSON() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.workspaceName.replace(/\s+/g, "-").toLowerCase()}-revenue-passport.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      <p className="text-[0.9rem] text-[var(--muted)]">Generating your revenue passport...</p>
    </div>
  );

  if (!data) return (
    <div className="rounded-[20px] border border-white/8 bg-white/3 p-10 text-center">
      <p className="text-[var(--muted)]">Sign in to generate your Revenue Passport.</p>
    </div>
  );

  const score = creditScore(data);
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const label = scoreLabel(score);

  return (
    <div className="grid gap-4">
      {/* Main passport card */}
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(14,25,18,.96),rgba(10,18,13,.92))] p-8 shadow-[0_28px_90px_rgba(0,0,0,.5)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(201,255,96,.1),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(103,213,138,.08),transparent_70%)]" />

        <div className="relative">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.1)] px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Revenue Passport</span>
                <span className="text-[0.72rem] text-[var(--muted-2)]">Arc testnet</span>
              </div>
              <h2 className="mb-1 font-[family-name:var(--font-cormorant)] text-[3rem] tracking-[-0.05em]">{data.workspaceName}</h2>
              <p className="text-[0.88rem] text-[var(--muted)]">{data.roleType} workspace</p>
            </div>
            <div className="text-right">
              <div className="font-[family-name:var(--font-cormorant)] text-[4rem] leading-none tracking-[-0.06em] text-[var(--accent)]">{score}</div>
              <div className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">{label}</div>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-[0.78rem] text-[var(--muted-2)]">
              <span>Revenue score</span>
              <span>{score}/100</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-all duration-1000" style={{ width: `${score}%` }} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total invoiced", value: `${fmt(data.totalValue)} ${data.currency}` },
              { label: "Settled on-chain", value: `${fmt(data.released)} ${data.currency}` },
              { label: "Active clients", value: String(data.clientCount) },
              { label: "Repeat clients", value: String(data.repeatClientCount) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[.04] p-4">
                <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">{s.label}</div>
                <div className="font-[family-name:var(--font-cormorant)] text-[1.6rem] tracking-[-0.04em] text-[var(--accent)]">{s.value}</div>
              </div>
            ))}
          </div>

          {data.walletAddress && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3">
              <div className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--muted-2)]">Wallet</div>
              <div className="font-mono text-[0.85rem] text-[var(--muted)]">{data.walletAddress}</div>
            </div>
          )}

          <div className="mt-4 text-[0.72rem] text-[var(--muted-2)]">
            Generated {new Date(data.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} &middot; Stablelane on Arc testnet
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-1 text-base font-bold">Score breakdown</h2>
        <p className="mb-4 text-[0.84rem] text-[var(--muted)]">Your revenue score is built from invoice volume, settlement history, and client relationships.</p>
        <div className="grid gap-4">
          {[
            { label: "Invoice activity", value: Math.min(40, (data.totalInvoices >= 10 ? 40 : data.totalInvoices >= 5 ? 30 : data.totalInvoices >= 1 ? 20 : 0)), max: 40 },
            { label: "Settlement history", value: Math.min(40, (data.released >= 20000 ? 40 : data.released >= 5000 ? 30 : data.released > 0 ? 20 : 0)), max: 40 },
            { label: "Client relationships", value: Math.min(20, (data.repeatClientCount >= 3 ? 20 : data.repeatClientCount >= 1 ? 15 : data.clientCount >= 3 ? 10 : data.clientCount >= 1 ? 5 : 0)), max: 20 },
          ].map((s) => (
            <div key={s.label}>
              <div className="mb-1.5 flex justify-between text-[0.82rem]">
                <span className="text-[var(--muted)]">{s.label}</span>
                <span className="font-semibold">{s.value}/{s.max}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${(s.value / s.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What improves score */}
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-4 text-base font-bold">How to improve your score</h2>
        <div className="grid gap-2">
          {[
            { done: data.totalInvoices >= 1, text: "Create your first invoice" },
            { done: data.released > 0, text: "Complete your first on-chain milestone release" },
            { done: data.clientCount >= 3, text: "Build a client base of 3 or more" },
            { done: data.repeatClientCount >= 1, text: "Have a client return for a second engagement" },
            { done: data.totalInvoices >= 10, text: "Reach 10 total invoices" },
            { done: data.released >= 5000, text: "Settle over 5,000 USDC on-chain" },
          ].map((item) => (
            <div key={item.text} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-[0.85rem] ${item.done ? "border-white/5 opacity-40" : "border-white/8 bg-white/3"}`}>
              <span className={item.done ? "text-[var(--accent)]" : "text-[var(--muted-2)]"}>{item.done ? "✓" : "○"}</span>
              <span className={item.done ? "line-through text-[var(--muted)]" : "text-[var(--text)]"}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={copyLink} className="rounded-full bg-[var(--accent)] px-5 py-3 text-[0.92rem] font-bold text-[#08100b] transition hover:-translate-y-px">
          {copied ? "Link copied!" : "Share passport link"}
        </button>
        <button onClick={downloadJSON} className="rounded-full border border-white/8 bg-white/3 px-5 py-3 text-[0.92rem] font-bold text-[var(--text)] transition hover:bg-white/5">
          Export as JSON
        </button>
      </div>
    </div>
  );
}
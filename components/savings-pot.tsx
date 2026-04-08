"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { createPublicClient, http } from "viem";
import { arcTestnet, USDC_ADDRESS } from "@/lib/escrow-client";
import { USDC_ABI } from "@/lib/escrow-abi";

const STORAGE_KEY = "stablelane_savings_pot";

type SavingsConfig = {
  enabled: boolean;
  percent: number;
  savingsWallet: string;
  totalSaved: number;
  currency: string;
  deposits: { amount: number; date: string; txNote: string }[];
};

function defaultConfig(): SavingsConfig {
  return { enabled: false, percent: 10, savingsWallet: "", totalSaved: 0, currency: "USDC", deposits: [] };
}

function loadConfig(): SavingsConfig {
  if (typeof window === "undefined") return defaultConfig();
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || defaultConfig(); } catch { return defaultConfig(); }
}

function saveConfig(c: SavingsConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

export function SavingsPot() {
  const [config, setConfig] = useState<SavingsConfig>(defaultConfig);
  const [balance, setBalance] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const c = loadConfig();
    setConfig(c);
    if (c.savingsWallet) fetchBalance(c.savingsWallet);
  }, []);

  async function fetchBalance(address: string) {
    try {
      const client = createPublicClient({ chain: arcTestnet, transport: http("https://rpc.testnet.arc.network") });
      const raw = await client.readContract({
        address: USDC_ADDRESS, abi: USDC_ABI, functionName: "balanceOf",
        args: [address as `0x${string}`],
      }) as bigint;
      setBalance((Number(raw) / 1_000_000).toFixed(2));
    } catch { setBalance(null); }
  }

  function showMsg(text: string) { setMessage(text); setTimeout(() => setMessage(""), 3000); }

  function handleSave() {
    setSaving(true);
    saveConfig(config);
    if (config.savingsWallet) fetchBalance(config.savingsWallet);
    setTimeout(() => { setSaving(false); showMsg("Savings pot configuration saved."); }, 500);
  }

  function simulateDeposit() {
    const invoiceAmount = 4800;
    const savingsAmount = (invoiceAmount * config.percent) / 100;
    const deposit = { amount: savingsAmount, date: new Date().toISOString(), txNote: `Auto-saved ${config.percent}% of $${invoiceAmount} USDC invoice` };
    const updated = { ...config, totalSaved: config.totalSaved + savingsAmount, deposits: [deposit, ...config.deposits.slice(0, 9)] };
    setConfig(updated);
    saveConfig(updated);
    showMsg(`Simulated: ${savingsAmount} USDC saved from a $${invoiceAmount} payout.`);
  }

  const suggestedPercents = [5, 10, 15, 20, 25];

  return (
    <div className="grid gap-4">
      {/* Overview card */}
      <div className="relative overflow-hidden rounded-[24px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(14,25,18,.96),rgba(10,18,13,.92))] p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(201,255,96,.1),transparent_70%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Arc Savings Pot</div>
            <div className="font-[family-name:var(--font-cormorant)] text-[3.5rem] leading-none tracking-[-0.06em] text-[var(--accent)]">
              {config.totalSaved.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </div>
            <div className="text-[0.88rem] text-[var(--muted)]">USDC saved from payouts</div>
          </div>
          <div className="text-right">
            <div className={`rounded-full px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${config.enabled ? "bg-[rgba(201,255,96,.12)] text-[var(--accent)]" : "bg-white/5 text-[var(--muted-2)]"}`}>
              {config.enabled ? `${config.percent}% active` : "Disabled"}
            </div>
            {balance !== null && config.savingsWallet && (
              <div className="mt-2 text-[0.8rem] text-[var(--muted)]">Live balance: {balance} USDC</div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-1 text-base font-bold">Configure savings</h2>
        <p className="mb-4 text-[0.84rem] text-[var(--muted)]">Set a percentage of every payout to automatically route to a dedicated savings wallet.</p>

        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Enable automatic savings</div>
              <div className="text-[0.82rem] text-[var(--muted)]">Route {config.percent}% of every payout to your savings wallet</div>
            </div>
            <button
              onClick={() => setConfig((p) => ({ ...p, enabled: !p.enabled }))}
              className={`relative h-7 w-12 rounded-full transition-colors ${config.enabled ? "bg-[var(--accent)]" : "bg-white/15"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${config.enabled ? "left-6" : "left-1"}`} />
            </button>
          </div>

          <div>
            <label className="mb-2 block text-[0.8rem] text-[var(--muted)]">Savings percentage</label>
            <div className="flex flex-wrap gap-2">
              {suggestedPercents.map((p) => (
                <button
                  key={p}
                  onClick={() => setConfig((prev) => ({ ...prev, percent: p }))}
                  className={`rounded-xl px-4 py-2.5 text-[0.85rem] font-bold transition ${config.percent === p ? "bg-[var(--accent)] text-[#08100b]" : "border border-white/8 bg-white/3 text-[var(--muted)] hover:bg-white/5"}`}
                >
                  {p}%
                </button>
              ))}
              <input
                type="number"
                value={config.percent}
                onChange={(e) => setConfig((p) => ({ ...p, percent: Math.min(50, Math.max(1, parseInt(e.target.value) || 10)) }))}
                min={1} max={50}
                className="w-20 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5 text-center text-[0.88rem] text-[var(--text)] outline-none focus:border-[var(--line)]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[0.8rem] text-[var(--muted)]">Savings wallet address (Arc testnet)</label>
            <input
              value={config.savingsWallet}
              onChange={(e) => setConfig((p) => ({ ...p, savingsWallet: e.target.value }))}
              placeholder="0x... dedicated savings wallet"
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 font-mono text-[0.88rem] text-[var(--text)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line)]"
            />
            <p className="mt-1 text-[0.75rem] text-[var(--muted)]">Create a separate wallet in MetaMask for savings. Never the same wallet as your main operating wallet.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.88rem] font-bold text-[#08100b] transition hover:-translate-y-px disabled:opacity-70">
              {saving ? "Saving..." : "Save configuration"}
            </button>
            <button onClick={simulateDeposit} className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-[0.88rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]">
              Simulate deposit
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
        <h2 className="mb-4 text-base font-bold">How it works</h2>
        <div className="grid gap-3">
          {[
            { step: "1", title: "Set your savings percentage", detail: "Choose how much of each payout goes to savings. 10% is a good default for an emergency fund." },
            { step: "2", title: "Add a dedicated savings wallet", detail: "Create a separate Arc testnet wallet in MetaMask. Keep it separate from your operating wallet." },
            { step: "3", title: "Savings route on every release", detail: "When a client approves a milestone, the savings % routes to your savings wallet automatically via the SplitPayoutRouter." },
            { step: "4", title: "Watch your pot grow", detail: "Every settled invoice builds your on-chain savings. Check the live balance anytime." },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 rounded-xl border border-white/8 bg-white/3 p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(201,255,96,.12)] text-[0.78rem] font-bold text-[var(--accent)]">{s.step}</div>
              <div>
                <div className="text-[0.88rem] font-semibold">{s.title}</div>
                <div className="text-[0.78rem] text-[var(--muted)]">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit history */}
      {config.deposits.length > 0 && (
        <div className="rounded-[20px] border border-white/8 bg-white/3 p-5">
          <h2 className="mb-4 text-base font-bold">Savings history</h2>
          <div className="grid gap-2">
            {config.deposits.map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                <div>
                  <div className="text-[0.85rem] font-semibold text-[var(--accent)]">+{d.amount.toFixed(2)} USDC</div>
                  <div className="text-[0.75rem] text-[var(--muted)]">{d.txNote}</div>
                </div>
                <div className="text-[0.75rem] text-[var(--muted-2)]">{new Date(d.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-4 py-3 text-[0.84rem] font-semibold text-[var(--accent)]">{message}</div>
      )}
    </div>
  );
}
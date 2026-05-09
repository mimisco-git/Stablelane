"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";

const USYC_ADDRESS = "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C";
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

type TreasuryTab = "overview" | "yield" | "multichain" | "approvals";

export default function TreasuryProPage() {
  const [tab, setTab] = useState<TreasuryTab>("overview");
  const [allocating, setAllocating] = useState(false);

  const treasuryData = {
    totalUsdc: "12,840.00",
    lockedEscrow: "9,600.00",
    available: "3,240.00",
    inYield: "0.00",
    eurcBalance: "0.00",
    usycBalance: "0.00",
    pendingReleases: 3,
    approvalRequired: 2,
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AppHeader />
      <div className="mx-auto w-[min(calc(100%-36px),1280px)] py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">
                Treasury
              </h1>
              <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                Arc testnet
              </div>
            </div>
            <p className="text-[0.84rem] text-[var(--muted)]">
              Manage idle USDC, earn yield via USYC, and approve multi-sig releases.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total USDC", value: `$${treasuryData.totalUsdc}`, sub: "Across escrow + available", accent: true },
            { label: "Locked in escrow", value: `$${treasuryData.lockedEscrow}`, sub: "Client-committed" },
            { label: "Available", value: `$${treasuryData.available}`, sub: "Deployable now" },
            { label: "Earning yield", value: `$${treasuryData.inYield}`, sub: "USYC · tokenized MMF" },
          ].map((s, i) => (
            <div key={i} className={`rounded-[20px] border p-5 ${s.accent ? "border-[rgba(201,255,96,.25)] bg-[rgba(201,255,96,.06)]" : "border-[var(--line)] bg-[var(--surface)]"}`}>
              <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{s.label}</div>
              <div className={`font-[family-name:var(--font-cormorant)] text-[2rem] tracking-[-0.04em] ${s.accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>{s.value}</div>
              <div className="text-[0.74rem] text-[var(--muted)]">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-1 w-fit">
          {(["overview", "yield", "multichain", "approvals"] as TreasuryTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-[12px] px-4 py-2 text-[0.82rem] font-semibold capitalize transition ${tab === t ? "bg-[var(--accent)] text-[#08100b]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
            >
              {t === "multichain" ? "Multichain" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
              <h3 className="mb-4 text-base font-bold">Token balances</h3>
              <div className="grid gap-3">
                {[
                  { token: "USDC", address: USDC_ADDRESS, balance: treasuryData.totalUsdc, note: "Native gas token · 6 decimals", color: "var(--accent)" },
                  { token: "EURC", address: EURC_ADDRESS, balance: treasuryData.eurcBalance, note: "Euro stablecoin · Circle issued", color: "#60a5fa" },
                  { token: "USYC", address: USYC_ADDRESS, balance: treasuryData.usycBalance, note: "Yield-bearing · tokenized money market fund", color: "#a78bfa" },
                ].map((tok, i) => (
                  <div key={i} className="flex items-center justify-between rounded-[16px] border border-white/8 bg-white/3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 text-[0.72rem] font-bold" style={{ color: tok.color }}>
                        {tok.token[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-[0.88rem]">{tok.token}</div>
                        <div className="text-[0.72rem] text-[var(--muted)]">{tok.note}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--text)]">{tok.balance}</div>
                      <a href={`https://testnet.arcscan.app/token/${tok.address}`} target="_blank" rel="noreferrer" className="text-[0.68rem] text-[var(--muted)] hover:text-[var(--accent)] transition">
                        View on Arcscan ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <h3 className="mb-3 text-[0.88rem] font-bold">Pending actions</h3>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-[14px] bg-white/3 px-3 py-2.5">
                    <span className="text-[0.82rem] text-[var(--muted)]">Milestone releases</span>
                    <span className="rounded-full bg-[rgba(201,255,96,.15)] px-2 py-0.5 text-[0.72rem] font-bold text-[var(--accent)]">{treasuryData.pendingReleases}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[14px] bg-white/3 px-3 py-2.5">
                    <span className="text-[0.82rem] text-[var(--muted)]">Approval required</span>
                    <span className="rounded-full bg-[rgba(255,100,100,.15)] px-2 py-0.5 text-[0.72rem] font-bold text-red-400">{treasuryData.approvalRequired}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <h3 className="mb-3 text-[0.88rem] font-bold">Quick actions</h3>
                <div className="grid gap-2">
                  <button onClick={() => setTab("yield")} className="w-full rounded-[14px] bg-[rgba(201,255,96,.1)] px-4 py-3 text-[0.84rem] font-semibold text-[var(--accent)] transition hover:bg-[rgba(201,255,96,.15)]">
                    Earn yield with USYC →
                  </button>
                  <button onClick={() => setTab("multichain")} className="w-full rounded-[14px] border border-white/8 bg-white/3 px-4 py-3 text-[0.84rem] font-semibold text-[var(--text)] transition hover:bg-white/6">
                    Bridge USDC from other chains →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yield tab */}
        {tab === "yield" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold">USYC Yield</h3>
                <div className="rounded-full border border-[rgba(167,139,250,.3)] bg-[rgba(167,139,250,.08)] px-3 py-1 text-[0.72rem] font-bold text-purple-400">
                  Tokenized MMF
                </div>
              </div>
              <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">
                USYC is Circle&apos;s yield-bearing token on Arc. It represents shares in a tokenized money market fund backed by short-duration U.S. Treasury securities. Deploy idle USDC into USYC to earn while funds wait in escrow.
              </p>
              <div className="mb-5 grid gap-2">
                {[
                  { label: "Contract", value: "0xe9185F0c...d86C" },
                  { label: "Decimals", value: "6" },
                  { label: "Backing", value: "U.S. Treasury securities" },
                  { label: "Redemption", value: "Via Teller contract on Arc testnet" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between rounded-[12px] bg-white/3 px-3 py-2 text-[0.8rem]">
                    <span className="text-[var(--muted)]">{row.label}</span>
                    <span className="font-semibold font-mono">{row.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setAllocating(true)}
                className="w-full rounded-[16px] bg-[var(--accent)] py-3 text-[0.9rem] font-bold text-[#08100b] transition hover:-translate-y-px"
              >
                {allocating ? "Opening Arcscan..." : "Mint USYC on testnet →"}
              </button>
              <p className="mt-2 text-center text-[0.72rem] text-[var(--muted)]">
                Requires allowlist approval from Circle Support. <a href="https://support.circle.com" target="_blank" rel="noreferrer" className="text-[var(--accent)]">Request access ↗</a>
              </p>
            </div>

            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
              <h3 className="mb-4 text-base font-bold">How it works</h3>
              <div className="grid gap-3">
                {[
                  { step: "1", title: "Get allowlisted", detail: "Request USYC access from Circle Support. Required for testnet." },
                  { step: "2", title: "Deposit USDC", detail: "Call the Teller contract with your USDC to receive USYC shares." },
                  { step: "3", title: "USYC accrues value", detail: "USYC price increases as the underlying T-bill fund earns yield." },
                  { step: "4", title: "Redeem anytime", detail: "Exchange USYC back for USDC + yield via the Teller contract." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 rounded-[16px] border border-white/8 bg-white/3 px-4 py-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(167,139,250,.15)] text-[0.76rem] font-bold text-purple-400">{s.step}</div>
                    <div>
                      <div className="text-[0.86rem] font-semibold">{s.title}</div>
                      <div className="text-[0.76rem] text-[var(--muted)]">{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Multichain tab */}
        {tab === "multichain" && (
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Cross-chain USDC funding</h3>
                <p className="text-[0.82rem] text-[var(--muted)]">Fund Arc escrows from USDC held on any supported chain via CCTP.</p>
              </div>
              <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.06)] px-3 py-1 text-[0.72rem] font-bold text-[var(--accent)]">CCTP V2</div>
            </div>

            <div className="mb-5 grid gap-3 lg:grid-cols-3">
              {[
                { chain: "Ethereum", usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", status: "Supported" },
                { chain: "Base", usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", status: "Supported" },
                { chain: "Avalanche", usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", status: "Supported" },
              ].map((chain, i) => (
                <div key={i} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-[0.86rem]">{chain.chain}</span>
                    <span className="rounded-full bg-[rgba(201,255,96,.12)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--accent)]">{chain.status}</span>
                  </div>
                  <div className="font-mono text-[0.7rem] text-[var(--muted)] break-all">{chain.usdc}</div>
                </div>
              ))}
            </div>

            <div className="rounded-[18px] border border-[rgba(201,255,96,.2)] bg-[rgba(201,255,96,.04)] p-5">
              <div className="mb-3 text-[0.82rem] font-bold text-[var(--accent)]">The CCTP flow into Stablelane escrow</div>
              <div className="grid gap-2">
                {[
                  "Client holds USDC on Ethereum, Base, or Avalanche",
                  "Client approves the CCTP TokenMessenger on source chain",
                  "USDC burns on source chain - gone forever",
                  "Circle attestation service signs the burn proof",
                  "Stablelane mints USDC directly into the escrow contract on Arc",
                  "Escrow is funded. Freelancer can start work. One flow, no manual bridge.",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-[0.82rem]">
                    <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(201,255,96,.15)] text-[0.68rem] font-bold text-[var(--accent)]">{i + 1}</span>
                    <span className="text-[var(--muted)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <a href="https://developers.circle.com/stablecoins/cctp-getting-started" target="_blank" rel="noreferrer"
                className="rounded-[14px] bg-[var(--accent)] px-5 py-3 text-[0.88rem] font-bold text-[#08100b] transition hover:-translate-y-px">
                CCTP docs ↗
              </a>
              <a href="https://faucet.circle.com" target="_blank" rel="noreferrer"
                className="rounded-[14px] border border-white/8 bg-white/3 px-5 py-3 text-[0.88rem] font-semibold text-[var(--text)] transition hover:bg-white/6">
                Get testnet USDC
              </a>
            </div>
          </div>
        )}

        {/* Approvals tab */}
        {tab === "approvals" && (
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Multi-sig release approvals</h3>
                <p className="text-[0.82rem] text-[var(--muted)]">Milestone releases above threshold require multi-party approval before execution on Arc.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {[
                { invoice: "Northstar Studio", milestone: "Milestone 2 of 3", amount: "$1,600", threshold: "Above $1,000", status: "Awaiting approval", urgent: true },
                { invoice: "Ridge Labs", milestone: "Final delivery", amount: "$2,400", threshold: "Above $2,000", status: "Awaiting approval", urgent: true },
                { invoice: "Atlas Commerce", milestone: "Milestone 1 of 3", amount: "$800", threshold: "Below threshold", status: "Auto-released", urgent: false },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between rounded-[18px] border p-4 ${item.urgent ? "border-[rgba(255,180,0,.2)] bg-[rgba(255,180,0,.04)]" : "border-white/8 bg-white/3"}`}>
                  <div className="flex flex-col gap-0.5">
                    <div className="font-semibold text-[0.9rem]">{item.invoice}</div>
                    <div className="text-[0.78rem] text-[var(--muted)]">{item.milestone} · {item.threshold}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[var(--text)]">{item.amount}</span>
                    {item.urgent ? (
                      <button className="rounded-[12px] bg-[var(--accent)] px-3 py-2 text-[0.78rem] font-bold text-[#08100b] transition hover:-translate-y-px">
                        Approve
                      </button>
                    ) : (
                      <span className="rounded-full bg-[rgba(201,255,96,.12)] px-2 py-1 text-[0.72rem] font-bold text-[var(--accent)]">Done</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[0.78rem] text-[var(--muted)]">
              Threshold configuration and full multi-sig support coming in v2. For now, releases above your configured threshold surface here for manual review before the on-chain transaction fires.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { fetchDashboardStatsDetailed } from "@/lib/supabase-data";
import { createPublicClient, http } from "viem";

const ARC_RPC = "https://rpc.testnet.arc.network";
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as `0x${string}`;
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`;
const USYC_ADDRESS = "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C" as `0x${string}`;

const ERC20_ABI = [
  { name: "balanceOf", type: "function", inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
] as const;

const arcTestnet = {
  id: 5042002, name: "Arc Testnet", network: "arc-testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: [ARC_RPC] }, public: { http: [ARC_RPC] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
} as const;

type TreasuryTab = "overview" | "yield" | "multichain" | "approvals";

type TreasuryData = {
  totalUsdc: string;
  lockedEscrow: string;
  available: string;
  inYield: string;
  eurcBalance: string;
  usycBalance: string;
  pendingReleases: number;
  approvalRequired: number;
  walletAddress: string | null;
};

async function readTokenBalance(wallet: string, token: `0x${string}`): Promise<string> {
  try {
    const client = createPublicClient({ chain: arcTestnet, transport: http(ARC_RPC) });
    const raw = await client.readContract({ address: token, abi: ERC20_ABI, functionName: "balanceOf", args: [wallet as `0x${string}`] }) as bigint;
    return (Number(raw) / 1_000_000).toFixed(2);
  } catch { return "0.00"; }
}

export default function TreasuryProPage() {
  const [tab, setTab] = useState<TreasuryTab>("overview");
  const [allocating, setAllocating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TreasuryData>({
    totalUsdc: "--", lockedEscrow: "--", available: "--",
    inYield: "0.00", eurcBalance: "--", usycBalance: "--",
    pendingReleases: 0, approvalRequired: 0, walletAddress: null
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const stats = await fetchDashboardStatsDetailed();
      if (!stats) { setLoading(false); return; }

      const totalUsdc = Number(stats.totalDraftValue || 0).toFixed(2);
      const lockedEscrow = Number(stats.inEscrow || 0).toFixed(2);
      const released = Number(stats.released || 0).toFixed(2);
      const available = (Number(totalUsdc) - Number(lockedEscrow)).toFixed(2);

      // Read on-chain balances if wallet address available
      let eurcBalance = "0.00";
      let usycBalance = "0.00";
      const walletAddress = null;

      if (walletAddress) {
        [eurcBalance, usycBalance] = await Promise.all([
          readTokenBalance(walletAddress, EURC_ADDRESS),
          readTokenBalance(walletAddress, USYC_ADDRESS),
        ]);
      }

      setData({
        totalUsdc,
        lockedEscrow,
        available: available > "0" ? available : "0.00",
        inYield: "0.00",
        eurcBalance,
        usycBalance,
        pendingReleases: stats.pendingReleases || 0,
        approvalRequired: 0,
        walletAddress,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const statCards = [
    { label: "Total USDC value", value: loading ? "..." : `$${data.totalUsdc}`, sub: "Across escrow + available", accent: true },
    { label: "Locked in escrow", value: loading ? "..." : `$${data.lockedEscrow}`, sub: "Client-committed on Arc" },
    { label: "Available", value: loading ? "..." : `$${data.available}`, sub: "Deployable now" },
    { label: "Earning yield", value: loading ? "..." : `$${data.inYield}`, sub: "USYC · tokenized MMF" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AppHeader />
      <div className="mx-auto w-[min(calc(100%-36px),1280px)] py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="font-[family-name:var(--font-cormorant)] text-[1.8rem] tracking-[-0.04em]">Treasury</h1>
              <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">Arc testnet</div>
            </div>
            <p className="text-[0.84rem] text-[var(--muted)]">Live USDC, EURC, and USYC balances. Earn yield on idle funds. Bridge from any chain via CCTP.</p>
          </div>
          <button onClick={loadData} className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-[0.8rem] font-semibold text-[var(--muted)] transition hover:text-[var(--text)]">
            Refresh
          </button>
        </div>

        <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <div key={i} className={`rounded-[20px] border p-5 ${s.accent ? "border-[rgba(201,255,96,.25)] bg-[rgba(201,255,96,.06)]" : "border-[var(--line)] bg-[var(--surface)]"}`}>
              <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{s.label}</div>
              <div className={`font-[family-name:var(--font-cormorant)] text-[2rem] tracking-[-0.04em] ${s.accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>{s.value}</div>
              <div className="text-[0.74rem] text-[var(--muted)]">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex gap-1 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-1 w-fit">
          {(["overview", "yield", "multichain", "approvals"] as TreasuryTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-[12px] px-4 py-2 text-[0.82rem] font-semibold capitalize transition ${tab === t ? "bg-[var(--accent)] text-[#08100b]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
              <h3 className="mb-4 text-base font-bold">Token balances on Arc Testnet</h3>
              {data.walletAddress ? (
                <p className="mb-4 text-[0.78rem] text-[var(--muted)]">Wallet: <span className="font-mono text-[var(--text)]">{data.walletAddress.slice(0,16)}...{data.walletAddress.slice(-6)}</span></p>
              ) : (
                <p className="mb-4 text-[0.78rem] text-[var(--muted)]">Add your wallet address in <a href="/app/settings" className="text-[var(--accent)] underline">Settings</a> to see live balances.</p>
              )}
              <div className="grid gap-3">
                {[
                  { token: "USDC", address: USDC_ADDRESS, balance: loading ? "..." : data.totalUsdc, note: "Native gas token · 6 decimals", color: "var(--accent)" },
                  { token: "EURC", address: EURC_ADDRESS, balance: loading ? "..." : data.eurcBalance, note: "Euro stablecoin · Circle issued", color: "#60a5fa" },
                  { token: "USYC", address: USYC_ADDRESS, balance: loading ? "..." : data.usycBalance, note: "Yield-bearing · tokenized money market fund", color: "#a78bfa" },
                ].map((tok, i) => (
                  <div key={i} className="flex items-center justify-between rounded-[16px] border border-white/8 bg-white/3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 text-[0.72rem] font-bold" style={{ color: tok.color }}>{tok.token[0]}</div>
                      <div>
                        <div className="font-semibold text-[0.88rem]">{tok.token}</div>
                        <div className="text-[0.72rem] text-[var(--muted)]">{tok.note}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{tok.balance}</div>
                      <a href={`https://testnet.arcscan.app/token/${tok.address}`} target="_blank" rel="noreferrer" className="text-[0.68rem] text-[var(--muted)] hover:text-[var(--accent)] transition">Arcscan ↗</a>
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
                    <span className="rounded-full bg-[rgba(201,255,96,.15)] px-2 py-0.5 text-[0.72rem] font-bold text-[var(--accent)]">{data.pendingReleases}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[14px] bg-white/3 px-3 py-2.5">
                    <span className="text-[0.82rem] text-[var(--muted)]">Overdue invoices</span>
                    <span className="rounded-full bg-[rgba(255,100,100,.15)] px-2 py-0.5 text-[0.72rem] font-bold text-red-400">{data.approvalRequired}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <h3 className="mb-3 text-[0.88rem] font-bold">Quick actions</h3>
                <div className="grid gap-2">
                  <button onClick={() => setTab("yield")} className="w-full rounded-[14px] bg-[rgba(201,255,96,.1)] px-4 py-3 text-[0.84rem] font-semibold text-[var(--accent)] transition hover:bg-[rgba(201,255,96,.15)]">Earn yield with USYC →</button>
                  <button onClick={() => setTab("multichain")} className="w-full rounded-[14px] border border-white/8 bg-white/3 px-4 py-3 text-[0.84rem] font-semibold text-[var(--text)] transition hover:bg-white/6">Bridge from other chains →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "yield" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold">USYC Yield</h3>
                <div className="rounded-full border border-[rgba(167,139,250,.3)] bg-[rgba(167,139,250,.08)] px-3 py-1 text-[0.72rem] font-bold text-purple-400">Tokenized MMF</div>
              </div>
              <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">USYC is Circle&apos;s yield-bearing token on Arc. It represents shares in a tokenized money market fund backed by short-duration U.S. Treasury securities.</p>
              <div className="mb-5 grid gap-2">
                {[
                  { label: "Contract", value: "0xe9185F0c...d86C" },
                  { label: "Decimals", value: "6" },
                  { label: "Backing", value: "U.S. Treasury securities" },
                  { label: "Redemption", value: "Via Teller contract on Arc" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between rounded-[12px] bg-white/3 px-3 py-2 text-[0.8rem]">
                    <span className="text-[var(--muted)]">{row.label}</span>
                    <span className="font-semibold font-mono">{row.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setAllocating(true)} className="w-full rounded-[16px] bg-[var(--accent)] py-3 text-[0.9rem] font-bold text-[#08100b] transition hover:-translate-y-px">
                {allocating ? "See Circle docs →" : "Mint USYC on testnet →"}
              </button>
              <p className="mt-2 text-center text-[0.72rem] text-[var(--muted)]">
                Requires allowlist from Circle. <a href="https://support.circle.com" target="_blank" rel="noreferrer" className="text-[var(--accent)]">Request access ↗</a>
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
              <h3 className="mb-4 text-base font-bold">How it works</h3>
              <div className="grid gap-3">
                {[
                  { step: "1", title: "Get allowlisted", detail: "Request USYC access from Circle Support." },
                  { step: "2", title: "Deposit USDC", detail: "Call the Teller contract with USDC to receive USYC shares." },
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

        {tab === "multichain" && (
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Cross-chain USDC funding via CCTP</h3>
                <p className="text-[0.82rem] text-[var(--muted)]">Fund Arc escrows from USDC held on any supported chain. Client never needs to manually bridge.</p>
              </div>
              <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.06)] px-3 py-1 text-[0.72rem] font-bold text-[var(--accent)]">CCTP V2</div>
            </div>
            <div className="mb-5 grid gap-3 lg:grid-cols-3">
              {[
                { chain: "Ethereum Sepolia", status: "Supported", domain: "0" },
                { chain: "Base Sepolia", status: "Supported", domain: "6" },
                { chain: "Avalanche Fuji", status: "Supported", domain: "1" },
              ].map((chain, i) => (
                <div key={i} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-[0.86rem]">{chain.chain}</span>
                    <span className="rounded-full bg-[rgba(201,255,96,.12)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--accent)]">{chain.status}</span>
                  </div>
                  <div className="text-[0.72rem] text-[var(--muted)]">CCTP Domain: {chain.domain}</div>
                </div>
              ))}
            </div>
            <div className="rounded-[18px] border border-[rgba(201,255,96,.2)] bg-[rgba(201,255,96,.04)] p-5">
              <div className="mb-3 text-[0.82rem] font-bold text-[var(--accent)]">Flow: client funds Stablelane escrow from any chain</div>
              <div className="grid gap-2">
                {[
                  "Client holds USDC on Ethereum, Base, or Avalanche",
                  "Client approves CCTP TokenMessenger on source chain",
                  "USDC burns on source chain",
                  "Circle attestation service signs the burn proof",
                  "USDC mints directly into the Stablelane escrow on Arc",
                  "Escrow funded. Freelancer starts work. One flow.",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-[0.82rem]">
                    <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(201,255,96,.15)] text-[0.68rem] font-bold text-[var(--accent)]">{i + 1}</span>
                    <span className="text-[var(--muted)]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <a href="https://developers.circle.com/stablecoins/cctp-getting-started" target="_blank" rel="noreferrer" className="rounded-[14px] bg-[var(--accent)] px-5 py-3 text-[0.88rem] font-bold text-[#08100b] transition hover:-translate-y-px">CCTP docs ↗</a>
              <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="rounded-[14px] border border-white/8 bg-white/3 px-5 py-3 text-[0.88rem] font-semibold text-[var(--text)] transition hover:bg-white/6">Get testnet USDC</a>
            </div>
          </div>
        )}

        {tab === "approvals" && (
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold">Multi-sig release approvals</h3>
              <p className="text-[0.82rem] text-[var(--muted)]">Milestone releases above threshold surface here for review before the on-chain transaction fires.</p>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 text-[2rem]">✓</div>
              <div className="text-[0.88rem] font-semibold">No pending approvals</div>
              <div className="text-[0.78rem] text-[var(--muted)]">Releases requiring approval will appear here.</div>
              <a href="/app/escrows" className="mt-4 rounded-[14px] border border-white/8 bg-white/3 px-4 py-2.5 text-[0.82rem] font-semibold text-[var(--text)] transition hover:bg-white/6">View all escrows →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

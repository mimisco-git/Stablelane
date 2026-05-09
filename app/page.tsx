import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

const stack = [
  { label: "Chain", value: "Arc Testnet", sub: "Chain ID 5042002" },
  { label: "Gas token", value: "USDC", sub: "Stablecoin-native" },
  { label: "Finality", value: "<1s", sub: "Deterministic" },
  { label: "Contracts", value: "Live", sub: "Escrow factory deployed" },
];

const features = [
  {
    icon: "▣",
    title: "Smart invoice creation",
    desc: "Create USDC invoices with milestone schedules, client portals, and payment links. Everything a client needs to pay you, in one flow.",
    tag: "Phase 1",
  },
  {
    icon: "◈",
    title: "Milestone escrow",
    desc: "Client locks funds before work starts. Release logic defined upfront. Both sides know exactly what happens at every step.",
    tag: "Phase 1",
  },
  {
    icon: "◎",
    title: "Payout splits",
    desc: "Define collaborator shares once. Designer 60%, Developer 30%, PM 10%. Routes automatically from a single milestone release.",
    tag: "Phase 1",
  },
  {
    icon: "★",
    title: "AI Agent",
    desc: "Natural language invoice creation, escrow management, and milestone release. Autonomous. Onchain. Powered by Claude Haiku.",
    tag: "New",
    highlight: true,
  },
  {
    icon: "◌",
    title: "Revenue Passport",
    desc: "Every completed invoice becomes verifiable on-chain business history. A trust signal that travels with you across clients and platforms.",
    tag: "Phase 2",
  },
  {
    icon: "⇄",
    title: "Treasury management",
    desc: "USDC, EURC, and USYC balances in one view. Earn yield on idle funds. Fund Arc escrows from any supported chain via CCTP.",
    tag: "New",
    highlight: true,
  },
];

const built = [
  { label: "Escrow factory", value: "Deployed", detail: "MilestoneEscrowFactory on Arc testnet" },
  { label: "Split router", value: "Deployed", detail: "SplitPayoutRouter live on Arc" },
  { label: "Workspace pages", value: "18+", detail: "Full product, real Supabase data" },
  { label: "AI agent", value: "Live", detail: "Claude Haiku · 5 tools · Arc-native" },
  { label: "CCTP integration", value: "Integrated", detail: "Cross-chain escrow funding" },
  { label: "Revenue Passport", value: "Live", detail: "On-chain score from real history" },
  { label: "Circle DCW", value: "Integrated", detail: "ArcLume Wallet Lab connected" },
  { label: "x402 ready", value: "Designed", detail: "HTTP micropayments on Arc" },
];

const circleStack = [
  { product: "USDC", role: "Invoice currency, gas token, escrow settlement" },
  { product: "CCTP V2", role: "Cross-chain escrow funding from Ethereum, Base, Avalanche" },
  { product: "Developer Controlled Wallets", role: "ArcLume Wallet Lab: create wallets, transfer USDC" },
  { product: "Arc App Kits", role: "Bridge Kit, Unified Balance Kit integration points" },
  { product: "Gateway", role: "Unified multichain USDC balance layer" },
  { product: "USYC", role: "Idle treasury yield via tokenized money market fund" },
];

const grantFit = [
  { category: "Agentic commerce", fit: "High", reason: "AI agent creates invoices, manages escrows, releases milestones autonomously on Arc" },
  { category: "Payments", fit: "High", reason: "Milestone escrow, payout splits, cross-border USDC settlement. Core product." },
  { category: "Treasury management", fit: "Medium", reason: "USDC, EURC, USYC balances. USYC yield routing. Multi-sig approvals." },
  { category: "Stablecoin FX", fit: "Medium", reason: "EURC invoice support. CCTP cross-chain. USDC as gas eliminates FX on fees." },
];

export default function HomePage() {
  return (
    <div className="pb-20">
      <SiteNav />

      {/* TICKER */}
      <div className="overflow-hidden border-b border-white/5 bg-[rgba(10,18,13,.6)] py-2.5">
        <div className="flex animate-[ticker_30s_linear_infinite] items-center gap-12 whitespace-nowrap">
          {[
            "Arc testnet live", "USDC gas · Chain ID 5042002", "Sub-second finality",
            "Escrow factory deployed", "AI Agent live", "CCTP integrated", "ArcLume wallet intelligence",
            "Circle Developer Grant applicant", "Zero platform fees · First 12 months",
            "Arc testnet live", "USDC gas · Chain ID 5042002", "Sub-second finality",
            "Escrow factory deployed", "AI Agent live", "CCTP integrated", "ArcLume wallet intelligence",
            "Circle Developer Grant applicant", "Zero platform fees · First 12 months",
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted-2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-60" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <main>

        {/* HERO */}
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-20 pt-28">
          <div className="mx-auto max-w-[840px] text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/3 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                Circle Developer Grant Applicant · 2026
              </span>
            </div>

            <h1 className="mb-6 font-[family-name:var(--font-cormorant)] text-[clamp(3.8rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em] text-[var(--text)]">
              The stablecoin revenue OS<br />
              <em className="text-[var(--accent)]">built for Arc.</em>
            </h1>

            <p className="mb-10 mx-auto max-w-[600px] text-[1.05rem] leading-8 text-[var(--muted)]">
              Stablelane gives freelancers and agencies one workspace to invoice in USDC, lock funds in milestone escrow, split payouts to collaborators, and build an on-chain revenue history. All on Arc testnet. All live now.
            </p>

            {/* CTA */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/app"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[var(--accent)] px-8 py-4 text-[1rem] font-bold text-[#08100b] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(201,255,96,.3)]"
              >
                <span className="relative z-10">Open workspace</span>
                <svg className="relative z-10 transition group-hover:translate-x-1" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a
                href="#build"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-8 py-4 text-[1rem] font-semibold text-[var(--text)] transition hover:bg-white/7"
              >
                See what we built
              </a>
            </div>
          </div>

          {/* Stack pills */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            {stack.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/3 px-4 py-2">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{s.label}</span>
                <span className="h-3 w-px bg-white/10" />
                <span className="text-[0.82rem] font-bold text-[var(--accent)]">{s.value}</span>
                <span className="text-[0.72rem] text-[var(--muted-2)]">{s.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* WHAT WAS BUILT */}
        <section id="build" className="mx-auto w-[min(calc(100%-36px),1280px)] pb-24">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">Everything live on Arc testnet</div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.8rem)] tracking-[-0.05em]">
              What we shipped
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {built.map((item, i) => (
              <div key={i} className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{item.label}</span>
                  <span className="rounded-full bg-[rgba(201,255,96,.12)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--accent)]">{item.value}</span>
                </div>
                <div className="text-[0.82rem] text-[var(--muted)]">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-24">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">Product capabilities</div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.8rem)] tracking-[-0.05em]">
              Built for real work
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div key={i} className={`rounded-[24px] border p-7 transition hover:-translate-y-0.5 ${f.highlight ? "border-[rgba(201,255,96,.3)] bg-[rgba(201,255,96,.05)]" : "border-[var(--line)] bg-[var(--surface)]"}`}>
                <div className="mb-4 flex items-center justify-between">
                  <span className={`text-[1.4rem] ${f.highlight ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>{f.icon}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] ${f.highlight ? "bg-[var(--accent)] text-[#08100b]" : "border border-[var(--line)] text-[var(--muted)]"}`}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="mb-2 text-[1.08rem] font-bold">{f.title}</h3>
                <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CIRCLE STACK */}
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-24">
          <div className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)]">
            <div className="border-b border-[var(--line)] px-8 py-6">
              <div className="mb-1 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">Circle developer platform</div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-[2rem] tracking-[-0.04em]">
                Circle products at the core
              </h2>
            </div>
            <div className="divide-y divide-white/6">
              {circleStack.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-6 px-8 py-4">
                  <span className="text-[0.86rem] font-bold text-[var(--accent)]">{item.product}</span>
                  <span className="text-right text-[0.82rem] text-[var(--muted)]">{item.role}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GRANT FIT */}
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-24">
          <div className="mb-10 text-center">
            <div className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">Circle Grants Program 2026</div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.8rem)] tracking-[-0.05em]">
              Why Stablelane fits the brief
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {grantFit.map((item, i) => (
              <div key={i} className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[0.84rem] font-bold text-[var(--text)]">{item.category}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${item.fit === "High" ? "bg-[rgba(201,255,96,.15)] text-[var(--accent)]" : "bg-[rgba(201,200,100,.1)] text-[var(--accent-3)]"}`}>
                    {item.fit} fit
                  </span>
                </div>
                <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* OPEN APP CTA */}
        <section id="app" className="mx-auto w-[min(calc(100%-36px),1280px)] pb-10">
          <div className="overflow-hidden rounded-[32px] border border-[rgba(201,255,96,.25)] bg-[linear-gradient(135deg,rgba(14,25,18,.98),rgba(10,18,13,.95))] p-12 text-center shadow-[0_32px_80px_rgba(0,0,0,.5)]">
            <div className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">Live on Arc testnet</div>
            <h2 className="mb-4 font-[family-name:var(--font-cormorant)] text-[clamp(2.6rem,5vw,4.5rem)] tracking-[-0.05em]">
              Ready to use. Right now.
            </h2>
            <p className="mb-10 mx-auto max-w-[480px] text-[0.95rem] leading-7 text-[var(--muted)]">
              Sign in, create your workspace, and run your first invoice through Arc escrow. No real funds needed. Circle faucet gives you testnet USDC in 30 seconds.
            </p>

            {/* Big app icon + button */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-[rgba(201,255,96,.3)] bg-[rgba(201,255,96,.1)] shadow-[0_0_60px_rgba(201,255,96,.15)]">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M8 16C8 11.582 11.582 8 16 8H32C36.418 8 40 11.582 40 16V32C40 36.418 36.418 40 32 40H16C11.582 40 8 36.418 8 32V16Z" stroke="#c9ff60" strokeWidth="1.8"/>
                    <path d="M16 24H32M24 16V32" stroke="#c9ff60" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="24" cy="24" r="4" fill="rgba(201,255,96,0.2)" stroke="#c9ff60" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="3" fill="#08100b"/>
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-1 text-[0.82rem] font-bold text-[var(--text)]">Stablelane</div>
                <div className="text-[0.72rem] text-[var(--muted)]">stablelane.vercel.app</div>
              </div>

              <Link
                href="/app"
                className="group inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-10 py-4 text-[1.08rem] font-bold text-[#08100b] transition hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(201,255,96,.35)]"
              >
                Open workspace
                <svg className="transition group-hover:translate-x-1" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              <div className="flex items-center gap-6 text-[0.78rem] text-[var(--muted)]">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />Free to use</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />No real funds</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />Arc testnet</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mx-auto w-[min(calc(100%-36px),1280px)] mt-16 border-t border-white/8 pt-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-[0.82rem] font-bold text-[var(--text)]">Stablelane.</div>
          <div className="flex gap-6 text-[0.78rem] text-[var(--muted)]">
            <Link href="/privacy" className="hover:text-[var(--text)] transition">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition">Terms</Link>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition">Arcscan</a>
            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition">Faucet</a>
            <a href="https://mimisco-git.github.io/ArcLume/" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition">ArcLume</a>
          </div>
          <div className="text-[0.72rem] text-[var(--muted-2)]">Built on Arc. Powered by Circle.</div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

// ── Data ─────────────────────────────────────────────────────────────────────

const marketStats = [
  { value: "$1.5T", label: "Global freelance economy" },
  { value: "60M+", label: "Gig workers in Southeast Asia alone" },
  { value: "8.78%", label: "Avg cross-border payment fee today" },
  { value: "$0.01", label: "Stablelane tx cost on Arc" },
];

const circleIntegrations = [
  { name: "USDC", desc: "Native invoice + gas token. 6 decimals. Zero FX exposure." },
  { name: "CCTP V2", desc: "Fund Arc escrows from Ethereum, Base, Avalanche in one flow." },
  { name: "Developer Wallets", desc: "Circle DCW powers autonomous wallet creation in Wallet Lab." },
  { name: "Gateway", desc: "Unified multichain USDC balance layer for treasury management." },
  { name: "EURC", desc: "Euro-denominated invoicing for European client corridors." },
  { name: "USYC", desc: "Idle treasury yield via Circle's tokenized money market fund." },
];

const products = [
  {
    id: "01",
    name: "Invoice Engine",
    tagline: "USDC invoicing with milestone escrow",
    desc: "Create client-ready invoices, define milestone release logic, and send payment links that land on Arc testnet. Client locks funds before work starts.",
    metrics: [{ v: "<1s", l: "settlement" }, { v: "USDC", l: "gas token" }, { v: "0%", l: "platform fee*" }],
    link: "/app/invoices/new",
    tag: "Live",
  },
  {
    id: "02",
    name: "AI Agent",
    tagline: "Autonomous invoice + escrow management",
    desc: "Natural language interface powered by Claude Haiku. Creates real invoices, queries live workspace data, generates payment links. Agentic loop with up to 5 tool calls per request.",
    metrics: [{ v: "5", l: "tools" }, { v: "Real DB", l: "writes" }, { v: "Claude", l: "Haiku 4.5" }],
    link: "/app/agent",
    tag: "New",
  },
  {
    id: "03",
    name: "Revenue Passport",
    tagline: "On-chain business credibility layer",
    desc: "Every settled invoice becomes verifiable Arc history. Scored across invoice volume, escrow settlement, client diversity, and on-chain Arc activity. Portable. Permanent.",
    metrics: [{ v: "100pt", l: "max score" }, { v: "4", l: "signal categories" }, { v: "Arc", l: "verified" }],
    link: "/app/passport",
    tag: "Phase 2",
  },
  {
    id: "04",
    name: "Treasury",
    tagline: "USDC, EURC, USYC in one view",
    desc: "Live token balances on Arc testnet. USYC yield routing for idle funds. CCTP multichain funding so clients can pay from any supported chain.",
    metrics: [{ v: "3", l: "tokens" }, { v: "CCTP", l: "cross-chain" }, { v: "USYC", l: "yield" }],
    link: "/app/treasury-pro",
    tag: "New",
  },
];

const milestones = [
  {
    phase: "Milestone 1",
    title: "Market fit validation",
    items: [
      "50 active workspaces on Arc testnet",
      "100 invoices created and settled",
      "$10,000 USDC through Arc escrow",
      "AI agent handling 30% of invoice creation",
    ],
    status: "current",
  },
  {
    phase: "Milestone 2",
    title: "Cross-chain expansion",
    items: [
      "CCTP live on Arc mainnet for cross-chain escrow funding",
      "200 workspaces, $50k USDC settled",
      "Revenue Passport API open for third-party integration",
      "Mobile-responsive pay page with wallet connect",
    ],
    status: "next",
  },
  {
    phase: "Milestone 3",
    title: "Infrastructure layer",
    items: [
      "500 workspaces, $100k USDC settled through Arc",
      "Revenue Passport as queryable API for other Arc apps",
      "Stablelane as the default settlement layer for Arc freelance economy",
      "Strategic corridor launch: Nigeria, Indonesia, Philippines",
    ],
    status: "future",
  },
];

const trustSignals = [
  { label: "Built on Arc", sub: "Chain ID 5042002" },
  { label: "Powered by Circle", sub: "USDC · CCTP · DCW · USYC" },
  { label: "Open source", sub: "github.com/mimisco-git" },
  { label: "Testnet live", sub: "stablelane.vercel.app" },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <SiteNav />

      {/* ── TICKER ────────────────────────────────────────────────── */}
      <div className="overflow-hidden border-b border-white/[0.06] py-2">
        <div className="flex animate-[ticker_50s_linear_infinite] items-center gap-14 whitespace-nowrap">
          {[
            { dot: true, text: "Arc Testnet" },
            { dot: false, text: "Chain ID 5042002" },
            { dot: true, text: "USDC gas token" },
            { dot: false, text: "Sub-second finality" },
            { dot: true, text: "Escrow factory live" },
            { dot: false, text: "MilestoneEscrowFactory.sol" },
            { dot: true, text: "AI Agent" },
            { dot: false, text: "Claude Haiku 4.5" },
            { dot: true, text: "CCTP V2" },
            { dot: false, text: "Cross-chain settlement" },
            { dot: true, text: "Revenue Passport" },
            { dot: false, text: "On-chain credibility" },
            { dot: true, text: "USYC" },
            { dot: false, text: "Tokenized yield on Arc" },
            { dot: true, text: "Circle Developer Grant" },
            { dot: false, text: "2026 Applicant" },
            { dot: true, text: "Arc Testnet" },
            { dot: false, text: "Chain ID 5042002" },
            { dot: true, text: "USDC gas token" },
            { dot: false, text: "Sub-second finality" },
            { dot: true, text: "Escrow factory live" },
            { dot: false, text: "MilestoneEscrowFactory.sol" },
            { dot: true, text: "AI Agent" },
            { dot: false, text: "Claude Haiku 4.5" },
            { dot: true, text: "CCTP V2" },
            { dot: false, text: "Cross-chain settlement" },
            { dot: true, text: "Revenue Passport" },
            { dot: false, text: "On-chain credibility" },
            { dot: true, text: "USYC" },
            { dot: false, text: "Tokenized yield on Arc" },
            { dot: true, text: "Circle Developer Grant" },
            { dot: false, text: "2026 Applicant" },
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-3">
              {item.dot && <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--accent)] opacity-50" />}
              <span className={`text-[0.7rem] tracking-[0.12em] ${item.dot ? "font-semibold text-[var(--muted)] uppercase" : "text-[var(--muted-2)] uppercase font-normal"}`}>
                {item.text}
              </span>
            </span>
          ))}
        </div>
      </div>

      <main>

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative mx-auto w-[min(calc(100%-36px),1280px)] pb-24 pt-28">
          {/* Glow behind hero */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(201,255,96,0.07)_0%,transparent_70%)]" />

          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">
              Circle Developer Grant · 2026 Applicant
            </span>
          </div>

          <h1 className="mx-auto mb-6 max-w-[16ch] text-center font-[family-name:var(--font-cormorant)] text-[clamp(3.6rem,8vw,8rem)] leading-[0.88] tracking-[-0.06em]">
            The settlement infrastructure for the{" "}
            <span className="relative">
              <em className="text-[var(--accent)] not-italic">global</em>
            </span>{" "}
            freelance economy.
          </h1>

          <p className="mx-auto mb-8 max-w-[560px] text-center text-[1.06rem] leading-8 text-[var(--muted)]">
            Stablelane is a stablecoin-native revenue OS built on Arc. Milestone escrow, AI-powered invoice management, payout splits, and an on-chain Revenue Passport. Powered by Circle.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/app"
              className="group inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-8 py-4 text-[1rem] font-bold text-[#08100b] transition hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(201,255,96,.3)]">
              Open workspace
              <svg className="transition group-hover:translate-x-1" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#products"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-8 py-4 text-[1rem] font-semibold text-[var(--text)] transition hover:bg-white/7">
              Explore the platform
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            {trustSignals.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-full border border-white/8 bg-white/3 px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span className="text-[0.8rem] font-semibold text-[var(--text)]">{t.label}</span>
                <span className="text-[0.72rem] text-[var(--muted)]">{t.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── MARKET STATS ─────────────────────────────────────────── */}
        <section className="border-y border-white/6 bg-[rgba(7,16,11,.6)] py-12">
          <div className="mx-auto w-[min(calc(100%-36px),1280px)]">
            <div className="grid grid-cols-2 gap-px bg-white/6 lg:grid-cols-4">
              {marketStats.map((s, i) => (
                <div key={i} className="bg-[var(--bg)] px-8 py-8 text-center">
                  <div className="mb-2 font-[family-name:var(--font-cormorant)] text-[3rem] tracking-[-0.06em] text-[var(--accent)] leading-none">{s.value}</div>
                  <div className="text-[0.78rem] text-[var(--muted)] uppercase tracking-[0.06em]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM ──────────────────────────────────────────── */}
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">The problem</div>
              <h2 className="mb-6 font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.95] tracking-[-0.05em]">
                60 million workers.<br />
                <span className="text-[var(--accent)]">Zero financial infrastructure.</span>
              </h2>
              <div className="grid gap-4">
                {[
                  { no: "01", pain: "Payment delays", detail: "Freelancers wait 24-48 hours for batch-processed payouts. The work is real-time. The payment is not." },
                  { no: "02", pain: "Cross-border fees", detail: "Up to 8.78% lost on international payments before it reaches the worker. Compounding across every invoice." },
                  { no: "03", pain: "No financial history", detail: "Years of completed work lives in inboxes and chat threads. Invisible to banks, credit systems, and future clients." },
                  { no: "04", pain: "Client payment risk", detail: "Clients can ghost after delivery. There is no escrow layer. No protection. No recourse." },
                ].map((p, i) => (
                  <div key={i} className="flex gap-5 rounded-[20px] border border-white/7 bg-white/2 p-5">
                    <span className="shrink-0 font-[family-name:var(--font-cormorant)] text-[1.4rem] text-[var(--muted-2)]">{p.no}</span>
                    <div>
                      <div className="mb-1 font-bold text-[0.92rem]">{p.pain}</div>
                      <div className="text-[0.83rem] leading-6 text-[var(--muted)]">{p.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-8">
              <div className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">The Stablelane answer</div>
              <h3 className="mb-6 font-[family-name:var(--font-cormorant)] text-[2.2rem] leading-[1] tracking-[-0.04em]">One flow. From invoice to settled USDC.</h3>
              <div className="grid gap-3">
                {[
                  { icon: "▣", step: "Invoice created", detail: "USDC · Milestone terms · Client portal ready" },
                  { icon: "◈", step: "Escrow funded", detail: "Client locks full amount on Arc before work starts" },
                  { icon: "◎", step: "Milestone approved", detail: "Release executes in <1s · Ledger updates automatically" },
                  { icon: "◌", step: "Payout routed", detail: "Designer 60% · Developer 30% · PM 10% · One settlement" },
                  { icon: "★", step: "Revenue Passport updated", detail: "On-chain history grows · Score builds · Trust compounds" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-[16px] border border-white/7 bg-white/3 px-4 py-3">
                    <span className="text-[1.1rem] text-[var(--accent)]">{s.icon}</span>
                    <div className="flex-1">
                      <div className="text-[0.86rem] font-bold">{s.step}</div>
                      <div className="text-[0.74rem] text-[var(--muted)]">{s.detail}</div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-[var(--accent)] opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ─────────────────────────────────────────────── */}
        <section id="products" className="mx-auto w-[min(calc(100%-36px),1280px)] pb-24">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">Platform</div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.8rem)] tracking-[-0.05em]">Four products. One OS.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {products.map((p) => (
              <Link key={p.id} href={p.link}
                className="group relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-8 transition hover:border-[rgba(201,255,96,.3)] hover:-translate-y-0.5">
                <div className="absolute right-8 top-8 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] ${p.tag === "New" ? "bg-[var(--accent)] text-[#08100b]" : p.tag === "Live" ? "bg-[rgba(103,213,138,.15)] text-[var(--accent-2)]" : "border border-white/10 text-[var(--muted)]"}`}>
                    {p.tag}
                  </span>
                </div>
                <div className="mb-6 font-[family-name:var(--font-cormorant)] text-[3.5rem] text-[var(--line)] leading-none">{p.id}</div>
                <h3 className="mb-1 text-[1.2rem] font-bold">{p.name}</h3>
                <div className="mb-3 text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">{p.tagline}</div>
                <p className="mb-6 text-[0.86rem] leading-6 text-[var(--muted)]">{p.desc}</p>
                <div className="flex gap-4">
                  {p.metrics.map((m, i) => (
                    <div key={i} className="rounded-[12px] bg-white/4 px-3 py-2 text-center">
                      <div className="font-bold text-[0.92rem] text-[var(--accent)]">{m.v}</div>
                      <div className="text-[0.66rem] uppercase tracking-[0.06em] text-[var(--muted)]">{m.l}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-[0.82rem] font-semibold text-[var(--muted)] transition group-hover:text-[var(--accent)]">
                  Open <svg className="transition group-hover:translate-x-1" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CIRCLE STACK ─────────────────────────────────────────── */}
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-24">
          <div className="overflow-hidden rounded-[32px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(14,25,18,.98),rgba(8,16,11,.95))]">
            <div className="grid lg:grid-cols-[400px_1fr]">
              <div className="border-b border-white/8 p-10 lg:border-b-0 lg:border-r">
                <div className="mb-4 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">Circle Developer Platform</div>
                <h2 className="mb-4 font-[family-name:var(--font-cormorant)] text-[2.6rem] leading-[0.95] tracking-[-0.05em]">
                  Circle products at every layer.
                </h2>
                <p className="mb-6 text-[0.88rem] leading-7 text-[var(--muted)]">
                  Stablelane doesn&apos;t use Circle as a payment rail. Circle is the architecture. USDC as gas. CCTP for cross-chain. DCW for wallet infrastructure. USYC for yield.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {["USDC", "CCTP", "DCW", "EURC", "USYC", "Gateway"].map(p => (
                    <div key={p} className="rounded-[14px] border border-[rgba(201,255,96,.15)] bg-[rgba(201,255,96,.05)] px-3 py-2 text-center text-[0.78rem] font-bold text-[var(--accent)]">{p}</div>
                  ))}
                </div>
              </div>
              <div className="p-10">
                <div className="grid gap-4">
                  {circleIntegrations.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(201,255,96,.1)] text-[0.68rem] font-bold text-[var(--accent)]">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="mb-0.5 text-[0.88rem] font-bold text-[var(--accent)]">{item.name}</div>
                        <div className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GRANT MILESTONES ─────────────────────────────────────── */}
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-24">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[var(--muted-2)]">Circle Grants Program 2026</div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.8rem)] tracking-[-0.05em]">Three milestones. One vision.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {milestones.map((m, i) => (
              <div key={i} className={`rounded-[24px] border p-7 ${m.status === "current" ? "border-[rgba(201,255,96,.3)] bg-[rgba(201,255,96,.04)]" : "border-[var(--line)] bg-[var(--surface)]"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-[var(--muted-2)]">{m.phase}</span>
                  {m.status === "current" && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[0.65rem] font-bold text-[#08100b]">Active</span>}
                  {m.status === "next" && <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem] font-bold text-[var(--muted)]">Next</span>}
                  {m.status === "future" && <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem] font-bold text-[var(--muted)]">Future</span>}
                </div>
                <h3 className="mb-5 font-[family-name:var(--font-cormorant)] text-[1.6rem] tracking-[-0.04em]">{m.title}</h3>
                <div className="grid gap-2.5">
                  {m.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3 text-[0.83rem] text-[var(--muted)]">
                      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${m.status === "current" ? "bg-[var(--accent)]" : "bg-white/20"}`} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ARC ADVANTAGE ────────────────────────────────────────── */}
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "⚡", title: "Sub-second finality", detail: "Deterministic settlement. Every milestone release is final the moment it executes on Arc." },
              { icon: "◎", title: "USDC as gas", detail: "No ETH needed. Fees are paid in USDC. Cost is legible inside any business workflow." },
              { icon: "⇄", title: "CCTP multichain", detail: "Clients fund escrow from Ethereum, Base, or Avalanche. USDC burns on source, mints on Arc." },
              { icon: "◌", title: "EVM compatible", detail: "Deploy with Hardhat, Foundry, or viem. MilestoneEscrowFactory is already live on Arc testnet." },
            ].map((item, i) => (
              <div key={i} className="rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6">
                <div className="mb-4 text-[1.8rem] text-[var(--accent)]">{item.icon}</div>
                <h3 className="mb-2 font-bold text-[0.96rem]">{item.title}</h3>
                <p className="text-[0.82rem] leading-6 text-[var(--muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────── */}
        <section id="app" className="mx-auto w-[min(calc(100%-36px),1280px)] pb-10">
          <div className="relative overflow-hidden rounded-[36px] border border-[rgba(201,255,96,.2)] p-16 text-center"
            style={{ background: "linear-gradient(135deg, rgba(10,20,14,0.99) 0%, rgba(6,12,9,0.97) 100%)" }}>
            {/* radial glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[400px] w-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(201,255,96,0.08)_0%,transparent_70%)]" />
            </div>
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(201,255,96,.2)] bg-[rgba(201,255,96,.06)] px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
                <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">Live on Arc Testnet</span>
              </div>
              <h2 className="mb-4 font-[family-name:var(--font-cormorant)] text-[clamp(2.6rem,5vw,5rem)] leading-[0.92] tracking-[-0.06em]">
                Ready to use.<br />Right now.
              </h2>
              <p className="mx-auto mb-10 max-w-[440px] text-[0.95rem] leading-7 text-[var(--muted)]">
                Sign in, create your workspace, and run your first invoice through Arc escrow in under 5 minutes. No real funds needed.
              </p>
              <div className="flex flex-col items-center gap-5">
                <Link href="/app"
                  className="group inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-12 py-5 text-[1.1rem] font-bold text-[#08100b] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(201,255,96,.35)]">
                  Open workspace
                  <svg className="transition group-hover:translate-x-1" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 10h14M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <div className="flex items-center gap-6 text-[0.78rem] text-[var(--muted)]">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />Free to use</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />No real funds</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />Arc testnet</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />*First 12 months</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="mx-auto w-[min(calc(100%-36px),1280px)] border-t border-white/7 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <div className="mb-1 text-[0.88rem] font-bold">Stablelane.</div>
            <div className="text-[0.72rem] text-[var(--muted-2)]">The settlement infrastructure for the global freelance economy.</div>
          </div>
          <div className="flex flex-wrap gap-5 text-[0.78rem] text-[var(--muted)]">
            <Link href="/privacy" className="hover:text-[var(--text)] transition">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition">Terms</Link>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition">Arcscan</a>
            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition">Faucet</a>
            <a href="https://mimisco-git.github.io/ArcLume/" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition">ArcLume</a>
            <a href="https://github.com/mimisco-git/Stablelane" target="_blank" rel="noreferrer" className="hover:text-[var(--text)] transition">GitHub</a>
          </div>
          <div className="text-[0.72rem] text-[var(--muted-2)]">Built on Arc · Powered by Circle</div>
        </div>
      </footer>
    </div>
  );
}

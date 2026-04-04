import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { siteConfig } from "@/lib/site";

const productFlow = [
  {
    icon: "▣",
    title: "Invoice created",
    desc: "$4,800 USDC · Design sprint · 3 milestones · Client portal ready",
    badge: "Sent",
    tone: "done",
  },
  {
    icon: "◈",
    title: "Escrow funded",
    desc: "Client locks the full amount before work starts, milestone release terms already set.",
    badge: "Locked",
    tone: "lock",
  },
  {
    icon: "◎",
    title: "Milestone approved",
    desc: "Milestone two clears, release executes instantly, ledger updates automatically.",
    badge: "Settled",
    tone: "done",
  },
  {
    icon: "◌",
    title: "Split payout routed",
    desc: "Designer 60% · Developer 30% · PM 10% routed from the same settlement flow.",
    badge: "Live",
    tone: "live",
  },
];

const proofPoints = [
  {
    value: "6.49%",
    detail:
      "Global average remittance cost, a reminder that cross-border money movement is still expensive for the people who need it most.",
  },
  {
    value: "<1s",
    detail:
      "Arc documents deterministic sub-second finality, which matters when payout confidence should feel immediate and final.",
  },
  {
    value: "USDC gas",
    detail:
      "Arc uses stablecoins as gas, which makes costs much easier to understand inside a real business workflow.",
  },
  {
    value: "1 flow",
    detail:
      "Invoice, escrow, payout routing, and revenue trail belong in one operating layer, not four stitched tools.",
  },
];

const appMetrics = [
  {
    label: "Received this month",
    value: "$18.2k",
    note: "Settled revenue across live workspaces",
  },
  {
    label: "Locked in escrow",
    value: "$9.6k",
    note: "Already committed by clients",
  },
  {
    label: "Pending releases",
    value: "7",
    note: "Milestones waiting for approval",
  },
  {
    label: "Repeat clients",
    value: "4",
    note: "Signals for trust and financing later",
  },
];

const recentInvoices = [
  {
    client: "Northstar Studio",
    desc: "Brand refresh · Milestone 2 of 3",
    amount: "$1,600",
    badge: "Released",
    tone: "done",
  },
  {
    client: "Atlas Commerce",
    desc: "Landing page sprint · Waiting for deposit",
    amount: "$3,200",
    badge: "Awaiting escrow",
    tone: "lock",
  },
  {
    client: "Ridge Labs",
    desc: "Product copy sprint · Final review",
    amount: "$2,400",
    badge: "In progress",
    tone: "live",
  },
];

const payoutRows = [
  { role: "Designer", split: "60%", amount: "$960", width: "60%" },
  { role: "Developer", split: "30%", amount: "$480", width: "30%" },
  { role: "PM", split: "10%", amount: "$160", width: "10%" },
];

const problems = [
  {
    no: "01",
    title: "Fragmented workflow",
    desc: "One tool to send the invoice, another to collect, another to split payouts, and another to explain what happened later.",
    stat: "More moving parts, more failure points",
  },
  {
    no: "02",
    title: "Margin loss in cross-border payments",
    desc: "International client money still carries delay, cost, and corridor friction. Even small leakage compounds against your margin.",
    stat: "Cost hits the operator first",
  },
  {
    no: "03",
    title: "No business-grade revenue trail",
    desc: "Completed jobs live inside chats and inboxes, not in a durable ledger that can support trust, reporting, or future credit.",
    stat: "Great work, weak financial visibility",
  },
];

const howItWorks = [
  {
    no: "01",
    icon: "▣",
    title: "Create the invoice",
    desc: "Set the amount, due date, milestones, and client terms. Send one clean request instead of a messy manual process.",
  },
  {
    no: "02",
    icon: "◈",
    title: "Lock funds in escrow",
    desc: "The client deposits before work starts. Release logic is defined upfront so both sides know what happens next.",
  },
  {
    no: "03",
    icon: "◎",
    title: "Release and split payouts",
    desc: "When a milestone is approved, the release settles instantly and routes collaborator shares from the same payment flow.",
  },
  {
    no: "04",
    icon: "◌",
    title: "Build a revenue trail",
    desc: "Every completed invoice becomes part of a business-grade history that later supports trust, reporting, and financing products.",
  },
];

const featureCards = [
  {
    phase: "Phase 1",
    title: "Smart invoices and payment links",
    desc: "Create client-ready invoices in stablecoins, define milestones, and send a payment experience that feels like business software, not crypto plumbing.",
    items: [
      "Invoice creation with milestone schedules",
      "Client-facing payment links and cleaner checkout flows",
      "USDC and EURC-first settlement design",
      "Ledger-ready records for finance and reconciliation later",
    ],
    featured: true,
  },
  {
    phase: "Phase 1",
    title: "Escrow built for service work",
    desc: "The product should make it normal for a client to fund the engagement before work starts, while keeping release conditions transparent.",
    items: [
      "Milestone-based release logic",
      "Partial settlement support",
      "Approval and timeout windows",
      "Cleaner protection than ad hoc trust",
    ],
  },
  {
    phase: "Phase 1",
    title: "One payment, multiple collaborators",
    desc: "Freelancer collectives and agencies should not need manual payout math every time revenue lands. Split it once, route it cleanly.",
    items: [
      "Percentage or fixed payout routing",
      "Designer, developer, editor, PM, and VA support",
      "One release flow instead of onward manual transfers",
    ],
  },
  {
    phase: "Phase 2",
    title: "Turn settled work into business leverage",
    desc: "The moat is not only collecting money, it is proving revenue quality over time so the user can unlock trust signals and later capital products.",
    items: [
      "Completed invoice history as business proof",
      "Repeat-client and payment reliability signals",
      "Foundation for invoice advance and credit models later",
    ],
  },
];

const arcPills = [
  {
    icon: "⧉",
    title: "Deterministic finality",
    desc: "Arc documents sub-second deterministic finality, which is exactly the kind of certainty a settlement product needs.",
    value: "<1s",
  },
  {
    icon: "◎",
    title: "USDC as gas",
    desc: "Fees are denominated in USDC, which makes user cost easier to reason about than a separate volatile gas token model.",
    value: "USDC",
  },
  {
    icon: "◌",
    title: "EVM compatible",
    desc: "The first version can be built with familiar Solidity and EVM tooling, reducing friction for the product team.",
    value: "EVM",
  },
  {
    icon: "⇄",
    title: "Stablecoin-native rails",
    desc: "Arc is positioned for payments, FX, lending, and capital movement rather than generic onchain attention loops.",
    value: "Payments-first",
  },
];

const nextBuilds = [
  "Overview dashboard with real workspace data",
  "Invoice create form and client records",
  "Escrow detail state and release workflow",
  "Payout routing setup and templates",
];

function toneClasses(tone: string) {
  if (tone === "live") return "bg-[rgba(103,213,138,.12)] text-[var(--accent-2)]";
  if (tone === "lock") return "bg-[rgba(216,196,139,.12)] text-[var(--accent-3)]";
  return "bg-[rgba(201,255,96,.11)] text-[var(--accent)]";
}

export default function HomePage() {
  const waitlistHref = `mailto:${siteConfig.waitlistEmail}?subject=Stablelane%20waitlist`;

  return (
    <div className="pb-10">
      <SiteNav />

      <main>
        <section className="mx-auto w-[min(calc(100%-36px),1280px)] px-0 pb-14 pt-24">
          <div className="grid items-center gap-7 lg:grid-cols-[1.06fr_.94fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/3 px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                <span className="block h-px w-[18px] bg-[var(--accent)]" />
                Stablecoin Revenue OS
              </div>

              <h1 className="mb-5 max-w-[11ch] font-[family-name:var(--font-cormorant)] text-[clamp(3.5rem,6vw,6.1rem)] leading-[0.94] tracking-[-0.06em] text-[var(--text)]">
                From <em className="text-[var(--accent)]">quote</em> to payout, without leaving your lane.
              </h1>

              <p className="mb-8 max-w-3xl text-[1.07rem] leading-8 text-[var(--muted)]">
                Stablelane helps freelancers and agencies invoice clients, lock funds in milestone escrow,
                split payouts to collaborators, and turn payment history into business credibility, all on Arc.
              </p>

              <div className="mb-8 flex flex-wrap gap-3">
                <Link
                  href="#waitlist"
                  className="rounded-full bg-[var(--accent)] px-5 py-3.5 text-[0.95rem] font-bold text-[#08100b] transition hover:-translate-y-px"
                >
                  Get early access
                </Link>
                <Link
                  href="#product-preview"
                  className="rounded-full border border-white/8 bg-white/3 px-5 py-3.5 text-[0.95rem] font-bold text-[var(--text)] transition hover:-translate-y-px"
                >
                  See the product preview
                </Link>
              </div>

              <div className="flex flex-wrap gap-5 text-[0.85rem] text-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  Invoice → escrow → payout in one flow
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  USDC gas on Arc
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                  Built for remote work revenue
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.92),rgba(10,18,13,.88))] p-6 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(201,255,96,.14),transparent_70%)]" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(103,213,138,.12),transparent_70%)]" />

              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <div className="mb-2 text-[0.75rem] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
                    Live revenue flow
                  </div>
                  <p className="max-w-xl text-[0.86rem] leading-6 text-[var(--muted)]">
                    A premium first impression for the exact workflow Stablelane is meant to own.
                  </p>
                </div>
                <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                  Testnet first
                </div>
              </div>

              <div className="grid gap-3">
                {productFlow.map((item) => (
                  <div
                    key={item.title}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[20px] border border-white/7 bg-white/[.02] px-3 py-3"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-white/5 text-[1rem]">
                      {item.icon}
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-[var(--text)]">{item.title}</div>
                      <div className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.desc}</div>
                    </div>
                    <div className={`rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${toneClasses(item.tone)}`}>
                      {item.badge}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="rounded-[20px] border border-[var(--line)] bg-[rgba(201,255,96,.06)] p-4">
                  <small className="mb-1 block text-[0.78rem] text-[var(--muted)]">Net settled this month</small>
                  <strong className="font-[family-name:var(--font-cormorant)] text-[2.2rem] tracking-[-0.05em] text-[var(--accent)]">
                    $18,240
                  </strong>
                  <p className="mt-1 text-[0.82rem] leading-6 text-[var(--muted)]">
                    Revenue history is not just a record. It becomes business proof.
                  </p>
                </div>
                <div className="flex items-end">
                  <div className="rounded-full bg-[rgba(201,255,96,.11)] px-4 py-3 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                    Revenue trail building
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product-preview" className="mx-auto w-[min(calc(100%-36px),1280px)] py-2">
          <div className="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
            <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.9),rgba(10,18,13,.84))] p-6 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-xl">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                    <span className="block h-px w-4 bg-[var(--accent)]" />
                    Product preview
                  </div>
                  <h2 className="mb-2 font-[family-name:var(--font-cormorant)] text-[2.15rem] leading-none tracking-[-0.05em]">
                    Landing page plus app shell
                  </h2>
                  <p className="max-w-2xl text-[0.92rem] leading-7 text-[var(--muted)]">
                    This is the bridge from concept to software. The page now shows users how Stablelane will actually feel
                    once they move from marketing into the product.
                  </p>
                </div>
                <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.73rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                  Homepage update
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                <aside className="rounded-[22px] border border-white/8 bg-white/3 p-4">
                  <div className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.11em] text-[var(--muted-2)]">
                    Workspace
                  </div>
                  <div className="grid gap-2.5">
                    {["Overview", "Invoices", "Escrows", "Payouts", "Clients", "Ledger", "Settings"].map((item, index) => (
                      <div
                        key={item}
                        className={[
                          "rounded-2xl px-4 py-3 text-[0.92rem] font-semibold",
                          index === 0
                            ? "border border-[var(--line)] bg-[rgba(201,255,96,.08)] text-[var(--text)]"
                            : "bg-white/3 text-[var(--muted)]",
                        ].join(" ")}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {appMetrics.map((item) => (
                      <div key={item.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
                        <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
                          {item.label}
                        </div>
                        <strong className="mb-1 block font-[family-name:var(--font-cormorant)] text-[1.95rem] tracking-[-0.05em]">
                          {item.value}
                        </strong>
                        <p className="text-[0.8rem] leading-6 text-[var(--muted)]">{item.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 xl:grid-cols-[1.08fr_.92fr]">
                    <section className="rounded-[20px] border border-white/8 bg-white/3 p-4">
                      <h3 className="mb-1 text-[1rem] font-semibold">Recent invoices</h3>
                      <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">
                        The first version should make invoice state, funding status, and release readiness obvious at a glance.
                      </p>

                      <div className="grid gap-2.5">
                        {recentInvoices.map((invoice) => (
                          <div
                            key={invoice.client}
                            className="grid items-center gap-3 rounded-2xl border border-white/8 bg-white/[.02] p-4 sm:grid-cols-[1fr_auto_auto]"
                          >
                            <div>
                              <strong className="mb-1 block text-[0.96rem]">{invoice.client}</strong>
                              <small className="text-[0.8rem] text-[var(--muted)]">{invoice.desc}</small>
                            </div>
                            <div className="text-[0.92rem] font-bold text-[var(--text)]">{invoice.amount}</div>
                            <div className={`rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${toneClasses(invoice.tone)}`}>
                              {invoice.badge}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[20px] border border-white/8 bg-white/3 p-4">
                      <h3 className="mb-1 text-[1rem] font-semibold">Payout routing preview</h3>
                      <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">
                        Stablelane should remove the manual “who gets what?” step after every client payment lands.
                      </p>

                      <div className="grid gap-4">
                        {payoutRows.map((row) => (
                          <div key={row.role} className="grid gap-2">
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-[0.9rem] font-semibold">
                                {row.role} · <span className="text-[var(--muted)]">{row.split}</span>
                              </div>
                              <div className="text-[0.9rem] font-bold">{row.amount}</div>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full border border-white/6 bg-white/6">
                              <span
                                className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                                style={{ width: row.width }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.9),rgba(10,18,13,.84))] p-6 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-xl">
              <div className="mb-5">
                <div className="mb-2 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                  <span className="block h-px w-4 bg-[var(--accent)]" />
                  Why this stage matters
                </div>
                <h2 className="mb-2 font-[family-name:var(--font-cormorant)] text-[2.05rem] leading-none tracking-[-0.05em]">
                  Better story, better product momentum
                </h2>
                <p className="text-[0.92rem] leading-7 text-[var(--muted)]">
                  A premium landing page builds belief. A visible app shell builds trust. Together they make Stablelane easier to pitch,
                  easier to test, and easier to keep evolving.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  ["01", "The page now sells the workflow", "Invoice, escrow, payout routing, and business credibility feel connected instead of abstract."],
                  ["02", "The product shape is visible", "Users can already picture the dashboard, invoice queue, and payout logic before the backend is complete."],
                  ["03", "The next screens become obvious", "Overview, invoices, escrow detail, payout setup, and settings are now clear next steps instead of vague ideas."],
                  ["04", "It is stronger for ecosystem sharing", "This version is much better for early waitlist testing, screenshots, and explaining the product inside Arc conversations."],
                ].map(([no, title, desc]) => (
                  <div key={title} className="rounded-[20px] border border-white/8 bg-white/3 p-4">
                    <div className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.1em] text-[var(--accent)]">
                      {no}
                    </div>
                    <div className="mb-1 text-[0.98rem] font-semibold">{title}</div>
                    <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{desc}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-0 pt-10">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {proofPoints.map((item) => {
              const [main, suffix = ""] = item.value.split(" ");
              return (
                <article
                  key={item.value}
                  className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.84),rgba(10,18,13,.8))] p-5 shadow-[0_18px_60px_rgba(0,0,0,.26)] backdrop-blur-xl"
                >
                  <strong className="mb-3 block font-[family-name:var(--font-cormorant)] text-[2.5rem] leading-none tracking-[-0.06em]">
                    {main}
                    {suffix ? <span className="text-[var(--accent)]"> {suffix}</span> : null}
                  </strong>
                  <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-[min(calc(100%-36px),1280px)]">
          <div className="mb-8 grid items-end gap-6 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                <span className="block h-px w-4 bg-[var(--accent)]" />
                The problem
              </div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,4vw,3.8rem)] leading-[0.98] tracking-[-0.05em]">
                Global work still breaks at the <em className="text-[var(--accent)]">money layer</em>.
              </h2>
            </div>
            <p className="max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
              Most freelancers and agencies still patch together invoicing, chat, banking, escrow, and payout spreadsheets.
              That creates delay, fees, risk, and zero reusable revenue history.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {problems.map((item) => (
              <article
                key={item.no}
                className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.84),rgba(10,18,13,.8))] p-6 shadow-[0_18px_60px_rgba(0,0,0,.26)] backdrop-blur-xl"
              >
                <div className="mb-4 font-[family-name:var(--font-cormorant)] text-[3rem] leading-none text-white/20">
                  {item.no}
                </div>
                <div className="mb-2 text-[1.02rem] font-semibold">{item.title}</div>
                <p className="text-[0.9rem] leading-7 text-[var(--muted)]">{item.desc}</p>
                <div className="mt-4 text-[0.82rem] font-bold text-[var(--danger)]">{item.stat}</div>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-white/8 bg-[linear-gradient(180deg,rgba(11,21,15,.96),rgba(8,14,10,.96))]">
          <div className="mx-auto w-[min(calc(100%-36px),1280px)]">
            <div className="mb-8 grid items-end gap-6 lg:grid-cols-[.95fr_1.05fr]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                  <span className="block h-px w-4 bg-[var(--accent)]" />
                  How it works
                </div>
                <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,4vw,3.8rem)] leading-[0.98] tracking-[-0.05em]">
                  Four steps. <em className="text-[var(--accent)]">One lane.</em>
                </h2>
              </div>
              <p className="max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
                Stablelane is designed around the real freelancer-to-client flow, not generic wallet features.
                The user should move from quote to settled revenue without leaving the product.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {howItWorks.map((item) => (
                <article
                  key={item.no}
                  className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.84),rgba(10,18,13,.8))] p-6 shadow-[0_18px_60px_rgba(0,0,0,.26)] backdrop-blur-xl"
                >
                  <div className="mb-4 text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-[var(--accent)]">
                    {item.no}
                  </div>
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-[16px] border border-[var(--line)] bg-[rgba(201,255,96,.08)]">
                    {item.icon}
                  </div>
                  <div className="mb-2 text-[1rem] font-semibold">{item.title}</div>
                  <p className="text-[0.88rem] leading-7 text-[var(--muted)]">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-[min(calc(100%-36px),1280px)]">
          <div className="mb-8 grid items-end gap-6 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                <span className="block h-px w-4 bg-[var(--accent)]" />
                What you get
              </div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,4vw,3.8rem)] leading-[0.98] tracking-[-0.05em]">
                Everything from <em className="text-[var(--accent)]">invoice to credibility</em>.
              </h2>
            </div>
            <p className="max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
              Phase one solves the workflow pain. Phase two makes that workflow compounding by turning settled revenue
              into a durable operating asset.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className={[
                  "relative rounded-[26px] border border-white/8 p-6 shadow-[0_18px_60px_rgba(0,0,0,.26)] backdrop-blur-xl",
                  feature.featured
                    ? "bg-[linear-gradient(180deg,rgba(18,30,21,.9),rgba(12,21,15,.86))]"
                    : "bg-[linear-gradient(180deg,rgba(14,25,18,.84),rgba(10,18,13,.8))]",
                ].join(" ")}
              >
                <div className="absolute right-5 top-5 rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.1)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                  {feature.phase}
                </div>
                <div className="mb-2 text-[0.76rem] font-extrabold uppercase tracking-[0.1em] text-[var(--accent)]">
                  {feature.phase === "Phase 1" ? "Core module" : "Compounding layer"}
                </div>
                <h3 className="mb-3 max-w-[14ch] font-[family-name:var(--font-cormorant)] text-[2rem] leading-none tracking-[-0.04em]">
                  {feature.title}
                </h3>
                <p className="mb-4 text-[0.92rem] leading-7 text-[var(--muted)]">{feature.desc}</p>
                <ul className="grid gap-2 pl-5 text-[0.86rem] leading-7 text-[var(--muted)]">
                  {feature.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="arc" className="border-y border-white/8 bg-[linear-gradient(180deg,rgba(11,21,15,.96),rgba(8,14,10,.96))]">
          <div className="mx-auto w-[min(calc(100%-36px),1280px)]">
            <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                  <span className="block h-px w-4 bg-[var(--accent)]" />
                  Why Arc
                </div>
                <h2 className="mb-4 font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,4vw,3.8rem)] leading-[0.98] tracking-[-0.05em]">
                  Built on the chain designed for <em className="text-[var(--accent)]">stablecoin workflows</em>.
                </h2>
                <p className="max-w-2xl text-[1rem] leading-8 text-[var(--muted)]">
                  Stablelane should not feel like a generic crypto app. Arc’s design is a strong match for invoicing,
                  escrow, payout routing, and predictable money movement.
                </p>
              </div>

              <div className="grid gap-3">
                {arcPills.map((item) => (
                  <article
                    key={item.title}
                    className="grid items-center gap-3 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.84),rgba(10,18,13,.8))] p-5 shadow-[0_18px_60px_rgba(0,0,0,.24)] backdrop-blur-xl sm:grid-cols-[auto_1fr_auto]"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-white/5">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="mb-1 text-[0.98rem] font-semibold">{item.title}</h3>
                      <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{item.desc}</p>
                    </div>
                    <div className="font-[family-name:var(--font-cormorant)] text-[1.35rem] tracking-[-0.04em] text-[var(--accent)]">
                      {item.value}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="waitlist" className="mx-auto w-[min(calc(100%-36px),1280px)]">
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
              <span className="block h-px w-4 bg-[var(--accent)]" />
              Early access
            </div>
            <h2 className="mx-auto mb-4 max-w-[12ch] font-[family-name:var(--font-cormorant)] text-[clamp(2.5rem,4vw,3.8rem)] leading-[0.98] tracking-[-0.05em]">
              Make getting paid feel like running a <em className="text-[var(--accent)]">real business</em>.
            </h2>
            <p className="mx-auto mb-7 max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
              Join the early list for Stablelane. The first version is focused on freelancers, small agencies, and remote teams
              who want invoicing, escrow, and payout flow in one place.
            </p>

            <div className="mx-auto w-full max-w-[760px] rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.9),rgba(10,18,13,.84))] p-6 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-xl">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  aria-label="Email address for waitlist"
                  className="flex-1 rounded-full border border-white/8 bg-white/3 px-5 py-4 text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                />
                <a
                  href={waitlistHref}
                  className="rounded-full bg-[var(--accent)] px-5 py-4 text-center text-[0.95rem] font-bold text-[#08100b] transition hover:-translate-y-px"
                >
                  Join waitlist
                </a>
              </div>
              <p className="mb-5 text-[0.82rem] leading-6 text-[var(--muted)]">
                This homepage update now carries both the market story and a real product shape. The next build is the fully designed
                dashboard, invoices, escrow detail, payouts, and settings screens.
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {nextBuilds.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-white/[.02] px-4 py-3 text-left text-[0.84rem] leading-6 text-[var(--muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/8 px-4 py-2 text-[0.82rem] text-[var(--muted)]">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                Designed for Arc testnet first, then product rollout.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

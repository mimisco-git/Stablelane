import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { siteConfig } from "@/lib/site";
import { dashboardMetrics, payoutSplits, recentInvoices } from "@/lib/mock-data";

const problems = [
  {
    no: "01",
    title: "Fragmented workflow",
    desc: "One tool to send an invoice, another to collect, another to manually split payouts, and another to explain what happened later.",
    stat: "More moving parts, more failure points",
  },
  {
    no: "02",
    title: "Margin loss in cross-border payments",
    desc: "International payouts still carry real cost and delay. Even small frictions compound when your whole business runs on global clients.",
    stat: "Cost hits your profit first",
  },
  {
    no: "03",
    title: "No business-grade revenue trail",
    desc: "Completed jobs live in chats and inboxes, not in a usable ledger that can support trust, reporting, or future working capital.",
    stat: "Great work, weak financial visibility",
  },
];

const steps = [
  {
    no: "01",
    icon: "▣",
    title: "Create the invoice",
    desc: "Set the amount, due date, client, and milestone structure. Send one clean payment request instead of a messy manual process.",
  },
  {
    no: "02",
    icon: "◈",
    title: "Lock funds in escrow",
    desc: "The client deposits before work starts. Release rules are defined upfront so both sides know how settlement will happen.",
  },
  {
    no: "03",
    icon: "◎",
    title: "Release and split payouts",
    desc: "When a milestone is approved, the release can settle instantly and route shares to collaborators in the same flow.",
  },
  {
    no: "04",
    icon: "◌",
    title: "Build a revenue trail",
    desc: "Each completed invoice becomes part of a business-grade history that can later support trust, reporting, and credit products.",
  },
];

const features = [
  {
    phase: "Phase 1",
    title: "Smart invoices and payment links",
    desc: "Create client-ready invoices in stablecoins, define milestone structure, and send a payment experience that feels like business software, not crypto plumbing.",
    items: [
      "Invoice creation with due dates and milestone schedule",
      "Client-facing payment links and cleaner payment flows",
      "USDC- and EURC-first settlement design",
      "Ledger-ready records for finance and reconciliation later",
    ],
    featured: true,
  },
  {
    phase: "Phase 1",
    title: "Escrow built for service work",
    desc: "The product should make it normal for a client to fund the job before work starts, while giving both sides transparent release conditions.",
    items: [
      "Milestone-based release logic",
      "Partial settlement support",
      "Timeout and approval windows",
      "Cleaner protection than ad hoc trust",
    ],
  },
  {
    phase: "Phase 1",
    title: "One payment, multiple collaborators",
    desc: "Freelancer collectives and agencies should not need manual payout math after every invoice lands. Split it once, route it cleanly.",
    items: [
      "Percentage or fixed payout routing",
      "Designer, developer, editor, PM, VA support",
      "One release flow instead of manual onward transfers",
    ],
  },
  {
    phase: "Phase 2",
    title: "Turn settled work into business leverage",
    desc: "The moat is not only collecting money, it is proving revenue quality over time so the user can access trust signals and later capital products.",
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
    desc: "Fees are denominated in USDC, which makes user costs easier to understand than a separate volatile gas token model.",
    value: "USDC",
  },
  {
    icon: "◌",
    title: "EVM compatible",
    desc: "The stack can be built with familiar Solidity and EVM tooling, which reduces friction for the first product version.",
    value: "EVM",
  },
  {
    icon: "⇄",
    title: "Stablecoin-native rails",
    desc: "Arc is positioned for payments, FX, lending, and capital movement rather than generic attention-chasing onchain experiences.",
    value: "Payments-first",
  },
];

export default function HomePage() {
  return (
    <div className="pb-10">
      <SiteNav />

      <section className="mx-auto w-[min(calc(100%-36px),1280px)] px-0 pb-14 pt-24">
        <div className="grid items-center gap-7 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/3 px-4 py-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
              <span className="block h-px w-[18px] bg-[var(--accent)]" />
              Stablecoin Revenue OS
            </div>
            <h1 className="mb-4 max-w-[11ch] font-[family-name:var(--font-cormorant)] text-[clamp(3.3rem,6vw,5.8rem)] leading-[0.96] tracking-[-0.05em] text-[var(--text)]">
              From <em className="text-[var(--accent)]">quote</em> to payout, without leaving your lane.
            </h1>
            <p className="mb-7 max-w-3xl text-[1.05rem] leading-8 text-[var(--muted)]">
              Stablelane helps freelancers and agencies invoice clients, lock funds in milestone escrow,
              split payouts to collaborators, and turn payment history into business credibility, all on Arc.
            </p>
            <div className="mb-7 flex flex-wrap gap-3">
              <Link href="#waitlist" className="rounded-full bg-[var(--accent)] px-5 py-3.5 text-[0.95rem] font-bold text-[#08100b]">
                Get early access
              </Link>
              <Link href="#preview" className="rounded-full border border-white/8 bg-white/3 px-5 py-3.5 text-[0.95rem] font-bold text-[var(--text)]">
                See the product preview
              </Link>
            </div>
            <div className="flex flex-wrap gap-5 text-[0.85rem] text-[var(--muted)]">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Invoice → escrow → payout in one flow</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> USDC gas on Arc</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Built for remote work revenue</div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
            <div className="mb-4 text-[0.75rem] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
              Live revenue flow
            </div>
            <div className="grid gap-3">
              {[
                ["▣", "Invoice created", "$4,800 USDC · Design sprint · 3 milestones", "Sent", "done"],
                ["◈", "Client funds escrow", "Capital is locked before work starts, milestone release rules already set.", "Locked", "lock"],
                ["◎", "Milestone approved", "$1,600 settles immediately once the milestone is accepted.", "Settled", "done"],
                ["◌", "Team payout split", "Designer 60% · Developer 30% · PM 10% in the same release flow.", "Live", "live"],
              ].map(([icon, title, desc, badge, kind]) => (
                <div key={title} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/8 py-3 last:border-b-0">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/8 bg-white/5">{icon}</div>
                  <div>
                    <div className="mb-1 font-bold">{title}</div>
                    <div className="text-[0.84rem] leading-6 text-[var(--muted)]">{desc}</div>
                  </div>
                  <div className={[
                    "rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em]",
                    kind === "live" ? "bg-[rgba(103,213,138,.12)] text-[var(--accent-2)]" : "",
                    kind === "lock" ? "bg-[rgba(216,196,139,.12)] text-[var(--accent-3)]" : "",
                    kind === "done" ? "bg-[rgba(201,255,96,.11)] text-[var(--accent)]" : "",
                  ].join(" ")}>
                    {badge}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-end justify-between gap-3 rounded-[18px] border border-[var(--line)] bg-[rgba(201,255,96,.06)] p-4">
              <div>
                <small className="mb-1 block text-[0.78rem] text-[var(--muted)]">Net settled this month</small>
                <strong className="font-[family-name:var(--font-cormorant)] text-[1.9rem] tracking-[-0.04em] text-[var(--accent)]">
                  $18,240
                </strong>
              </div>
              <div className="rounded-full bg-[rgba(201,255,96,.11)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                Revenue trail building
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="preview" className="mx-auto w-[min(calc(100%-36px),1280px)] py-2">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                  <span className="block h-px w-4 bg-[var(--accent)]" /> Next stage
                </div>
                <h2 className="mb-2 font-[family-name:var(--font-cormorant)] text-[2.1rem] leading-none tracking-[-0.04em]">
                  Dashboard and app shell
                </h2>
                <p className="max-w-2xl text-[0.92rem] leading-7 text-[var(--muted)]">
                  The landing page now rolls into a first product shell so users can immediately understand what Stablelane
                  will feel like once they enter the app.
                </p>
              </div>
              <div className="rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.08)] px-3 py-2 text-[0.73rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                V1 starter
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
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {dashboardMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-[18px] border border-white/8 bg-white/3 p-4">
                      <div className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--muted-2)]">
                        {metric.label}
                      </div>
                      <strong className="mb-1 block font-[family-name:var(--font-cormorant)] text-[1.9rem] tracking-[-0.04em]">
                        {metric.value}
                      </strong>
                      <p className="text-[0.8rem] leading-6 text-[var(--muted)]">{metric.note}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
                  <section className="rounded-[20px] border border-white/8 bg-white/3 p-4">
                    <h3 className="mb-1 text-base font-bold">Recent invoices</h3>
                    <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">
                      The first version should make invoices, statuses, and settlement state obvious at a glance.
                    </p>
                    <div className="grid gap-2.5">
                      {recentInvoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="grid items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 md:grid-cols-[1fr_auto_auto]"
                        >
                          <div>
                            <strong className="mb-1 block">{invoice.client}</strong>
                            <small className="text-[0.8rem] text-[var(--muted)]">
                              {invoice.title} · {invoice.stage}
                            </small>
                          </div>
                          <div className="text-[0.92rem] font-extrabold">{invoice.amount}</div>
                          <div className="rounded-full bg-[rgba(201,255,96,.11)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                            {invoice.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-[20px] border border-white/8 bg-white/3 p-4">
                    <h3 className="mb-1 text-base font-bold">Payout routing preview</h3>
                    <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">
                      Stablelane should remove the manual who-gets-what step after every client payment.
                    </p>
                    <div className="grid gap-3">
                      {payoutSplits.map((split) => (
                        <div key={split.member} className="grid gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <strong>{split.member} · {split.percent}%</strong>
                            <span className="text-[0.92rem] font-extrabold">{split.amount}</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/5">
                            <span
                              className="block h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                              style={{ width: `${split.percent}%` }}
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

          <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
            <div className="mb-5">
              <div className="mb-2 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                <span className="block h-px w-4 bg-[var(--accent)]" /> Why this matters
              </div>
              <h2 className="mb-2 font-[family-name:var(--font-cormorant)] text-[2.1rem] leading-none tracking-[-0.04em]">
                A clearer product story
              </h2>
              <p className="text-[0.92rem] leading-7 text-[var(--muted)]">
                The landing page sells the vision. The app shell makes the workflow feel real. Both together are much better than a beautiful page with no product shape.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ["01", "Landing page builds belief", "Position the product around invoice, escrow, payouts, and business credibility."],
                ["02", "App shell creates trust", "Users can see what the dashboard, invoices, and payout workflow will actually feel like."],
                ["03", "Next build becomes obvious", "After this, the product path becomes dashboard, invoice form, escrow state, and payout screens."],
                ["04", "Better for pitching", "This makes Stablelane much easier to explain to users, builders, and the Arc ecosystem."],
              ].map(([no, title, desc]) => (
                <div key={title} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-white/8 bg-white/3 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/8 bg-white/5 font-extrabold text-[var(--accent)]">
                    {no}
                  </div>
                  <div>
                    <div className="mb-1 font-bold">{title}</div>
                    <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto w-[min(calc(100%-36px),1280px)] py-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              value: "6.49%",
              label: "Global average cost of sending remittances, a reminder of how expensive cross-border money movement still is for many users.",
            },
            {
              value: "<1s",
              label: "Arc documents deterministic sub-second finality, which matters when you want settlement confidence, not probably final.",
            },
            {
              value: "USDC gas",
              label: "Arc uses stablecoins as gas, starting with USDC, which makes cost far easier to reason about in a business workflow.",
            },
            {
              value: "1 flow",
              label: "Invoice, escrow, payout split, and revenue trail in one operating layer instead of four stitched tools.",
            },
          ].map((stat) => (
            <article key={stat.value} className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
              <strong className="mb-2 block font-[family-name:var(--font-cormorant)] text-[2.5rem] leading-none tracking-[-0.05em]">
                {stat.value.includes("%") ? (
                  <>
                    6.49<span className="text-[var(--accent)]">%</span>
                  </>
                ) : stat.value === "<1s" ? (
                  <>
                    &lt;1<span className="text-[var(--accent)]">s</span>
                  </>
                ) : stat.value === "USDC gas" ? (
                  <>
                    USDC<span className="text-[var(--accent)]"> gas</span>
                  </>
                ) : (
                  <>
                    1<span className="text-[var(--accent)]"> flow</span>
                  </>
                )}
              </strong>
              <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-[min(calc(100%-36px),1280px)] py-20">
        <div className="mb-8 grid gap-7 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
              <span className="block h-px w-4 bg-[var(--accent)]" /> The problem
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.6rem)] leading-none tracking-[-0.04em]">
              Global work still breaks at the <em className="text-[var(--accent)]">money layer</em>.
            </h2>
          </div>
          <p className="max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
            Most freelancers and agencies still patch together invoicing, chat, banking, escrow, and payout spreadsheets. That creates delay, fees, risk, and zero reusable revenue history.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {problems.map((problem) => (
            <article key={problem.no} className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
              <div className="mb-4 font-[family-name:var(--font-cormorant)] text-[3rem] leading-none text-white/20">
                {problem.no}
              </div>
              <div className="mb-2 text-[1.03rem] font-bold">{problem.title}</div>
              <div className="text-[0.9rem] leading-7 text-[var(--muted)]">{problem.desc}</div>
              <div className="mt-4 text-[0.82rem] font-bold text-[var(--danger)]">{problem.stat}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-white/8 bg-[linear-gradient(180deg,rgba(11,21,15,.95),rgba(8,14,10,.95))] py-20">
        <div className="mx-auto w-[min(calc(100%-36px),1280px)]">
          <div className="mb-8 grid gap-7 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
                <span className="block h-px w-4 bg-[var(--accent)]" /> How it works
              </div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.6rem)] leading-none tracking-[-0.04em]">
                Four steps. <em className="text-[var(--accent)]">One lane.</em>
              </h2>
            </div>
            <p className="max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
              Stablelane is designed around the real freelancer-to-client flow, not generic wallet features. The user should move from quote to settled revenue without leaving the product.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <article key={step.no} className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
                <div className="mb-4 text-[0.78rem] font-bold tracking-[0.1em] text-[var(--accent)]">{step.no}</div>
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] bg-[rgba(201,255,96,.08)]">
                  {step.icon}
                </div>
                <div className="mb-2 text-[1rem] font-bold">{step.title}</div>
                <div className="text-[0.88rem] leading-7 text-[var(--muted)]">{step.desc}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-[min(calc(100%-36px),1280px)] py-20">
        <div className="mb-8 grid gap-7 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
              <span className="block h-px w-4 bg-[var(--accent)]" /> What you get
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.6rem)] leading-none tracking-[-0.04em]">
              Everything from <em className="text-[var(--accent)]">invoice to credibility</em>.
            </h2>
          </div>
          <p className="max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
            Phase one solves the workflow pain. Phase two makes that workflow compounding by turning settled revenue into a durable operating asset.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={[
                "relative rounded-[26px] border border-white/8 p-6 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl",
                feature.featured
                  ? "bg-[linear-gradient(180deg,rgba(18,30,21,.88),rgba(12,21,15,.84))]"
                  : "bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))]",
              ].join(" ")}
            >
              <div className="absolute right-5 top-5 rounded-full border border-[var(--line)] bg-[rgba(201,255,96,.1)] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-[var(--accent)]">
                {feature.phase}
              </div>
              <div className="mb-2 text-[0.76rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
                {feature.phase === "Phase 2" ? "Revenue trail" : feature.title === "One payment, multiple collaborators" ? "Payout router" : feature.title === "Escrow built for service work" ? "Milestone escrow" : "Invoice hub"}
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-cormorant)] text-[1.9rem] tracking-[-0.03em]">
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

      <section id="arc" className="border-y border-white/8 bg-[linear-gradient(180deg,rgba(11,21,15,.95),rgba(8,14,10,.95))] py-20">
        <div className="mx-auto w-[min(calc(100%-36px),1280px)] grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
              <span className="block h-px w-4 bg-[var(--accent)]" /> Why Arc
            </div>
            <h2 className="mb-3 font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.6rem)] leading-none tracking-[-0.04em]">
              Built on the chain designed for <em className="text-[var(--accent)]">stablecoin workflows</em>.
            </h2>
            <p className="max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
              Stablelane should not feel like a generic crypto app. Arc’s design is a strong match for invoicing, escrow, payout routing, and predictable money movement.
            </p>
          </div>

          <div className="grid gap-3">
            {arcPills.map((pill) => (
              <article key={pill.title} className="grid items-center gap-3 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-5 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl md:grid-cols-[auto_1fr_auto]">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-white/5">{pill.icon}</div>
                <div>
                  <h3 className="mb-1 text-[0.97rem] font-bold">{pill.title}</h3>
                  <p className="text-[0.84rem] leading-6 text-[var(--muted)]">{pill.desc}</p>
                </div>
                <div className="font-[family-name:var(--font-cormorant)] text-[1.35rem] text-[var(--accent)]">{pill.value}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="mx-auto w-[min(calc(100%-36px),1280px)] py-20 text-center">
        <div className="mb-3 inline-flex items-center gap-2 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
          <span className="block h-px w-4 bg-[var(--accent)]" /> Early access
        </div>
        <h2 className="mx-auto mb-3 max-w-[12ch] font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.6rem)] leading-none tracking-[-0.04em]">
          Make getting paid feel like running a <em className="text-[var(--accent)]">real business</em>.
        </h2>
        <p className="mx-auto mb-7 max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
          Join the early list for Stablelane. The first version is focused on freelancers, small agencies, and remote teams who want invoicing, escrow, and payout flow in one place.
        </p>

        <div className="mx-auto w-full max-w-[620px] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.86),rgba(10,18,13,.82))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.36)] backdrop-blur-xl">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email address for waitlist"
              className="flex-1 rounded-full border border-white/8 bg-white/3 px-4 py-3.5 outline-none"
            />
            <a
              className="rounded-full bg-[var(--accent)] px-5 py-3.5 text-[0.95rem] font-bold text-[#08100b]"
              href={`mailto:${siteConfig.waitlistEmail}?subject=Stablelane%20waitlist`}
            >
              Join waitlist
            </a>
          </div>
          <p className="text-[0.8rem] leading-6 text-[var(--muted)]">
            This starter gives you the landing page and the first app shell. Next comes real invoice creation, escrow state management, and payout routing flows.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/8 px-4 py-2 text-[0.82rem] text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            {siteConfig.appMode} mode · Arc testnet first
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 py-8">
        <div className="mx-auto flex w-[min(calc(100%-36px),1280px)] flex-wrap items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#c9ff60,#67d58a)] font-extrabold text-[#08100b]">
              S
            </div>
            <div className="font-[family-name:var(--font-cormorant)] text-[1.55rem] font-semibold tracking-[-0.03em] text-[var(--text)]">
              Stablelane<span className="text-[var(--accent)]">.</span>
            </div>
          </Link>
          <div className="flex flex-wrap gap-4 text-[0.86rem] text-[var(--muted)]">
            <Link href="#how">How it works</Link>
            <Link href="#preview">Product preview</Link>
            <Link href="#features">Features</Link>
            <Link href="#arc">Why Arc</Link>
          </div>
          <small className="text-[var(--muted-2)]">Stablelane starter repo.</small>
        </div>
      </footer>
    </div>
  );
}

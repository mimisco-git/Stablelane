export const dashboardMetrics = [
  {
    label: "Received this month",
    value: "$18.2k",
    note: "Settled stablecoin revenue across active invoices.",
  },
  {
    label: "Locked in escrow",
    value: "$9.6k",
    note: "Capital committed by clients but not released yet.",
  },
  {
    label: "Pending payouts",
    value: "7",
    note: "Collaborator splits waiting on release events.",
  },
  {
    label: "Repeat clients",
    value: "4",
    note: "A trust signal that later feeds credibility and financing.",
  },
];

export const readinessChecklist = [
  { title: "Workspace set up", detail: "Business profile, wallet, and default currencies configured.", done: true },
  { title: "First invoice sent", detail: "An invoice has been created and sent to a client.", done: true },
  { title: "Escrow contract connected", detail: "UI ready now, onchain release logic comes next.", done: false },
  { title: "Payout template saved", detail: "Default team split can be reused across invoices.", done: true },
];

export const activityTimeline = [
  { title: "Northstar milestone approved", meta: "Milestone 2 · $1,600 released", time: "12m ago", tone: "done" },
  { title: "Atlas invoice opened", meta: "Client viewed payment link", time: "49m ago", tone: "live" },
  { title: "Ridge payout template updated", meta: "Designer 50% · Writer 50%", time: "2h ago", tone: "neutral" },
  { title: "Workspace created on Arc testnet", meta: "Stablelane starter activated", time: "Today", tone: "lock" },
];

export const releaseQueue = [
  { invoice: "Northstar Studio", milestone: "Milestone 3", amount: "$1,600", state: "Waiting on delivery", due: "Today" },
  { invoice: "Ridge Labs", milestone: "Final review", amount: "$1,200", state: "Ready for approval", due: "Tomorrow" },
  { invoice: "Atlas Commerce", milestone: "Kickoff deposit", amount: "€3,200", state: "Awaiting funding", due: "May 02" },
];

export const recentInvoices = [
  {
    id: "inv_northstar",
    client: "Northstar Studio",
    title: "Brand refresh",
    stage: "Milestone 2 of 3",
    amount: "$1,600",
    status: "Released",
  },
  {
    id: "inv_atlas",
    client: "Atlas Commerce",
    title: "Growth landing page",
    stage: "Waiting for deposit",
    amount: "€3,200",
    status: "Awaiting escrow",
  },
  {
    id: "inv_ridge",
    client: "Ridge Labs",
    title: "Product copy sprint",
    stage: "Final review",
    amount: "$2,400",
    status: "In progress",
  },
];

export const payoutSplits = [
  { member: "Designer", percent: 60, amount: "$960" },
  { member: "Developer", percent: 30, amount: "$480" },
  { member: "PM", percent: 10, amount: "$160" },
];

export const invoicesTable = [
  {
    id: "inv_northstar",
    title: "Northstar Studio · Brand refresh",
    client: "Northstar Studio",
    currency: "USDC",
    total: "$4,800",
    status: "In escrow",
    dueDate: "Apr 30",
    paymentMode: "Milestone escrow",
    funded: "$4,800",
  },
  {
    id: "inv_atlas",
    title: "Atlas Commerce · Growth landing page",
    client: "Atlas Commerce",
    currency: "EURC",
    total: "€3,200",
    status: "Sent",
    dueDate: "May 02",
    paymentMode: "Direct or escrow",
    funded: "Not funded yet",
  },
  {
    id: "inv_ridge",
    title: "Ridge Labs · Product copy sprint",
    client: "Ridge Labs",
    currency: "USDC",
    total: "$2,400",
    status: "Partially released",
    dueDate: "Apr 27",
    paymentMode: "Milestone escrow",
    funded: "$2,400",
  },
  {
    id: "inv_lattice",
    title: "Lattice Audio · Launch copy",
    client: "Lattice Audio",
    currency: "EURC",
    total: "€1,850",
    status: "Draft",
    dueDate: "May 06",
    paymentMode: "Direct payment",
    funded: "Not funded yet",
  },
];

export const invoiceSummaryCards = [
  { label: "Draft", value: "4" },
  { label: "Awaiting funding", value: "3" },
  { label: "In escrow", value: "2" },
  { label: "Completed", value: "8" },
];

export const invoiceMilestones = [
  { title: "Milestone 1", amount: "$1,600", status: "Released", detail: "Discovery, strategy, and kickoff approved." },
  { title: "Milestone 2", amount: "$1,600", status: "Ready for approval", detail: "Design files delivered and waiting on client sign-off." },
  { title: "Milestone 3", amount: "$1,600", status: "Locked", detail: "Final handoff and production asset delivery." },
];

export const escrows = [
  {
    id: "esc_northstar",
    title: "Northstar Studio Escrow",
    funded: "$4,800",
    released: "$1,600",
    milestones: "3 milestones",
    status: "Active",
    nextAction: "Client approval pending",
  },
  {
    id: "esc_ridge",
    title: "Ridge Labs Escrow",
    funded: "$2,400",
    released: "$1,200",
    milestones: "2 milestones",
    status: "Partial",
    nextAction: "Final milestone preparing",
  },
];

export const escrowTimeline = [
  { event: "Escrow funded", meta: "Client deposited full contract value", time: "Apr 18", tone: "done" },
  { event: "Milestone 1 released", meta: "$1,600 routed to team wallets", time: "Apr 23", tone: "done" },
  { event: "Milestone 2 requested", meta: "Waiting on client approval", time: "Today", tone: "live" },
];

export const payouts = [
  {
    id: "pay_1",
    settlement: "Northstar Milestone 2",
    recipient: "Designer",
    amount: "$960",
    status: "Completed",
    wallet: "0x98c...4a1f",
  },
  {
    id: "pay_2",
    settlement: "Northstar Milestone 2",
    recipient: "Developer",
    amount: "$480",
    status: "Completed",
    wallet: "0x77f...8bc0",
  },
  {
    id: "pay_3",
    settlement: "Northstar Milestone 2",
    recipient: "PM",
    amount: "$160",
    status: "Completed",
    wallet: "0x12a...dd73",
  },
];

export const payoutTemplates = [
  {
    name: "Core studio split",
    description: "Default split for design-led client work.",
    members: [
      { name: "Designer", split: "60%" },
      { name: "Developer", split: "30%" },
      { name: "PM", split: "10%" },
    ],
  },
  {
    name: "Copy + strategy sprint",
    description: "Lean setup for writing engagements.",
    members: [
      { name: "Writer", split: "70%" },
      { name: "Editor", split: "20%" },
      { name: "Ops", split: "10%" },
    ],
  },
];

export const settingsCards = [
  { title: "Workspace name", value: "Stablelane Studio" },
  { title: "Default currencies", value: "USDC, EURC" },
  { title: "Settlement mode", value: "Arc testnet preview" },
  { title: "Payout template", value: "Core studio split" },
];


export const invoiceListBase = invoicesTable;

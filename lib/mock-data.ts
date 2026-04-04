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
    currency: "USDC",
    total: "$4,800",
    status: "In escrow",
    dueDate: "Apr 30",
  },
  {
    id: "inv_atlas",
    title: "Atlas Commerce · Growth landing page",
    currency: "EURC",
    total: "€3,200",
    status: "Sent",
    dueDate: "May 02",
  },
  {
    id: "inv_ridge",
    title: "Ridge Labs · Product copy sprint",
    currency: "USDC",
    total: "$2,400",
    status: "Partially released",
    dueDate: "Apr 27",
  },
];

export const escrows = [
  {
    id: "esc_northstar",
    title: "Northstar Studio Escrow",
    funded: "$4,800",
    released: "$1,600",
    milestones: "3 milestones",
    status: "Active",
  },
  {
    id: "esc_ridge",
    title: "Ridge Labs Escrow",
    funded: "$2,400",
    released: "$1,200",
    milestones: "2 milestones",
    status: "Partial",
  },
];

export const payouts = [
  {
    id: "pay_1",
    settlement: "Northstar Milestone 2",
    recipient: "Designer",
    amount: "$960",
    status: "Completed",
  },
  {
    id: "pay_2",
    settlement: "Northstar Milestone 2",
    recipient: "Developer",
    amount: "$480",
    status: "Completed",
  },
  {
    id: "pay_3",
    settlement: "Northstar Milestone 2",
    recipient: "PM",
    amount: "$160",
    status: "Completed",
  },
];

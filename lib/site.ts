export const siteConfig = {
  name: "Stablelane",
  description:
    "Stablecoin revenue OS for freelancers, agencies, and remote teams.",
  waitlistEmail:
    process.env.NEXT_PUBLIC_WAITLIST_EMAIL || "you@example.com",
  appMode: process.env.NEXT_PUBLIC_APP_MODE || "testnet",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  arc: {
    rpcUrl:
      process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network",
    chainId: Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || 5042002),
    explorerUrl:
      process.env.NEXT_PUBLIC_ARC_EXPLORER_URL || "https://testnet.arcscan.app",
    gasToken: process.env.NEXT_PUBLIC_ARC_GAS_TOKEN || "USDC",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "",
  },
};

export const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#preview", label: "Product preview" },
  { href: "#features", label: "Features" },
  { href: "#arc", label: "Why Arc" },
  { href: "#waitlist", label: "Waitlist" },
];

export const dashboardNav = [
  { href: "/app", label: "Overview" },
  { href: "/app/invoices", label: "Invoices" },
  { href: "/app/escrows", label: "Escrows" },
  { href: "/app/arc", label: "Arc" },
  { href: "/app/payouts", label: "Payouts" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/activity", label: "Activity" },
  { href: "/app/ops", label: "Ops" },
  { href: "/app/approvals", label: "Approvals" },
  { href: "/app/team", label: "Team" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/settings", label: "Settings" },
];

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
  { href: "#products", label: "Platform" },
  { href: "#milestones", label: "Roadmap" },
  { href: "#circle", label: "Circle stack" },
];

export const dashboardNav = [
  { href: "/app", label: "Overview" },
  { href: "/app/invoices", label: "Invoices" },
  { href: "/app/escrows", label: "Escrows" },
  { href: "/app/payouts", label: "Payouts" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/ledger", label: "Ledger" },
  { href: "/app/analytics", label: "Analytics" },
  { href: "/app/agent", label: "Agent" },
  { href: "/app/treasury-pro", label: "Treasury" },
  { href: "/app/arc", label: "Arc" },
  { href: "/app/settings", label: "Settings" },
  { href: "/app/account", label: "Account" },
];

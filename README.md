# Stablelane

Stablecoin revenue OS for freelancers, agencies, and remote teams. Invoice clients, lock funds in milestone escrow, split payouts to collaborators, and turn payment history into business credibility. Built on Arc.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (auth and database)
- viem (wallet and contract interactions)
- Arc testnet (stablecoin-native L1)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Fill in your Supabase project values and waitlist email
# Edit .env.local

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable (anon) key |
| `NEXT_PUBLIC_WAITLIST_EMAIL` | Yes | Email address for waitlist signups |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your deployed site URL (for auth redirects) |
| `NEXT_PUBLIC_APP_MODE` | No | `testnet` (default) or `mainnet` |
| `NEXT_PUBLIC_ARC_RPC_URL` | No | Arc RPC endpoint (testnet default pre-configured) |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | No | Arc chain ID (5042002 for testnet) |
| `NEXT_PUBLIC_ARC_EXPLORER_URL` | No | Arc block explorer URL |
| `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED` | No | `true` to show Google sign-in button |
| `NEXT_PUBLIC_AUTH_APPLE_ENABLED` | No | `true` to show Apple sign-in button |
| `NEXT_PUBLIC_AUTH_X_ENABLED` | No | `true` to show X sign-in button |

Contract address variables (leave blank until deployed):

- `NEXT_PUBLIC_TESTNET_ESCROW_FACTORY_ADDRESS`
- `NEXT_PUBLIC_TESTNET_ESCROW_IMPLEMENTATION_ADDRESS`
- `NEXT_PUBLIC_TESTNET_ESCROW_RELEASE_MODULE_ADDRESS`
- `NEXT_PUBLIC_ARC_TESTNET_GATEWAY_ADDRESS`
- `NEXT_PUBLIC_ARC_TESTNET_CCTP_TOKEN_MESSENGER`
- `NEXT_PUBLIC_ARC_TESTNET_CCTP_MESSAGE_TRANSMITTER`

## Database setup

Run `supabase/schema.sql` in your Supabase SQL editor. This creates all tables with row-level security policies.

## Arc testnet config

Pre-configured defaults:

- RPC: `https://rpc.testnet.arc.network`
- Chain ID: `5042002`
- Explorer: `https://testnet.arcscan.app`
- Gas token: `USDC`

## App structure

```
app/
  page.tsx              Landing page
  auth/                 Sign in and sign up
  app/                  Workspace (auth-gated)
    page.tsx            Overview dashboard
    invoices/           Invoice list, create, detail, edit
    escrows/            Escrow state and release controls
    payouts/            Payout splits and routing
    arc/                Arc finance layer
    analytics/          Revenue analytics
    ledger/             Settlement ledger
    clients/            Client records
    team/               Workspace roles
    settings/           Workspace preferences
    ...

components/             Reusable UI components
lib/                    Utilities, types, Supabase helpers
supabase/               Database schema
public/brand/           Logo assets and OG images
```

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Add all environment variables from `.env.example`
4. Deploy

The build requires Google Fonts access during build. Vercel handles this automatically.

## Typecheck

```bash
npm run typecheck
```


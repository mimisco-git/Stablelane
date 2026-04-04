# Stablelane Next.js starter

This is the first working repo starter for Stablelane.

It includes:
- premium landing page
- app shell preview
- overview dashboard
- invoices pages
- escrow pages
- payouts page
- settings page

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- App Router

## Quick start

1. Install dependencies

```bash
npm install
```

2. Copy environment variables

```bash
cp .env.example .env.local
```

3. Start the dev server

```bash
npm run dev
```

4. Open

```text
http://localhost:3000
```

## Testing email
For now, set `NEXT_PUBLIC_WAITLIST_EMAIL` to your personal email while testing.

## Current status
This starter is UI-first and static.

Next implementation stages:
1. Auth and workspace setup
2. Invoice create form
3. Supabase data model
4. Arc testnet escrow contracts
5. Payout routing logic
6. Ledger syncing

## Arc testnet config
The starter is pre-configured for:
- RPC: https://rpc.testnet.arc.network
- Chain ID: 5042002
- Explorer: https://testnet.arcscan.app
- Gas token: USDC

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


## Homepage update package
This package includes an upgraded `app/page.tsx` for the premium Stablelane homepage inside the existing Next.js starter.


## Next stage package
This package upgrades the internal app screens so you can keep pushing and testing:
- richer overview dashboard
- invoices list with summary cards
- create invoice screen
- stronger invoice detail
- stronger escrow detail
- richer payouts and settings screens


## Humanized homepage update
This package removes the visible em dash style treatments from the homepage labels, replaces the metadata title em dash, and tightens the landing page copy so it feels more natural and less templated.


## Stage 3 package
This stage adds the first real interactivity without needing a backend:
- local draft invoice builder
- dynamic milestones and payout members
- local browser draft saving
- invoices page that loads local drafts together with seeded demo data
- overview notice showing saved draft count


## Stage 3 fix
This package fixes the client component directive on the interactive stage 3 files so the Next.js build can complete.


## Stage 4 package
This stage adds the first Supabase-backed foundation:
- email sign in and sign up page
- Supabase client helper
- SQL schema for invoice drafts with row level security
- invoice builder saves to Supabase when signed in
- invoices page loads Supabase draft records and local fallback drafts
- auth banner across app screens


## Stage 5 package
This stage moves Stablelane further out of demo mode:
- real workspace profile creation in Supabase
- real clients page and client records in Supabase
- live workspace note on overview
- settings page that saves workspace defaults
- updated Supabase schema for workspace_profiles and clients


## Stage 5 fix
This package fixes the missing `@/lib/supabase-browser` module and aligns invoice draft queries with the real `owner_id` column from the Supabase schema.


## Stage 6 package
This stage upgrades the real-app feel even more:
- fixes email confirmation redirect flow with a dedicated auth callback page
- adds `NEXT_PUBLIC_SITE_URL` support for production redirects
- lets invoice creation reuse saved clients from Supabase
- makes the create-invoice flow feel faster and more connected to real workspace data

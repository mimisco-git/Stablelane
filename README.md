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


## Stage 7 package
This stage pushes Stablelane closer to a real operating product:
- workspace profile lookup fixed to the real `user_id` column
- dashboard notice is now more database-driven
- invoice drafts can store linked client and workspace metadata
- invoice detail can load the actual saved record by ID from Supabase or browser storage
- invoice list uses clearer source labels: browser, workspace, and sample
- schema includes `client_id` and `workspace_name` on `invoice_drafts`


## Stage 7 fix
This package fixes the TypeScript source-label comparison in `components/invoices-board.tsx` so Vercel can complete the build.


## Stage 8 package
This stage adds the first real draft editing flow:
- saved invoice drafts now open a real detail page
- invoice detail links to a dedicated edit page
- invoice builder supports loading and updating existing drafts
- overview metrics and recent invoices lean more on workspace data instead of static placeholders


## Stage 8 fix
This package fixes the missing `recentInvoices` reference on the overview page and replaces it with a real `RecentInvoicesLive` component.


## Stage 8 fix 2
This package fixes the `dashboard-live-stats` TypeScript state shape so it matches the data returned from `fetchDashboardStatsDetailed()`.


## Stage 9 package
This stage adds more real product control:
- delete invoice drafts from workspace records or browser drafts
- delete client records from the Clients page
- updated Supabase policy for deleting clients


## Stage 10 branding update
This package adds a premium Stablelane branding layer:
- vector brand mark for the app
- full lockup logo asset
- 4K PNG exports for social and marketing use
- favicon, Apple touch icon, and Open Graph image
- logo component wired into the Next.js app


## Stage 11 package
This package rolls several product and brand upgrades together:
- wallet connect and Arc testnet network state
- mobile navigation polish
- contract-ready escrow workbench with timeline and explorer links
- cleaner loading and empty states
- branded share preview gallery on the homepage
- new social preview images for dashboard and escrow updates


## Stage 12 package
This stage introduces the premium environment layer:
- environment switcher for testnet and mainnet
- guarded mainnet mode with config-aware write protection
- wallet panel now follows the selected environment
- escrow center now respects environment guardrails
- settings page now exposes the environment switch as a first-class control
- `.env.example` now includes mainnet configuration placeholders


## Stage 13 package
This stage moves Stablelane into more real product behavior:
- fully database-driven dashboard cards
- real invoice status transitions saved back to Supabase
- first true wallet-driven escrow transaction wiring
- invoice detail now shows escrow metadata and transaction hashes
- schema adds escrow fields directly to `invoice_drafts`


## Stage 14 package
This stage focuses on the next real product layer:
- stronger client-linked invoice creation with auto-linking by saved client email
- a dedicated analytics page driven by real workspace data
- a clearer escrow contract path panel with environment-specific address readiness
- settings now expose contract placeholders for the next escrow integration step
- `.env.example` now includes escrow contract address placeholders for testnet and mainnet


## Stage 15 package
This stage adds the next layer of real product behavior:
- remote invoice edit history saved to Supabase
- stricter client-scoped invoice filtering on the invoices page
- contract-address-aware escrow writes that respect configured factory, implementation, and release module addresses
- invoice detail now shows the remote history timeline for workspace records


## Stage 15 final fix
This package includes the Stage 15 feature set plus fixes for:
- settings page JSX nesting
- recent invoices empty-state action syntax
- TypeScript validation passing after those fixes


## Stage 15 fix v2
This package fixes the TypeScript currency mismatch in `components/invoices-board.tsx` for sample rows, so Vercel can complete the build.


## Stage 15 fix v3
This package restores the missing `fetchInvoiceStatusSummary` export required by `components/live-dashboard-cards.tsx`.


## Stage 15 fix v4
This package fixes the conflicting `window.ethereum` type declaration by removing the duplicate global augmentation from `wallet-connect-panel.tsx` and using a local provider getter instead.


## Stage 16 package
This stage makes Stablelane more relevant to Arc Testnet:
- a dedicated Arc finance workspace page
- stablecoin asset registry for native USDC, USDC ERC-20, and EURC
- Arc amount guide for 18-decimal native USDC vs 6-decimal ERC-20 handling
- finality-aware confirmation guidance for faster settlement UX
- stronger testnet-first messaging while mainnet stays marked as coming soon

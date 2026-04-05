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


## Stage 17 package
This stage pushes Stablelane deeper into Arc testnet operations:
- Arc-native balance reader for wallet-funded USDC display
- funding lane manager for wallet, Gateway, and crosschain settlement routes
- crosschain readiness panel for Arc testnet Gateway and CCTP environment values
- stronger Arc workspace page with balance, finality, and funding-lane guidance


## Stage 18 package
This stage starts the next Arc-native funding layer:
- Gateway deposit workbench
- settlement route planner
- GatewayMinter support in the Arc funding registry
- stronger Arc page structure for wallet, Gateway, and crosschain settlement thinking


## Stage 19 package
This stage pushes Arc relevance further:
- real Gateway-triggered deposit action using ERC-20 stablecoin transfer calls
- real token funding path into escrow on Arc testnet
- stronger crosschain settlement execution desk with stored execution intents
- richer Arc workspace flow for wallet, Gateway, escrow, and crosschain operations


## Stage 20 package
This stage makes the Arc workflow feel more operational:
- live activity feed page for deposits, escrow funding, releases, and crosschain execution
- settlement receipts panel on invoice detail
- stronger crosschain execution runner with stored intents and progress states
- Gateway, escrow, and release actions now write into the activity feed


## Stage 21 package
This stage pushes Stablelane toward a more operational premium product:
- branded invoice and settlement receipt export center on invoice detail
- print-ready HTML exports for browser PDF workflow
- dedicated Team workspace page
- local workspace-role preview for Owner, Admin, Operator, and Viewer
- dashboard navigation now includes Team


## Stage 22 package
This stage pushes Stablelane toward a more complete operational workspace:
- database-backed workspace roles via Supabase
- approval-based release workflow on invoice detail
- release approval requests and decision queue
- team page now reads and writes real workspace members instead of only local preview data


## Stage 22 fix v2
This package fixes the TypeScript union issue in `components/crosschain-execution-desk.tsx` by explicitly typing the mapped execution-intent arrays.


## Stage 23 package
This stage makes Stablelane feel more like a real approval-led operations product:
- acting-role preview for Owner, Admin, Operator, and Viewer
- workspace-level approvals page
- approval operations dashboard
- stronger release-finalization guard so all approvals must be approved before release completes
- role-aware action gating for approval and release workflow in the UI


## Stage 23 fix v2
This package fixes the missing approval-op files and exports:
- adds `components/acting-role-switcher.tsx`
- restores `fetchApprovalOverview`
- restores `fetchInvoiceApprovalGate`


## Stage 24 package
This stage adds a more premium operational command center:
- new Ops page at `/app/ops`
- operational readiness score
- blocker tracking
- recent Arc activity summary
- role, approvals, contracts, gateway, and team checks in one workspace console


## Stage 25 package
This stage fixes the access-flow friction:
- new `/start` entry page with three paths: email, wallet, or preview
- `Open app` now routes to the access-options page instead of dropping users straight into the workspace
- wallet connection is treated as optional and separate from email sign-in
- dashboard now shows an access-mode banner so users know email and wallet can be added independently
- auth page copy now explains that email-first and wallet-later is fully supported


## Stage 26 package
This stage upgrades the login experience into a more fintech-style access flow:
- premium auth screen redesign
- password and magic-link methods
- active-session continue card
- stronger email-first, wallet-later messaging
- wider and cleaner auth layout
- polished callback flow wording


## Stage 27 package
This stage upgrades collaboration and review flow:
- database-backed workspace invitations
- dedicated `/app/invitations` page
- new `/app/inbox` page for approvals, invitations, and recent operational signals
- improved team onboarding path before someone becomes a permanent workspace member


## Stage 28 package
This stage upgrades operational control and alerting:
- new `/app/releases` page for release orchestration
- new `/app/notifications` page for approvals, invitations, and operational alerts
- release command view for ready, blocked, funded, and completed invoice states
- notification center with mark-read behavior for a more polished fintech workspace feel


## Stage 29 package
This stage moves Stablelane toward a more real multi-user workspace:
- invitation acceptance flow at `/accept-invite`
- accepting an invitation creates a real workspace member record
- approver-specific inbox at `/app/my-approvals`
- schema policies now allow invited users and assigned approvers to read or update records by signed-in email


## Stage 30 package
This stage makes Stablelane more real in day-to-day access control:
- new `/app/access` page for real membership and invitation-aware access resolution
- workflow panels now prefer database-backed role resolution before falling back to preview roles
- approver inbox now shows resolved role and access source
- acting-role preview is kept as fallback, not as the primary control model


## Stage 30 fix v2
This package fixes the Next.js prerender error on `/accept-invite` by wrapping the `useSearchParams()` consumer in a `Suspense` boundary.


## Stage 31 package
This stage adds more real, database-backed workspace infrastructure:
- new `workspace_audit_events` table
- new `notification_preferences` table
- database-backed audit trail at `/app/audit`
- database-backed notification preferences at `/app/preferences`
- key actions now write audit events into Supabase, not only local activity storage


## Stage 32 package
This stage adds more real financial operations infrastructure:
- new `settlement_ledger` table
- new `/app/ledger` page for database-backed settlement entries
- new `/app/transactions` page for onchain receipt monitoring using saved tx hashes
- gateway, funding, and release actions now also write ledger entries into Supabase


## Stage 33 package
This stage replaces the separated access feel with a smarter unified web3-style login:
- email and password on the main auth screen
- magic link on the same screen
- wallet buttons on the same screen
- Google, Apple, and X buttons on the same screen
- `Open app` now routes directly to `/auth`
- overall auth page upgraded to feel more premium and web3-native


## Stage 34 package
This stage hardens access so the auth surface behaves more truthfully:
- new `lib/auth-options.ts` helper for enabled social providers and detected wallets
- unified auth page now hides providers that are not truly enabled or detected
- new `/app/account` page for active methods and wallet management
- workspace layout now uses a real access gate instead of leaving the app fully open by default
- added Account entry to dashboard navigation


## Stage 35 package
This stage starts making identity linkage more real:
- new linked identity fields on `workspace_profiles`
- new `/app/identity` page
- wallet hint can now be saved into the workspace profile as a linked wallet
- auth methods begin to be recorded on the workspace profile
- identity linking actions now write audit events


## Stage 36 package
This stage makes wallet access more real:
- adds `viem` dependency
- adds signed wallet challenge endpoints under `/api/wallet-auth/*`
- unified auth page now uses server-verified wallet access instead of plain connect-only flow
- workspace gate now prefers verified wallet session over plain wallet hints
- identity center can link the verified wallet into the workspace profile
- linked wallet verification time is now stored on `workspace_profiles`


## Stage 37 package
This stage focuses on production-readiness for auth and launch flow:
- new `lib/auth-intent.ts` helper for pending method and post-login destination recovery
- unified auth now remembers the intended destination and returns users there after success
- callback page now finalizes linked auth methods after session creation, which is more reliable for magic-link and OAuth flows
- workspace gate now treats preview access as an explicit state instead of silently allowing access
- new `/app/readiness` page for launch-oriented checks
- `.env.example` now includes site URL and social-provider visibility flags
- account methods page was cleaned up and fixed

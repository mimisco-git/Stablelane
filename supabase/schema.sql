-- Stablelane stage 4 schema
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.invoice_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled invoice',
  client_name text not null default 'Unnamed client',
  client_email text not null default '',
  amount numeric(18,2),
  currency text not null default 'USDC',
  payment_mode text not null default 'Milestone escrow',
  due_date date,
  reference text,
  description text,
  milestones jsonb not null default '[]'::jsonb,
  splits jsonb not null default '[]'::jsonb,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoice_drafts enable row level security;

drop policy if exists "Users can view their own invoice drafts" on public.invoice_drafts;
create policy "Users can view their own invoice drafts"
on public.invoice_drafts
for select
using (auth.uid() = owner_id);

drop policy if exists "Users can insert their own invoice drafts" on public.invoice_drafts;
create policy "Users can insert their own invoice drafts"
on public.invoice_drafts
for insert
with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own invoice drafts" on public.invoice_drafts;
create policy "Users can update their own invoice drafts"
on public.invoice_drafts
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own invoice drafts" on public.invoice_drafts;
create policy "Users can delete their own invoice drafts"
on public.invoice_drafts
for delete
using (auth.uid() = owner_id);

create or replace function public.set_invoice_drafts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_invoice_drafts_updated_at on public.invoice_drafts;
create trigger trg_invoice_drafts_updated_at
before update on public.invoice_drafts
for each row
execute function public.set_invoice_drafts_updated_at();


create table if not exists public.workspace_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_name text not null,
  role_type text not null default 'Freelancer',
  default_currency text not null default 'USDC',
  wallet_address text,
  created_at timestamptz not null default now()
);

alter table public.workspace_profiles enable row level security;

drop policy if exists "workspace_profiles_select_own" on public.workspace_profiles;
create policy "workspace_profiles_select_own"
on public.workspace_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "workspace_profiles_insert_own" on public.workspace_profiles;
create policy "workspace_profiles_insert_own"
on public.workspace_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "workspace_profiles_update_own" on public.workspace_profiles;
create policy "workspace_profiles_update_own"
on public.workspace_profiles
for update
to authenticated
using (auth.uid() = user_id);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_name text not null,
  client_name text not null,
  client_email text not null,
  client_wallet text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

drop policy if exists "clients_select_authenticated" on public.clients;
create policy "clients_select_authenticated"
on public.clients
for select
to authenticated
using (true);

drop policy if exists "clients_insert_authenticated" on public.clients;
create policy "clients_insert_authenticated"
on public.clients
for insert
to authenticated
with check (true);


alter table public.invoice_drafts
  add column if not exists client_id uuid,
  add column if not exists workspace_name text;

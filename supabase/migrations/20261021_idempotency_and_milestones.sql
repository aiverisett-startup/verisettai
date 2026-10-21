-- Migration: Idempotency Keys and Cryptographic Milestones
-- Date: 2026-10-21
-- Purpose: Protect escrow routes from duplicate clearance loops and enforce SHA-256 deliverable verification

-- 1. Idempotency Keys Table
create table if not exists public.idempotency_keys (
  key text primary key,
  response_body jsonb not null,
  status_code integer default 200,
  endpoint text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for idempotency_keys
alter table public.idempotency_keys enable row level security;

-- Drop existing policies if any to avoid 42710 policy already exists errors
drop policy if exists "Allow read on idempotency_keys" on public.idempotency_keys;
drop policy if exists "Allow insert on idempotency_keys" on public.idempotency_keys;
drop policy if exists "Allow update on idempotency_keys" on public.idempotency_keys;

-- Allow authenticated and service-role / anon access for idempotency lookups
create policy "Allow read on idempotency_keys"
  on public.idempotency_keys for select
  using (true);

create policy "Allow insert on idempotency_keys"
  on public.idempotency_keys for insert
  with check (true);

create policy "Allow update on idempotency_keys"
  on public.idempotency_keys for update
  using (true);

-- 2. Milestones Table for Cryptographic Deliverable Verification
create table if not exists public.milestones (
  id uuid default gen_random_uuid() primary key,
  contract_id text not null,
  title text not null,
  amount numeric not null default 0,
  currency text default 'VRS',
  payer_agent text,
  payee_agent text,
  deliverable_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'verified', 'completed', 'disputed')),
  deliverable_payload jsonb,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for fast agent verification lookups
create index if not exists idx_milestones_contract_id on public.milestones (contract_id);
create index if not exists idx_milestones_deliverable_hash on public.milestones (deliverable_hash);
create index if not exists idx_idempotency_created_at on public.idempotency_keys (created_at);

-- Enable RLS for milestones
alter table public.milestones enable row level security;

-- Drop existing policies if any to avoid 42710 policy already exists errors
drop policy if exists "Allow read on milestones" on public.milestones;
drop policy if exists "Allow insert on milestones" on public.milestones;
drop policy if exists "Allow update on milestones" on public.milestones;

-- Milestone policies
create policy "Allow read on milestones"
  on public.milestones for select
  using (true);

create policy "Allow insert on milestones"
  on public.milestones for insert
  with check (true);

create policy "Allow update on milestones"
  on public.milestones for update
  using (true);

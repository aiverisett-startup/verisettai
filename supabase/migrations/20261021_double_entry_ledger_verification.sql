-- Migration: Double-Entry Ledger and Verification RPC
-- Date: 2026-10-21
-- Purpose: Atomic double-entry financial ledger entries and balance verification for escrow clearance

-- 1. Double-Entry Financial Ledger Table
create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  vault_id uuid,
  escrow_id text,
  transaction_id uuid not null default gen_random_uuid(),
  entry_type text not null check (entry_type in ('DEBIT', 'CREDIT')),
  amount bigint not null check (amount > 0),
  currency text not null default 'INR',
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist if ledger_entries table was created by an earlier schema version
alter table public.ledger_entries add column if not exists escrow_id text;
alter table public.ledger_entries add column if not exists vault_id uuid;
alter table public.ledger_entries add column if not exists transaction_id uuid default gen_random_uuid();
alter table public.ledger_entries add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Indexing for high-speed ledger audits and verification
create index if not exists idx_ledger_escrow_id on public.ledger_entries(escrow_id);
create index if not exists idx_ledger_vault_id on public.ledger_entries(vault_id);
create index if not exists idx_ledger_transaction_id on public.ledger_entries(transaction_id);
create index if not exists idx_ledger_created_at on public.ledger_entries(created_at desc);

-- Enable RLS
alter table public.ledger_entries enable row level security;

-- Drop existing policies if any to prevent 42710
drop policy if exists "Allow read on ledger_entries" on public.ledger_entries;
create policy "Allow read on ledger_entries"
  on public.ledger_entries for select
  using (true);

drop policy if exists "Allow insert on ledger_entries" on public.ledger_entries;
create policy "Allow insert on ledger_entries"
  on public.ledger_entries for insert
  with check (true);

-- 2. Verification RPC: verify_ledger_balance(escrow_id)
-- Verifies that the sum of DEBIT entries strictly matches the sum of CREDIT entries
create or replace function public.verify_ledger_balance(escrow_id text)
returns boolean as $$
declare
  v_debit_sum bigint;
  v_credit_sum bigint;
  v_uuid uuid;
begin
  -- Calculate sum of DEBIT and CREDIT for this escrow
  select 
    coalesce(sum(case when entry_type = 'DEBIT' then amount else 0 end), 0),
    coalesce(sum(case when entry_type = 'CREDIT' then amount else 0 end), 0)
  into v_debit_sum, v_credit_sum
  from public.ledger_entries
  where escrow_id = $1;

  -- If no entries found by text escrow_id, check if it matches vault_id or transaction_id
  if v_debit_sum = 0 and v_credit_sum = 0 then
    begin
      v_uuid := $1::uuid;
      select 
        coalesce(sum(case when entry_type = 'DEBIT' then amount else 0 end), 0),
        coalesce(sum(case when entry_type = 'CREDIT' then amount else 0 end), 0)
      into v_debit_sum, v_credit_sum
      from public.ledger_entries
      where vault_id = v_uuid or transaction_id = v_uuid;
    exception when others then
      -- Not a valid UUID
      null;
    end;
  end if;

  -- Atomic verification: Debits must equal Credits and sum must be strictly positive
  if v_debit_sum > 0 and v_debit_sum = v_credit_sum then
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer;

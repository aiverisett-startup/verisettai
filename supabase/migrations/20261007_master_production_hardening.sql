-- ==============================================================================
-- Verisett AI: Master Production Hardening Migration & Level 9 Security Schema
-- Migration: 20261007_master_production_hardening.sql
-- Description:
--   1. Enforces strict multi-tenant Row Level Security (RLS) on vaults, agents,
--      settlements, transactions, and api_keys.
--   2. Purges orphaned test records.
--   3. Creates an append-only, immutable double-entry financial ledger (ledger_entries)
--      with database-level mutation prevention trigger and balance aggregation.
--   4. Creates the vault_state enum and settle_vault_atomic anti-race stored procedure.
--   5. Implements the database idempotency engine (idempotency_keys).
--   6. Configures Supabase Realtime publication for vaults, settlements, agents.
-- ==============================================================================

-- Enable required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Base Tables Definition & Multi-Tenant User Isolation
-- ==============================================================================

-- Vaults Table
CREATE TABLE IF NOT EXISTS public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL DEFAULT 'Primary Autonomous Settlement Vault',
  balance NUMERIC NOT NULL DEFAULT 1690.00,
  balance_cents BIGINT NOT NULL DEFAULT 169000,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'Active Custody',
  is_test BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agents Table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  framework TEXT NOT NULL DEFAULT 'FastMCP',
  ping_latency_ms INT DEFAULT 24,
  status TEXT NOT NULL DEFAULT 'Active',
  is_test BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settlements Table
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  vault_id UUID REFERENCES public.vaults(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  fee NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SETTLED',
  job_title TEXT DEFAULT 'Autonomous Agent Escrow Settlement',
  proof TEXT,
  is_test BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  vault_id UUID REFERENCES public.vaults(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'DEPOSIT',
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'SUCCESSFUL',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  key_hash TEXT NOT NULL,
  key_hint TEXT NOT NULL,
  prefix TEXT NOT NULL DEFAULT 'vst_live_',
  name TEXT DEFAULT 'FastMCP Primary Key',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

-- Profiles Table (for Plan & Founder Pass status)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  founder_pass BOOLEAN DEFAULT false,
  plan_tier TEXT DEFAULT 'PRO',
  take_rate NUMERIC DEFAULT 0.012,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure user_id column exists on all target tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vaults' AND column_name = 'user_id') THEN
    ALTER TABLE public.vaults ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'user_id') THEN
    ALTER TABLE public.agents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'settlements' AND column_name = 'user_id') THEN
    ALTER TABLE public.settlements ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'user_id') THEN
    ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'user_id') THEN
    ALTER TABLE public.api_keys ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;
END $$;

-- Multi-Tenant Indexes
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON public.vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_user_id ON public.settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);

-- Enable RLS on core tables
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "vaults_owner_isolation" ON public.vaults;
DROP POLICY IF EXISTS "agents_owner_isolation" ON public.agents;
DROP POLICY IF EXISTS "settlements_owner_isolation" ON public.settlements;
DROP POLICY IF EXISTS "transactions_owner_isolation" ON public.transactions;
DROP POLICY IF EXISTS "api_keys_owner_isolation" ON public.api_keys;
DROP POLICY IF EXISTS "profiles_owner_isolation" ON public.profiles;

-- Create owner isolation CRUD policies
CREATE POLICY "vaults_owner_isolation"
  ON public.vaults FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_owner_isolation"
  ON public.agents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settlements_owner_isolation"
  ON public.settlements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_owner_isolation"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_owner_isolation"
  ON public.api_keys FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_owner_isolation"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Purge orphan test records and dummy data
DELETE FROM public.settlements WHERE user_id IS NULL OR is_test = true;
DELETE FROM public.vaults WHERE user_id IS NULL OR is_test = true;
DELETE FROM public.agents WHERE user_id IS NULL OR is_test = true;

-- ==============================================================================
-- 2. Append-Only Double-Entry Financial Ledger
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_id UUID REFERENCES public.vaults(id) ON DELETE SET NULL,
  transaction_id UUID NOT NULL,
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
  amount BIGINT NOT NULL CHECK (amount > 0), -- Smallest unit (paise / cents)
  currency VARCHAR(5) NOT NULL DEFAULT 'INR',
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_user ON public.ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_vault ON public.ledger_entries(vault_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tx ON public.ledger_entries(transaction_id);

-- Enforce strict immutability (UPDATE and DELETE prohibited)
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Financial ledger entries are strictly immutable (UPDATE and DELETE prohibited)';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_immutable_ledger ON public.ledger_entries;
CREATE TRIGGER trigger_immutable_ledger
BEFORE UPDATE OR DELETE ON public.ledger_entries
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- Ledger RLS isolation
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ledger_entries_owner_isolation" ON public.ledger_entries;
CREATE POLICY "ledger_entries_owner_isolation"
  ON public.ledger_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SQL Function: get_verified_balance
CREATE OR REPLACE FUNCTION get_verified_balance(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_balance BIGINT;
BEGIN
  SELECT COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE -amount END), 0)
  INTO v_balance
  FROM public.ledger_entries
  WHERE user_id = p_user_id;

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. Atomic Settlement State Machine & Anti-Race Locks
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vault_state') THEN
    CREATE TYPE vault_state AS ENUM (
      'CREATED',
      'FUNDED',
      'WORKING',
      'PROOF_SUBMITTED',
      'VERIFIED',
      'SETTLED',
      'DISPUTED',
      'REFUNDED',
      'EXPIRED'
    );
  END IF;
END $$;

-- Add state column to vaults if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vaults' AND column_name = 'state') THEN
    ALTER TABLE public.vaults ADD COLUMN state vault_state DEFAULT 'FUNDED'::vault_state;
  END IF;
END $$;

-- Stored Procedure: settle_vault_atomic
CREATE OR REPLACE FUNCTION settle_vault_atomic(p_vault_id UUID, p_user_id UUID, p_amount BIGINT)
RETURNS JSONB AS $$
DECLARE
  v_vault RECORD;
  v_tx_id UUID := gen_random_uuid();
BEGIN
  -- 1. Anti-race condition lock: SELECT ... FOR UPDATE
  SELECT * INTO v_vault
  FROM public.vaults
  WHERE id = p_vault_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vault % not found or unauthorized for user %', p_vault_id, p_user_id;
  END IF;

  -- 2. State machine invariant check: If already SETTLED, abort immediately
  IF v_vault.status = 'SETTLED' OR v_vault.state = 'SETTLED'::vault_state THEN
    RAISE EXCEPTION 'Invariant violation: Vault % is already SETTLED', p_vault_id;
  END IF;

  -- 3. Insert balanced credit/debit records into double-entry ledger_entries
  -- Credit: Settlement payout
  INSERT INTO public.ledger_entries (user_id, vault_id, transaction_id, entry_type, amount, currency, description)
  VALUES (p_user_id, p_vault_id, v_tx_id, 'CREDIT', p_amount, 'INR', 'Autonomous Agent Escrow Consensus Settlement');

  -- Debit: Escrow release from locked allocation
  INSERT INTO public.ledger_entries (user_id, vault_id, transaction_id, entry_type, amount, currency, description)
  VALUES (p_user_id, p_vault_id, v_tx_id, 'DEBIT', p_amount, 'INR', 'Escrow Vault Fund Release Execution');

  -- 4. Update vault status & state atomically
  UPDATE public.vaults
  SET status = 'SETTLED',
      state = 'SETTLED'::vault_state,
      updated_at = now()
  WHERE id = p_vault_id AND user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'vault_id', p_vault_id,
    'transaction_id', v_tx_id,
    'amount', p_amount,
    'status', 'SETTLED'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. Database Idempotency Engine
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL,
  request_hash VARCHAR(64) NOT NULL,
  response_status INT NOT NULL,
  response_body JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_idempotency_key UNIQUE (user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_user_key ON public.idempotency_keys(user_id, key);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "idempotency_keys_owner_isolation" ON public.idempotency_keys;
CREATE POLICY "idempotency_keys_owner_isolation"
  ON public.idempotency_keys FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 5. Realtime Publication Setup
-- ==============================================================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE vaults, settlements, agents;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_object THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE vaults, settlements, agents;
END $$;

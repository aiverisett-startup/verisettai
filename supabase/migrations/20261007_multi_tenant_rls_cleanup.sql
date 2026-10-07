-- ==============================================================================
-- Verisett AI: Multi-Tenant Row Level Security (RLS) Isolation & Purge Migration
-- Migration: 20261007_multi_tenant_rls_cleanup.sql
-- Description: Enforces strict tenant isolation on vaults, agents, settlements,
--              transactions, and api_keys; purges legacy test records; and
--              registers tables in the Supabase Realtime publication.
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Table Definitions (Guaranteed to exist with user_id)
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

-- ==============================================================================
-- 2. Ensure user_id Column & Index on Every Target Table
-- ==============================================================================

DO $$
BEGIN
  -- vaults
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vaults' AND column_name = 'user_id') THEN
    ALTER TABLE public.vaults ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;

  -- agents
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'user_id') THEN
    ALTER TABLE public.agents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;

  -- settlements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'settlements' AND column_name = 'user_id') THEN
    ALTER TABLE public.settlements ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;

  -- transactions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'user_id') THEN
    ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;

  -- api_keys
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'api_keys' AND column_name = 'user_id') THEN
    ALTER TABLE public.api_keys ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;
END $$;

-- Indexes for lightning-fast multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON public.vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_settlements_user_id ON public.settlements(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);

-- ==============================================================================
-- 3. Enable Row Level Security (RLS) & Apply Strict Isolation Policies
-- ==============================================================================

-- Enable RLS on all target tables
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

-- Create owner isolation policies: users can ONLY CRUD their own rows
CREATE POLICY "vaults_owner_isolation"
  ON public.vaults
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_owner_isolation"
  ON public.agents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settlements_owner_isolation"
  ON public.settlements
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_owner_isolation"
  ON public.transactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_owner_isolation"
  ON public.api_keys
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_owner_isolation"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 4. Cleanup & Purge Legacy / Orphaned Test Records
-- ==============================================================================

DELETE FROM public.settlements WHERE user_id IS NULL OR is_test = true;
DELETE FROM public.vaults WHERE user_id IS NULL OR is_test = true;
DELETE FROM public.agents WHERE user_id IS NULL OR is_test = true;

-- ==============================================================================
-- 5. Realtime Publication Setup
-- ==============================================================================

DO $$
BEGIN
  -- Add vaults, settlements, agents to supabase_realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE vaults, settlements, agents;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Already present in publication
  WHEN undefined_object THEN
    -- In case supabase_realtime doesn't exist yet, create it
    CREATE PUBLICATION supabase_realtime FOR TABLE vaults, settlements, agents;
END $$;

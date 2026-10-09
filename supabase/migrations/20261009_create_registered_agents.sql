-- ==============================================================================
-- Verisett AI: Registered Agents Table & RLS Policy Migration
-- Migration: 20261009_create_registered_agents.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.registered_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  agent_name TEXT NOT NULL,
  framework TEXT NOT NULL DEFAULT 'fastmcp',
  spending_limit NUMERIC NOT NULL DEFAULT 0.00,
  webhook_url TEXT,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.registered_agents ENABLE ROW LEVEL SECURITY;

-- 1. SELECT policy: Users can only view their own registered agents
DROP POLICY IF EXISTS "Users can view own registered agents" ON public.registered_agents;
CREATE POLICY "Users can view own registered agents"
  ON public.registered_agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. INSERT policy: Users can only register agents for themselves
DROP POLICY IF EXISTS "Users can insert own registered agents" ON public.registered_agents;
CREATE POLICY "Users can insert own registered agents"
  ON public.registered_agents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE policy: Users can update their own registered agents
DROP POLICY IF EXISTS "Users can update own registered agents" ON public.registered_agents;
CREATE POLICY "Users can update own registered agents"
  ON public.registered_agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DELETE policy: Users can delete their own registered agents
DROP POLICY IF EXISTS "Users can delete own registered agents" ON public.registered_agents;
CREATE POLICY "Users can delete own registered agents"
  ON public.registered_agents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Service Role bypass
DROP POLICY IF EXISTS "Service role full access on registered_agents" ON public.registered_agents;
CREATE POLICY "Service role full access on registered_agents"
  ON public.registered_agents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for performant querying by user_id and lookup by api_key
CREATE INDEX IF NOT EXISTS idx_registered_agents_user_id ON public.registered_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_registered_agents_api_key ON public.registered_agents(api_key);

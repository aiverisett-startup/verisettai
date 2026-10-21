-- ==============================================================================
-- Verisett AI — Autonomous M2M Clearinghouse & Agent Identity Protocol
-- Database Schema & Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. AGENTS TABLE (Cryptographic Autonomous Agent Identities)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    public_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'pending')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast queries and identity lookups
CREATE INDEX IF NOT EXISTS idx_agents_owner_id ON public.agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_public_key ON public.agents(public_key);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON public.agents(created_at DESC);

-- ==============================================================================
-- 2. TRANSACTIONS TABLE (M2M Clearinghouse Settlement Ledger)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
    receiver_agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'M2M_TOKEN',
    status TEXT NOT NULL CHECK (status IN ('settled', 'queued', 'failed')) DEFAULT 'queued',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for sender/receiver queries and settlement status updates
CREATE INDEX IF NOT EXISTS idx_transactions_sender_agent_id ON public.transactions(sender_agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_agent_id ON public.transactions(receiver_agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Agents: Select policy (Owners can view their own agents)
DROP POLICY IF EXISTS "Owners can view their own agents" ON public.agents;
CREATE POLICY "Owners can view their own agents"
    ON public.agents
    FOR SELECT
    USING (auth.uid() = owner_id);

-- Agents: Insert policy (Owners can register new agents under their account)
DROP POLICY IF EXISTS "Owners can create their own agents" ON public.agents;
CREATE POLICY "Owners can create their own agents"
    ON public.agents
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Agents: Update policy (Owners can modify status/details of their own agents)
DROP POLICY IF EXISTS "Owners can update their own agents" ON public.agents;
CREATE POLICY "Owners can update their own agents"
    ON public.agents
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Agents: Delete policy (Owners can remove their own agents)
DROP POLICY IF EXISTS "Owners can delete their own agents" ON public.agents;
CREATE POLICY "Owners can delete their own agents"
    ON public.agents
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Agents: Service role full bypass for backend clearinghouse processes
DROP POLICY IF EXISTS "Service role full access on agents" ON public.agents;
CREATE POLICY "Service role full access on agents"
    ON public.agents
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');


-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions: Select policy (Owners can read transactions where their agent is sender OR receiver)
DROP POLICY IF EXISTS "Owners can view transactions for their agents" ON public.transactions;
CREATE POLICY "Owners can view transactions for their agents"
    ON public.transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE public.agents.id IN (public.transactions.sender_agent_id, public.transactions.receiver_agent_id)
              AND public.agents.owner_id = auth.uid()
        )
    );

-- Transactions: Insert policy (Owners can initiate transactions only from agents they own)
DROP POLICY IF EXISTS "Owners can create transactions from their agents" ON public.transactions;
CREATE POLICY "Owners can create transactions from their agents"
    ON public.transactions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE public.agents.id = public.transactions.sender_agent_id
              AND public.agents.owner_id = auth.uid()
        )
    );

-- Transactions: Update policy (Owners can update transactions involving their agents)
DROP POLICY IF EXISTS "Owners can update transactions for their agents" ON public.transactions;
CREATE POLICY "Owners can update transactions for their agents"
    ON public.transactions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE public.agents.id IN (public.transactions.sender_agent_id, public.transactions.receiver_agent_id)
              AND public.agents.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agents
            WHERE public.agents.id IN (public.transactions.sender_agent_id, public.transactions.receiver_agent_id)
              AND public.agents.owner_id = auth.uid()
        )
    );

-- Transactions: Service role full bypass for automated settlement workers
DROP POLICY IF EXISTS "Service role full access on transactions" ON public.transactions;
CREATE POLICY "Service role full access on transactions"
    ON public.transactions
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

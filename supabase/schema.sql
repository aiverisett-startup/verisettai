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

-- ==============================================================================
-- 4. FEEDBACK TABLE (Community Testimonials & Protocol Trust Wall)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role_title TEXT,
    company TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    category TEXT DEFAULT 'Protocol Feedback',
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_feedback_approved ON public.feedback(is_approved);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback(category);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved feedback" ON public.feedback;
CREATE POLICY "Public can read approved feedback"
    ON public.feedback
    FOR SELECT
    USING (is_approved = true);

DROP POLICY IF EXISTS "Public can submit feedback" ON public.feedback;
CREATE POLICY "Public can submit feedback"
    ON public.feedback
    FOR INSERT
    WITH CHECK (true);

-- ==============================================================================
-- 5. IDEMPOTENCY KEYS (Zero-Cost Repeated Settlement Loop Protection)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    key TEXT PRIMARY KEY,
    response_body JSONB NOT NULL,
    status_code INTEGER DEFAULT 200,
    endpoint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_idempotency_created_at ON public.idempotency_keys(created_at);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read on idempotency_keys" ON public.idempotency_keys;
CREATE POLICY "Allow read on idempotency_keys"
    ON public.idempotency_keys FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow insert on idempotency_keys" ON public.idempotency_keys;
CREATE POLICY "Allow insert on idempotency_keys"
    ON public.idempotency_keys FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on idempotency_keys" ON public.idempotency_keys;
CREATE POLICY "Allow update on idempotency_keys"
    ON public.idempotency_keys FOR UPDATE
    USING (true);

-- ==============================================================================
-- 6. MILESTONES (Cryptographic Deliverable Proof-of-Work Verification)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'VRS',
    payer_agent TEXT,
    payee_agent TEXT,
    deliverable_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'completed', 'disputed')),
    deliverable_payload JSONB,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_milestones_contract_id ON public.milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_milestones_deliverable_hash ON public.milestones(deliverable_hash);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read on milestones" ON public.milestones;
CREATE POLICY "Allow read on milestones"
    ON public.milestones FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow insert on milestones" ON public.milestones;
CREATE POLICY "Allow insert on milestones"
    ON public.milestones FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update on milestones" ON public.milestones;
CREATE POLICY "Allow update on milestones"
    ON public.milestones FOR UPDATE
    USING (true);

-- ==============================================================================
-- 7. DOUBLE-ENTRY FINANCIAL LEDGER & ATOMIC VERIFICATION RPC
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vault_id UUID,
    escrow_id TEXT,
    transaction_id UUID NOT NULL DEFAULT gen_random_uuid(),
    entry_type TEXT NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ledger_escrow_id ON public.ledger_entries(escrow_id);
CREATE INDEX IF NOT EXISTS idx_ledger_vault_id ON public.ledger_entries(vault_id);
CREATE INDEX IF NOT EXISTS idx_ledger_transaction_id ON public.ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON public.ledger_entries(created_at DESC);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read on ledger_entries" ON public.ledger_entries;
CREATE POLICY "Allow read on ledger_entries"
    ON public.ledger_entries FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow insert on ledger_entries" ON public.ledger_entries;
CREATE POLICY "Allow insert on ledger_entries"
    ON public.ledger_entries FOR INSERT
    WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.verify_ledger_balance(escrow_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_debit_sum BIGINT;
  v_credit_sum BIGINT;
  v_uuid UUID;
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0)
  INTO v_debit_sum, v_credit_sum
  FROM public.ledger_entries
  WHERE escrow_id = $1;

  IF v_debit_sum = 0 AND v_credit_sum = 0 THEN
    BEGIN
      v_uuid := $1::UUID;
      SELECT 
        COALESCE(SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END), 0)
      INTO v_debit_sum, v_credit_sum
      FROM public.ledger_entries
      WHERE vault_id = v_uuid OR transaction_id = v_uuid;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  IF v_debit_sum > 0 AND v_debit_sum = v_credit_sum THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




-- Migration: 20261009_create_ops_audit_logs.sql
-- Table to store 24/7 Gemini autonomous operations engine audit trail and idempotency records

CREATE TABLE IF NOT EXISTS public.ops_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  agent_id TEXT,
  tool_called TEXT NOT NULL,
  tool_parameters JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on idempotency_key for high-speed rate-limiting & loop-prevention lookups
CREATE INDEX IF NOT EXISTS idx_ops_audit_logs_idempotency 
  ON public.ops_audit_logs(idempotency_key);

-- Index on created_at for fast time-series telemetry lookups
CREATE INDEX IF NOT EXISTS idx_ops_audit_logs_created_at 
  ON public.ops_audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.ops_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on ops_audit_logs"
  ON public.ops_audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view logs
CREATE POLICY "Authenticated users can read ops_audit_logs"
  ON public.ops_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

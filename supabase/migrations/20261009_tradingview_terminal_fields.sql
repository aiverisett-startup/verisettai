-- ==============================================================================
-- Verisett AI: TradingView Terminal Fields Migration
-- Migration: 20261009_tradingview_terminal_fields.sql
-- ==============================================================================

ALTER TABLE public.registered_agents 
  ADD COLUMN IF NOT EXISTS agent_id_code TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Unlinked',
  ADD COLUMN IF NOT EXISTS throughput_tps NUMERIC DEFAULT 0;

ALTER TABLE public.agents 
  ADD COLUMN IF NOT EXISTS agent_id_code TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS throughput_tps NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_registered_agents_agent_id_code ON public.registered_agents(agent_id_code);

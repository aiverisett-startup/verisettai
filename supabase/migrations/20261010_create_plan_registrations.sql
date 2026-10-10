-- Migration: 20261010_create_plan_registrations.sql
-- Tiered plan registration and slot capacity tracking

CREATE TABLE IF NOT EXISTS public.plan_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name TEXT NOT NULL,
  email TEXT NOT NULL,
  agent_handle TEXT NOT NULL,
  plan_tier TEXT NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  reservation_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plan_tier_counters (
  plan_tier TEXT PRIMARY KEY,
  claimed_slots INTEGER NOT NULL DEFAULT 0,
  max_cap INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial tier capacity tracking
INSERT INTO public.plan_tier_counters (plan_tier, claimed_slots, max_cap)
VALUES 
  ('community', 3420, NULL),
  ('builder', 485, 800),
  ('pro', 342, 500),
  ('enterprise', 148, 200)
ON CONFLICT (plan_tier) DO NOTHING;

-- Index for email & plan lookups
CREATE INDEX IF NOT EXISTS idx_plan_registrations_email ON public.plan_registrations(email);
CREATE INDEX IF NOT EXISTS idx_plan_registrations_tier ON public.plan_registrations(plan_tier);

-- Enable RLS
ALTER TABLE public.plan_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_tier_counters ENABLE ROW LEVEL SECURITY;

-- Public can read counters
CREATE POLICY "Public read plan counters"
  ON public.plan_tier_counters
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can submit registration
CREATE POLICY "Public insert plan registration"
  ON public.plan_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

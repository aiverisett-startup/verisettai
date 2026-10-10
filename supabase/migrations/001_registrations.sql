-- Migration: 001_registrations.sql
-- Concurrency-Safe Tiered Registration & Plan-Capping System for Verisett AI
-- Enforces a strict, race-condition-proof cap of 1,500 total paid members across plans

-- 1. Create Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY, -- 'community', 'tier_1', 'tier_2', 'tier_3'
  name TEXT NOT NULL,
  price_inr NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  max_capacity INTEGER, -- e.g. 800 for tier_1, 500 for tier_2, 200 for tier_3, null for community
  claimed_count INTEGER NOT NULL DEFAULT 0
);

-- 2. Create Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL REFERENCES public.plans(id),
  org_name TEXT NOT NULL,
  email TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Seed Initial Plan Capacity Quotas
INSERT INTO public.plans (id, name, price_inr, is_paid, max_capacity, claimed_count)
VALUES
  ('community', 'Community Fleet', 0, false, NULL, 0),
  ('tier_1', 'Builder Node', 3999, true, 800, 0),
  ('tier_2', 'Protocol Pro', 15999, true, 500, 0),
  ('tier_3', 'Enterprise Settlement Node', 49999, true, 200, 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_inr = EXCLUDED.price_inr,
  is_paid = EXCLUDED.is_paid,
  max_capacity = EXCLUDED.max_capacity;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Public read access to plans capacity
DROP POLICY IF EXISTS "Public read plans" ON public.plans;
CREATE POLICY "Public read plans"
  ON public.plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read access to registrations
DROP POLICY IF EXISTS "Public read registrations" ON public.registrations;
CREATE POLICY "Public read registrations"
  ON public.registrations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Atomic PostgreSQL RPC Function with Row-Level Locking
CREATE OR REPLACE FUNCTION public.register_with_capacity_lock(
  p_plan_id TEXT,
  p_org_name TEXT,
  p_email TEXT,
  p_agent_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan public.plans%ROWTYPE;
  v_total_paid INTEGER;
  v_reg_id UUID;
  v_new_claimed INTEGER;
  v_new_total_paid INTEGER;
BEGIN
  -- Input Validation
  IF p_org_name IS NULL OR TRIM(p_org_name) = '' THEN
    RAISE EXCEPTION 'INVALID_DATA: Organization or developer name is required';
  END IF;

  IF p_email IS NULL OR p_email NOT LIKE '%@%' THEN
    RAISE EXCEPTION 'INVALID_DATA: A valid email address is required';
  END IF;

  IF p_agent_id IS NULL OR TRIM(p_agent_id) = '' THEN
    RAISE EXCEPTION 'INVALID_DATA: Agent ID or node handle is required';
  END IF;

  -- 1. Lock the target plan row during transaction execution to prevent double-booking
  SELECT *
  INTO v_plan
  FROM public.plans
  WHERE id = p_plan_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_DATA: Selected plan does not exist';
  END IF;

  -- 2. Quota & Capacity Verification
  IF v_plan.is_paid THEN
    -- Check total paid capacity pool across ALL paid plans (strictly capped at 1,500)
    SELECT COALESCE(SUM(claimed_count), 0)
    INTO v_total_paid
    FROM public.plans
    WHERE is_paid = true;

    IF v_total_paid >= 1500 THEN
      RAISE EXCEPTION 'TOTAL_POOL_EXHAUSTED';
    END IF;

    -- Check individual tier capacity
    IF v_plan.max_capacity IS NOT NULL AND v_plan.claimed_count >= v_plan.max_capacity THEN
      RAISE EXCEPTION 'TIER_CAPACITY_EXHAUSTED';
    END IF;

    -- Increment claimed count for target paid tier
    UPDATE public.plans
    SET claimed_count = claimed_count + 1
    WHERE id = p_plan_id
    RETURNING claimed_count INTO v_new_claimed;
  ELSE
    -- Free / Community tier: unmetered, ignores the 1,500 total paid pool
    UPDATE public.plans
    SET claimed_count = claimed_count + 1
    WHERE id = p_plan_id
    RETURNING claimed_count INTO v_new_claimed;
  END IF;

  -- 3. Record registration entry
  INSERT INTO public.registrations (plan_id, org_name, email, agent_id)
  VALUES (p_plan_id, TRIM(p_org_name), TRIM(LOWER(p_email)), TRIM(p_agent_id))
  RETURNING id INTO v_reg_id;

  -- Compute updated total paid count
  SELECT COALESCE(SUM(claimed_count), 0)
  INTO v_new_total_paid
  FROM public.plans
  WHERE is_paid = true;

  -- 4. Return success payload
  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_reg_id,
    'plan_id', p_plan_id,
    'claimed_count', v_new_claimed,
    'max_capacity', v_plan.max_capacity,
    'total_paid', v_new_total_paid,
    'is_paid', v_plan.is_paid,
    'message', 'Slot reserved successfully.'
  );
END;
$$;

-- Grant execution permission to anon, authenticated, and service_role
GRANT EXECUTE ON FUNCTION public.register_with_capacity_lock TO anon, authenticated, service_role;
GRANT SELECT ON public.plans TO anon, authenticated, service_role;
GRANT SELECT ON public.registrations TO anon, authenticated, service_role;

-- Migration: 20261010_checkout_enhancements.sql
-- Updates plan prices to canonical tiers (₹0, ₹2,499, ₹7,999, ₹29,999)
-- Expands registrations table for operator metadata, GSTIN, UPI payment UTR, and reconciliation status

-- 1. Update Plans Pricing
UPDATE public.plans SET price_inr = 0, name = 'Community Fleet' WHERE id = 'community';
UPDATE public.plans SET price_inr = 2499, name = 'Builder Node' WHERE id = 'tier_1';
UPDATE public.plans SET price_inr = 7999, name = 'Protocol Pro' WHERE id = 'tier_2';
UPDATE public.plans SET price_inr = 29999, name = 'Enterprise Settlement Node' WHERE id = 'tier_3';

-- 2. Expand Registrations Columns
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS operator_name TEXT,
  ADD COLUMN IF NOT EXISTS country_state TEXT,
  ADD COLUMN IF NOT EXISTS gstin TEXT,
  ADD COLUMN IF NOT EXISTS protocol_purpose TEXT,
  ADD COLUMN IF NOT EXISTS payment_utr TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending_reconciliation';

-- 3. Update register_with_capacity_lock with Concurrency Locking & Expanded Payload
CREATE OR REPLACE FUNCTION public.register_with_capacity_lock(
  p_plan_id TEXT,
  p_org_name TEXT,
  p_email TEXT,
  p_agent_id TEXT,
  p_operator_name TEXT DEFAULT NULL,
  p_country_state TEXT DEFAULT NULL,
  p_gstin TEXT DEFAULT NULL,
  p_protocol_purpose TEXT DEFAULT NULL,
  p_payment_utr TEXT DEFAULT NULL,
  p_payment_status TEXT DEFAULT NULL
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
  v_status TEXT;
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

  -- Determine payment status
  IF p_payment_status IS NOT NULL THEN
    v_status := p_payment_status;
  ELSIF v_plan.is_paid THEN
    v_status := 'pending_reconciliation';
  ELSE
    v_status := 'verified';
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

  -- 3. Record registration entry with extended operator details and payment UTR
  INSERT INTO public.registrations (
    plan_id,
    org_name,
    email,
    agent_id,
    operator_name,
    country_state,
    gstin,
    protocol_purpose,
    payment_utr,
    payment_status
  )
  VALUES (
    p_plan_id,
    TRIM(p_org_name),
    TRIM(LOWER(p_email)),
    TRIM(p_agent_id),
    NULLIF(TRIM(p_operator_name), ''),
    NULLIF(TRIM(p_country_state), ''),
    NULLIF(TRIM(p_gstin), ''),
    NULLIF(TRIM(p_protocol_purpose), ''),
    NULLIF(TRIM(p_payment_utr), ''),
    v_status
  )
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
    'agent_id', p_agent_id,
    'claimed_count', v_new_claimed,
    'max_capacity', v_plan.max_capacity,
    'total_paid', v_new_total_paid,
    'is_paid', v_plan.is_paid,
    'payment_status', v_status,
    'message', 'Slot reserved successfully.'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.register_with_capacity_lock TO anon, authenticated, service_role;

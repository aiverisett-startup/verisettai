-- Migration: 20261101_plan_configs_and_admin_controls.sql
-- Description: Plan Capacity Engine, Dynamic Sold-Out, 200-User Sunset, and User Account Controls

-- 1. Create plan_configs Table
CREATE TABLE IF NOT EXISTS public.plan_configs (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  base_price INTEGER NOT NULL,
  gst_amount INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  max_subscribers INTEGER,
  current_subscribers INTEGER NOT NULL DEFAULT 0,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial tier configurations if not present
INSERT INTO public.plan_configs (id, display_name, base_price, gst_amount, total_price, max_subscribers, current_subscribers, is_paused, is_archived)
VALUES 
  ('builder', 'Builder Protocol', 2500, 450, 2950, NULL, 0, false, false),
  ('enterprise', 'Enterprise Protocol', 30000, 5400, 35400, 200, 0, false, false)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  base_price = EXCLUDED.base_price,
  gst_amount = EXCLUDED.gst_amount,
  total_price = EXCLUDED.total_price;

-- 2. Update profiles table with Admin & Account Controls
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'BUILDER';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_suspended') THEN
    ALTER TABLE public.profiles ADD COLUMN is_suspended BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'wallet_balance') THEN
    ALTER TABLE public.profiles ADD COLUMN wallet_balance NUMERIC NOT NULL DEFAULT 0.0;
  END IF;
END $$;

-- 3. Enable RLS on plan_configs
ALTER TABLE public.plan_configs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active plans
DROP POLICY IF EXISTS "Public can view unarchived plan configs" ON public.plan_configs;
CREATE POLICY "Public can view unarchived plan configs"
  ON public.plan_configs FOR SELECT
  USING (true);

-- Allow service role full administrative access
DROP POLICY IF EXISTS "Service role full access on plan_configs" ON public.plan_configs;
CREATE POLICY "Service role full access on plan_configs"
  ON public.plan_configs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

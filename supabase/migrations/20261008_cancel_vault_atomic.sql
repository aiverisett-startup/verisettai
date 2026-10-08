-- ==============================================================================
-- Verisett AI: Atomic Vault Cancellation & Refund Stored Procedure
-- Migration: 20261008_cancel_vault_atomic.sql
-- ==============================================================================

-- 1. Ensure 'CANCELLED' exists in vault_state enum if applicable
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vault_state') THEN
    BEGIN
      ALTER TYPE vault_state ADD VALUE IF NOT EXISTS 'CANCELLED';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 2. Stored Procedure: cancel_vault_atomic
CREATE OR REPLACE FUNCTION cancel_vault_atomic(
  p_vault_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT 'User cancelled vault'
)
RETURNS JSONB AS $$
DECLARE
  v_vault RECORD;
  v_tx_id UUID := gen_random_uuid();
  v_refund_amount BIGINT := 0;
BEGIN
  -- Anti-race condition lock: SELECT ... FOR UPDATE
  SELECT * INTO v_vault
  FROM public.vaults
  WHERE id = p_vault_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vault % not found or unauthorized for user %', p_vault_id, p_user_id;
  END IF;

  -- Verify status/state is cancellable ('CREATED', 'FUNDED', 'WORKING', 'Active Custody')
  IF v_vault.status NOT IN ('CREATED', 'FUNDED', 'WORKING', 'Active Custody')
     AND v_vault.state::text NOT IN ('CREATED', 'FUNDED', 'WORKING') THEN
    RAISE EXCEPTION 'Invariant violation: Vault % with status % cannot be cancelled', p_vault_id, v_vault.status;
  END IF;

  -- Determine refund amount (in smallest unit / paise)
  v_refund_amount := COALESCE(v_vault.balance_cents, ROUND(COALESCE(v_vault.balance, 0) * 100)::BIGINT, 0);

  -- If current_balance > 0, insert a balancing CREDIT record into public.ledger_entries
  IF v_refund_amount > 0 THEN
    INSERT INTO public.ledger_entries (
      user_id,
      vault_id,
      transaction_id,
      entry_type,
      amount,
      currency,
      description
    ) VALUES (
      p_user_id,
      p_vault_id,
      v_tx_id,
      'CREDIT',
      v_refund_amount,
      'INR',
      COALESCE('Vault Cancellation Refund: ' || p_reason, 'Vault Cancellation Refund')
    );
  END IF;

  -- Update vault status to 'CANCELLED', balance to 0
  UPDATE public.vaults
  SET status = 'CANCELLED',
      state = CASE 
        WHEN EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'vault_state'::regtype AND enumlabel = 'CANCELLED') 
        THEN 'CANCELLED'::vault_state 
        ELSE 'REFUNDED'::vault_state 
      END,
      balance = 0,
      balance_cents = 0,
      updated_at = now()
  WHERE id = p_vault_id AND user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'vault_id', p_vault_id,
    'refunded_amount', v_refund_amount,
    'status', 'CANCELLED',
    'reason', p_reason,
    'transaction_id', v_tx_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

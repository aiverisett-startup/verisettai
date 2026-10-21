-- Migration: 20261021_welcome_emails.sql
-- Tracking automated welcome email delivery to prevent duplicate dispatches

CREATE TABLE IF NOT EXISTS public.user_welcome_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_id TEXT,
  status TEXT NOT NULL DEFAULT 'DELIVERED',
  provider TEXT NOT NULL DEFAULT 'Resend'
);

-- Index for instant lookup on login
CREATE INDEX IF NOT EXISTS idx_user_welcome_emails_email ON public.user_welcome_emails(email);
CREATE INDEX IF NOT EXISTS idx_user_welcome_emails_user_id ON public.user_welcome_emails(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_welcome_emails ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_welcome_emails' 
    AND policyname = 'Allow service role full access to user_welcome_emails'
  ) THEN
    CREATE POLICY "Allow service role full access to user_welcome_emails"
      ON public.user_welcome_emails
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to view their own welcome email status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_welcome_emails' 
    AND policyname = 'Allow authenticated read own welcome status'
  ) THEN
    CREATE POLICY "Allow authenticated read own welcome status"
      ON public.user_welcome_emails
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');
  END IF;
END $$;

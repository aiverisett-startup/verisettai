-- ==============================================================================
-- Migration: 20261101_settlement_agreements_and_policies.sql
-- Description: Universal Settlement State Machine, Proof Engine, and Policy Guardrails
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE "SettlementState" AS ENUM (
    'INITIALIZED',
    'ESCROW_LOCKED',
    'DELIVERABLE_SUBMITTED',
    'VERIFYING',
    'SETTLED',
    'CHALLENGED',
    'REFUNDED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "VerificationMethod" AS ENUM (
    'CONTENT_HASH_COMMITMENT',
    'INDEPENDENT_TEST_RUNNER',
    'ATTESTATION_QUORUM'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "agent_policies" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "agentId" TEXT NOT NULL UNIQUE,
  "maxPerTxSpend" INTEGER NOT NULL,
  "dailySpendLimit" INTEGER NOT NULL,
  "currentDailySpend" INTEGER NOT NULL DEFAULT 0,
  "allowedNodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "requireProof" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "settlement_agreements" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "agreementHash" TEXT NOT NULL UNIQUE,
  "buyerAgentId" TEXT NOT NULL,
  "workerAgentId" TEXT NOT NULL,
  "parentAgreementId" TEXT REFERENCES "settlement_agreements"("id") ON DELETE SET NULL,
  "escrowAmountPaise" INTEGER NOT NULL,
  "platformTakeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
  "state" "SettlementState" NOT NULL DEFAULT 'INITIALIZED',
  "verificationMethod" "VerificationMethod" NOT NULL DEFAULT 'CONTENT_HASH_COMMITMENT',
  "acceptanceRules" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "deliverablePayload" JSONB,
  "proofAttestation" JSONB,
  "challengeWindowEnds" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_settlement_buyer" ON "settlement_agreements"("buyerAgentId");
CREATE INDEX IF NOT EXISTS "idx_settlement_worker" ON "settlement_agreements"("workerAgentId");
CREATE INDEX IF NOT EXISTS "idx_settlement_parent" ON "settlement_agreements"("parentAgreementId");
CREATE INDEX IF NOT EXISTS "idx_settlement_state" ON "settlement_agreements"("state");


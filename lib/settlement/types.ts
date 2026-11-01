export type SettlementState =
  | "INITIALIZED"
  | "ESCROW_LOCKED"
  | "DELIVERABLE_SUBMITTED"
  | "VERIFYING"
  | "SETTLED"
  | "CHALLENGED"
  | "REFUNDED";

export type VerificationMethod =
  | "CONTENT_HASH_COMMITMENT"
  | "INDEPENDENT_TEST_RUNNER"
  | "ATTESTATION_QUORUM";

export interface AgentPolicy {
  id: string;
  agentId: string;
  maxPerTxSpend: number; // in paise
  dailySpendLimit: number; // in paise
  currentDailySpend: number; // in paise
  allowedNodes: string[];
  requireProof: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcceptanceRules {
  expectedContentHash?: string;
  testRunner?: {
    requiredFields?: string[];
    schemaType?: string;
    maxLatencyMs?: number;
    assertions?: Array<{
      path: string;
      operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "regex";
      expected: any;
    }>;
  };
  attestationQuorum?: {
    requiredSignatures?: number;
    authorizedSigners?: string[];
  };
}

export interface SettlementAgreement {
  id: string;
  agreementHash: string;
  buyerAgentId: string;
  workerAgentId: string;
  parentAgreementId?: string | null;
  subAgreements?: SettlementAgreement[];
  escrowAmountPaise: number;
  platformTakeRate: number; // default 0.02
  state: SettlementState;
  verificationMethod: VerificationMethod;
  acceptanceRules: AcceptanceRules;
  deliverablePayload?: Record<string, any> | null;
  proofAttestation?: Record<string, any> | null;
  challengeWindowEnds?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransitionResult {
  success: boolean;
  previousState: SettlementState;
  newState: SettlementState;
  agreement: SettlementAgreement;
  error?: string;
  transitionLog?: string;
}

export interface VerificationResult {
  verified: boolean;
  method: VerificationMethod;
  computedHash?: string;
  expectedHash?: string;
  testResults?: {
    passed: boolean;
    totalAssertions: number;
    passedAssertions: number;
    failedAssertions: string[];
  };
  quorumResults?: {
    validSignatures: number;
    requiredSignatures: number;
    signers: string[];
  };
  error?: string;
  verifiedAt: string;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  violatesMaxPerTx: boolean;
  violatesDailyLimit: boolean;
  violatesNodeWhitelist: boolean;
  violatesProofRequirement: boolean;
  reason?: string;
  currentDailySpend: number;
  remainingDailyBudget: number;
}

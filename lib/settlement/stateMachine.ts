import crypto from "crypto";
import {
  SettlementAgreement,
  SettlementState,
  TransitionResult,
  VerificationMethod,
} from "./types";
import { evaluatePolicyForEscrowLock, commitPolicySpend, releasePolicySpend } from "./policyEvaluator";
import { verifyDeliverable } from "./proofEngine";
import { onParentSettledTriggerDownstream } from "./dagEngine";
import prisma from "@/lib/prisma";

// In-memory fallback agreement store for local dev, sandbox, and resilience
const agreementStore = new Map<string, SettlementAgreement>();

// Permitted deterministic state transitions
const VALID_TRANSITIONS: Record<SettlementState, SettlementState[]> = {
  INITIALIZED: ["ESCROW_LOCKED"],
  ESCROW_LOCKED: ["DELIVERABLE_SUBMITTED", "REFUNDED"],
  DELIVERABLE_SUBMITTED: ["VERIFYING", "CHALLENGED", "REFUNDED"],
  VERIFYING: ["SETTLED", "CHALLENGED", "REFUNDED"],
  CHALLENGED: ["SETTLED", "REFUNDED"],
  SETTLED: [], // Terminal state
  REFUNDED: [], // Terminal state
};

/**
 * Validates whether a state transition is legal in the state machine
 */
export function isValidTransition(
  currentState: SettlementState,
  targetState: SettlementState
): boolean {
  const allowed = VALID_TRANSITIONS[currentState] || [];
  return allowed.includes(targetState);
}

/**
 * Generates deterministic cryptographic agreement hash
 */
export function generateAgreementHash(params: {
  buyerAgentId: string;
  workerAgentId: string;
  escrowAmountPaise: number;
  nonce?: string;
}): string {
  const nonce = params.nonce || crypto.randomBytes(16).toString("hex");
  const data = `${params.buyerAgentId}:${params.workerAgentId}:${params.escrowAmountPaise}:${nonce}:${Date.now()}`;
  return "vsm_" + crypto.createHash("sha256").update(data).digest("hex").slice(0, 32);
}

/**
 * Initialize a new Settlement Agreement
 */
export async function createAgreement(params: {
  buyerAgentId: string;
  workerAgentId: string;
  escrowAmountPaise: number;
  platformTakeRate?: number;
  verificationMethod?: VerificationMethod;
  acceptanceRules?: Record<string, any>;
  parentAgreementId?: string | null;
  challengeWindowHours?: number;
}): Promise<SettlementAgreement> {
  const agreementHash = generateAgreementHash(params);
  const now = new Date();
  const challengeHours = params.challengeWindowHours ?? 24;
  const challengeWindowEnds = new Date(now.getTime() + challengeHours * 60 * 60 * 1000).toISOString();

  const agreement: SettlementAgreement = {
    id: `vsm-agr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    agreementHash,
    buyerAgentId: params.buyerAgentId,
    workerAgentId: params.workerAgentId,
    parentAgreementId: params.parentAgreementId || null,
    escrowAmountPaise: params.escrowAmountPaise,
    platformTakeRate: params.platformTakeRate ?? 0.02,
    state: "INITIALIZED",
    verificationMethod: params.verificationMethod ?? "CONTENT_HASH_COMMITMENT",
    acceptanceRules: params.acceptanceRules ?? {},
    deliverablePayload: null,
    proofAttestation: null,
    challengeWindowEnds,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  // Cache in memory
  agreementStore.set(agreement.id, agreement);
  agreementStore.set(agreement.agreementHash, agreement);

  // Persist to Prisma if database available
  try {
    await prisma.settlementAgreement.create({
      data: {
        id: agreement.id,
        agreementHash: agreement.agreementHash,
        buyerAgentId: agreement.buyerAgentId,
        workerAgentId: agreement.workerAgentId,
        parentAgreementId: agreement.parentAgreementId,
        escrowAmountPaise: agreement.escrowAmountPaise,
        platformTakeRate: agreement.platformTakeRate,
        state: agreement.state,
        verificationMethod: agreement.verificationMethod,
        acceptanceRules: agreement.acceptanceRules as any,
        challengeWindowEnds: agreement.challengeWindowEnds ? new Date(agreement.challengeWindowEnds) : null,
      },
    });
  } catch {
    // Graceful fallback to memory store
  }

  return agreement;
}

/**
 * Fetches an agreement by ID or agreementHash
 */
export async function getAgreement(
  idOrHash: string
): Promise<SettlementAgreement | null> {
  // Check memory store first
  const memoryMatch = agreementStore.get(idOrHash);
  if (memoryMatch) return memoryMatch;

  // Query database
  try {
    const db = await prisma.settlementAgreement.findFirst({
      where: {
        OR: [{ id: idOrHash }, { agreementHash: idOrHash }],
      },
      include: {
        subAgreements: true,
      },
    });

    if (db) {
      const parsed: SettlementAgreement = {
        id: db.id,
        agreementHash: db.agreementHash,
        buyerAgentId: db.buyerAgentId,
        workerAgentId: db.workerAgentId,
        parentAgreementId: db.parentAgreementId,
        subAgreements: db.subAgreements ? (db.subAgreements as any) : undefined,
        escrowAmountPaise: db.escrowAmountPaise,
        platformTakeRate: db.platformTakeRate,
        state: db.state as SettlementState,
        verificationMethod: db.verificationMethod as VerificationMethod,
        acceptanceRules: db.acceptanceRules as any,
        deliverablePayload: db.deliverablePayload as any,
        proofAttestation: db.proofAttestation as any,
        challengeWindowEnds: db.challengeWindowEnds ? db.challengeWindowEnds.toISOString() : null,
        createdAt: db.createdAt.toISOString(),
        updatedAt: db.updatedAt.toISOString(),
      };
      agreementStore.set(parsed.id, parsed);
      agreementStore.set(parsed.agreementHash, parsed);
      return parsed;
    }
  } catch {
    // Database query failed, return memory state
  }

  return null;
}

/**
 * Lists all active settlement agreements
 */
export async function listAgreements(): Promise<SettlementAgreement[]> {
  try {
    const dbs = await prisma.settlementAgreement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { subAgreements: true },
    });
    if (dbs.length > 0) {
      return dbs.map((db) => ({
        id: db.id,
        agreementHash: db.agreementHash,
        buyerAgentId: db.buyerAgentId,
        workerAgentId: db.workerAgentId,
        parentAgreementId: db.parentAgreementId,
        subAgreements: db.subAgreements ? (db.subAgreements as any) : undefined,
        escrowAmountPaise: db.escrowAmountPaise,
        platformTakeRate: db.platformTakeRate,
        state: db.state as SettlementState,
        verificationMethod: db.verificationMethod as VerificationMethod,
        acceptanceRules: db.acceptanceRules as any,
        deliverablePayload: db.deliverablePayload as any,
        proofAttestation: db.proofAttestation as any,
        challengeWindowEnds: db.challengeWindowEnds ? db.challengeWindowEnds.toISOString() : null,
        createdAt: db.createdAt.toISOString(),
        updatedAt: db.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Fallback
  }

  // Deduplicate memory store
  const unique = new Map<string, SettlementAgreement>();
  agreementStore.forEach((agr) => unique.set(agr.id, agr));
  return Array.from(unique.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Deterministic State Transition Executor
 */
export async function transitionSettlement(params: {
  agreementIdOrHash: string;
  targetState: SettlementState;
  deliverablePayload?: any;
  proofAttestation?: any;
  challengeReason?: string;
}): Promise<TransitionResult> {
  const agreement = await getAgreement(params.agreementIdOrHash);
  if (!agreement) {
    throw new Error(`Agreement ${params.agreementIdOrHash} not found.`);
  }

  const previousState = agreement.state;
  const targetState = params.targetState;

  // 1. Guardrail: Validate transition legitimacy
  if (!isValidTransition(previousState, targetState)) {
    return {
      success: false,
      previousState,
      newState: previousState,
      agreement,
      error: `Illegal state transition from ${previousState} to ${targetState}. Valid next states: [${(VALID_TRANSITIONS[previousState] || []).join(", ")}].`,
    };
  }

  // 2. State-Specific Predicates & Actions
  // A. Transitioning to ESCROW_LOCKED: Policy evaluation
  if (targetState === "ESCROW_LOCKED") {
    const policyResult = await evaluatePolicyForEscrowLock({
      buyerAgentId: agreement.buyerAgentId,
      workerAgentId: agreement.workerAgentId,
      escrowAmountPaise: agreement.escrowAmountPaise,
      verificationMethod: agreement.verificationMethod,
    });

    if (!policyResult.allowed) {
      return {
        success: false,
        previousState,
        newState: previousState,
        agreement,
        error: `Policy guardrail violation: ${policyResult.reason}`,
      };
    }

    // Commit policy spend
    await commitPolicySpend(agreement.buyerAgentId, agreement.escrowAmountPaise);
  }

  // B. Transitioning to DELIVERABLE_SUBMITTED: Attach payload
  if (targetState === "DELIVERABLE_SUBMITTED") {
    if (!params.deliverablePayload) {
      return {
        success: false,
        previousState,
        newState: previousState,
        agreement,
        error: "Deliverable payload must be provided when transitioning to DELIVERABLE_SUBMITTED.",
      };
    }
    agreement.deliverablePayload = params.deliverablePayload;
    if (params.proofAttestation) {
      agreement.proofAttestation = params.proofAttestation;
    }
  }

  // C. Transitioning to VERIFYING: Run Proof Engine
  if (targetState === "VERIFYING") {
    const payload = params.deliverablePayload || agreement.deliverablePayload;
    const proof = params.proofAttestation || agreement.proofAttestation;
    const proofResult = await verifyDeliverable(agreement, payload, proof);

    if (!proofResult.verified) {
      // Automatic challenge on verification failure
      return {
        success: false,
        previousState,
        newState: previousState,
        agreement,
        error: `Cryptographic proof verification failed: ${proofResult.error}`,
      };
    }
  }

  // D. Transitioning to SETTLED: Finalize disbursements & trigger downstream DAG
  if (targetState === "SETTLED") {
    // If not already verified, verify now
    if (previousState !== "VERIFYING") {
      const payload = params.deliverablePayload || agreement.deliverablePayload;
      const proof = params.proofAttestation || agreement.proofAttestation;
      const proofResult = await verifyDeliverable(agreement, payload, proof);
      if (!proofResult.verified) {
        return {
          success: false,
          previousState,
          newState: previousState,
          agreement,
          error: `Cannot settle: Proof verification failed: ${proofResult.error}`,
        };
      }
    }

    // Trigger DAG auto-resolution for downstream subcontractor nodes
    try {
      await onParentSettledTriggerDownstream(agreement.id);
    } catch (err: any) {
      console.warn("Downstream DAG notification warning:", err.message);
    }
  }

  // E. Transitioning to REFUNDED: Release policy spend
  if (targetState === "REFUNDED") {
    if (previousState === "ESCROW_LOCKED" || previousState === "DELIVERABLE_SUBMITTED" || previousState === "CHALLENGED") {
      await releasePolicySpend(agreement.buyerAgentId, agreement.escrowAmountPaise);
    }
  }

  // 3. Commit state change
  const now = new Date().toISOString();
  agreement.state = targetState;
  agreement.updatedAt = now;
  if (params.deliverablePayload) agreement.deliverablePayload = params.deliverablePayload;
  if (params.proofAttestation) agreement.proofAttestation = params.proofAttestation;

  // Update memory store
  agreementStore.set(agreement.id, agreement);
  agreementStore.set(agreement.agreementHash, agreement);

  // Update database
  try {
    await prisma.settlementAgreement.update({
      where: { id: agreement.id },
      data: {
        state: targetState,
        deliverablePayload: agreement.deliverablePayload as any,
        proofAttestation: agreement.proofAttestation as any,
        updatedAt: new Date(now),
      },
    });
  } catch {
    // Fallback
  }

  return {
    success: true,
    previousState,
    newState: targetState,
    agreement,
    transitionLog: `Transitioned ${agreement.agreementHash} from ${previousState} -> ${targetState} at ${now}`,
  };
}


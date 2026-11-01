import { AgentPolicy, PolicyEvaluationResult, VerificationMethod } from "./types";
import prisma from "@/lib/prisma";

// In-memory fallback cache for development, testing, and sandbox resilience
const policyStore = new Map<string, AgentPolicy>();

/**
 * Default fallback policy for an agent if no explicit record exists
 */
export function getDefaultAgentPolicy(agentId: string): AgentPolicy {
  return {
    id: `policy-${agentId}`,
    agentId,
    maxPerTxSpend: 500000, // ₹5,000 max single spend (in paise)
    dailySpendLimit: 5000000, // ₹50,000 max 24h spend (in paise)
    currentDailySpend: 0,
    allowedNodes: [], // empty allows all
    requireProof: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch or initialize agent economic guardrails
 */
export async function getAgentPolicy(agentId: string): Promise<AgentPolicy> {
  try {
    const dbPolicy = await prisma.agentPolicy.findUnique({
      where: { agentId },
    });
    if (dbPolicy) {
      return {
        id: dbPolicy.id,
        agentId: dbPolicy.agentId,
        maxPerTxSpend: dbPolicy.maxPerTxSpend,
        dailySpendLimit: dbPolicy.dailySpendLimit,
        currentDailySpend: dbPolicy.currentDailySpend,
        allowedNodes: dbPolicy.allowedNodes,
        requireProof: dbPolicy.requireProof,
        createdAt: dbPolicy.createdAt.toISOString(),
        updatedAt: dbPolicy.updatedAt.toISOString(),
      };
    }
  } catch {
    // Fall back to memory store if database is offline or not configured
  }

  const cached = policyStore.get(agentId);
  if (cached) return cached;

  const defaultPolicy = getDefaultAgentPolicy(agentId);
  policyStore.set(agentId, defaultPolicy);
  return defaultPolicy;
}

/**
 * Save or update agent economic guardrails
 */
export async function saveAgentPolicy(
  policy: Partial<AgentPolicy> & { agentId: string }
): Promise<AgentPolicy> {
  const existing = await getAgentPolicy(policy.agentId);
  const updated: AgentPolicy = {
    ...existing,
    ...policy,
    updatedAt: new Date().toISOString(),
  };

  policyStore.set(policy.agentId, updated);

  try {
    await prisma.agentPolicy.upsert({
      where: { agentId: policy.agentId },
      update: {
        maxPerTxSpend: updated.maxPerTxSpend,
        dailySpendLimit: updated.dailySpendLimit,
        currentDailySpend: updated.currentDailySpend,
        allowedNodes: updated.allowedNodes,
        requireProof: updated.requireProof,
      },
      create: {
        agentId: updated.agentId,
        maxPerTxSpend: updated.maxPerTxSpend,
        dailySpendLimit: updated.dailySpendLimit,
        currentDailySpend: updated.currentDailySpend,
        allowedNodes: updated.allowedNodes,
        requireProof: updated.requireProof,
      },
    });
  } catch {
    // Graceful fallback to memory store
  }

  return updated;
}

/**
 * Pre-checks spending thresholds and compliance rules before locking escrow
 */
export async function evaluatePolicyForEscrowLock(params: {
  buyerAgentId: string;
  workerAgentId: string;
  escrowAmountPaise: number;
  verificationMethod?: VerificationMethod | null;
}): Promise<PolicyEvaluationResult> {
  const policy = await getAgentPolicy(params.buyerAgentId);

  const violatesMaxPerTx = params.escrowAmountPaise > policy.maxPerTxSpend;
  const projectedDailySpend = policy.currentDailySpend + params.escrowAmountPaise;
  const violatesDailyLimit = projectedDailySpend > policy.dailySpendLimit;
  const violatesNodeWhitelist =
    policy.allowedNodes.length > 0 && !policy.allowedNodes.includes(params.workerAgentId);
  const violatesProofRequirement = policy.requireProof && !params.verificationMethod;

  const allowed =
    !violatesMaxPerTx &&
    !violatesDailyLimit &&
    !violatesNodeWhitelist &&
    !violatesProofRequirement;

  let reason: string | undefined;
  if (violatesMaxPerTx) {
    reason = `Transaction amount (₹${(params.escrowAmountPaise / 100).toFixed(2)}) exceeds maximum per-transaction threshold (₹${(policy.maxPerTxSpend / 100).toFixed(2)}).`;
  } else if (violatesDailyLimit) {
    reason = `Escrow lock would exceed 24-hour cumulative spend cap (₹${(policy.dailySpendLimit / 100).toFixed(2)}). Current spend: ₹${(policy.currentDailySpend / 100).toFixed(2)}.`;
  } else if (violatesNodeWhitelist) {
    reason = `Worker node ${params.workerAgentId} is not in the authorized node whitelist for agent ${params.buyerAgentId}.`;
  } else if (violatesProofRequirement) {
    reason = `Agent policy requires cryptographic proof or test runner attestation before settlement lock.`;
  }

  return {
    allowed,
    violatesMaxPerTx,
    violatesDailyLimit,
    violatesNodeWhitelist,
    violatesProofRequirement,
    reason,
    currentDailySpend: policy.currentDailySpend,
    remainingDailyBudget: Math.max(0, policy.dailySpendLimit - policy.currentDailySpend),
  };
}

/**
 * Commits daily spend when an escrow lock succeeds
 */
export async function commitPolicySpend(
  buyerAgentId: string,
  amountPaise: number
): Promise<void> {
  const policy = await getAgentPolicy(buyerAgentId);
  const newDailySpend = policy.currentDailySpend + amountPaise;
  await saveAgentPolicy({
    agentId: buyerAgentId,
    currentDailySpend: newDailySpend,
  });
}

/**
 * Releases daily spend when an escrow is refunded
 */
export async function releasePolicySpend(
  buyerAgentId: string,
  amountPaise: number
): Promise<void> {
  const policy = await getAgentPolicy(buyerAgentId);
  const newDailySpend = Math.max(0, policy.currentDailySpend - amountPaise);
  await saveAgentPolicy({
    agentId: buyerAgentId,
    currentDailySpend: newDailySpend,
  });
}


import { createAgreement, transitionSettlement, getAgreement, listAgreements } from "./stateMachine";
import { saveAgentPolicy } from "./policyEvaluator";

let isSeeded = false;

export async function ensureSettlementSeed(): Promise<void> {
  if (isSeeded) return;

  try {
    const existing = await listAgreements();
    if (existing.length > 0) {
      isSeeded = true;
      return;
    }

    // 1. Seed Agent Policies
    await saveAgentPolicy({
      agentId: "agent-orchestrator-9",
      maxPerTxSpend: 5000000, // ₹50,000
      dailySpendLimit: 25000000, // ₹250,000
      currentDailySpend: 3350000,
      allowedNodes: ["agent-deepseek-code-v3", "subcontractor-vector-search", "subcontractor-safety-guard"],
      requireProof: true,
    });

    // 2. Root Parent Agreement
    const parent = await createAgreement({
      buyerAgentId: "agent-orchestrator-9",
      workerAgentId: "agent-deepseek-code-v3",
      escrowAmountPaise: 2500000, // ₹25,000
      platformTakeRate: 0.02,
      verificationMethod: "INDEPENDENT_TEST_RUNNER",
      acceptanceRules: {
        testRunner: {
          requiredFields: ["status", "metrics", "executionProof"],
          maxLatencyMs: 1500,
          assertions: [
            { path: "status", operator: "eq", expected: "COMPLETED" },
            { path: "metrics.accuracy", operator: "gte", expected: 0.98 },
          ],
        },
      },
      challengeWindowHours: 12,
    });

    // Advance parent to SETTLED
    await transitionSettlement({
      agreementIdOrHash: parent.id,
      targetState: "ESCROW_LOCKED",
    });
    await transitionSettlement({
      agreementIdOrHash: parent.id,
      targetState: "DELIVERABLE_SUBMITTED",
      deliverablePayload: {
        status: "COMPLETED",
        latencyMs: 412,
        metrics: {
          accuracy: 0.994,
          tokensProcessed: 14200,
        },
        executionProof: "0x89fa91bca72891901abccf382901a18c89bdf01a88",
      },
      proofAttestation: {
        signatures: [
          { nodeId: "agent-deepseek-code-v3", sig: "0x992fa180a...bca7" },
        ],
      },
    });
    await transitionSettlement({
      agreementIdOrHash: parent.id,
      targetState: "VERIFYING",
    });
    await transitionSettlement({
      agreementIdOrHash: parent.id,
      targetState: "SETTLED",
    });

    // 3. Child Subcontractor Node 1 (Settled)
    const child1 = await createAgreement({
      buyerAgentId: "agent-orchestrator-9",
      workerAgentId: "subcontractor-vector-search",
      parentAgreementId: parent.id,
      escrowAmountPaise: 500000, // ₹5,000
      platformTakeRate: 0.02,
      verificationMethod: "CONTENT_HASH_COMMITMENT",
      acceptanceRules: {
        expectedContentHash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      },
    });
    await transitionSettlement({
      agreementIdOrHash: child1.id,
      targetState: "ESCROW_LOCKED",
    });
    await transitionSettlement({
      agreementIdOrHash: child1.id,
      targetState: "DELIVERABLE_SUBMITTED",
      deliverablePayload: {
        embeddingsCount: 15000,
        indexHash: "0x7a2...b99",
        status: "INDEXED",
      },
    });
    await transitionSettlement({
      agreementIdOrHash: child1.id,
      targetState: "VERIFYING",
    });
    await transitionSettlement({
      agreementIdOrHash: child1.id,
      targetState: "SETTLED",
    });

    // 4. Child Subcontractor Node 2 (Verifying)
    const child2 = await createAgreement({
      buyerAgentId: "agent-orchestrator-9",
      workerAgentId: "subcontractor-safety-guard",
      parentAgreementId: parent.id,
      escrowAmountPaise: 350000, // ₹3,500
      platformTakeRate: 0.02,
      verificationMethod: "ATTESTATION_QUORUM",
      acceptanceRules: {
        attestationQuorum: {
          requiredSignatures: 1,
          authorizedSigners: ["subcontractor-safety-guard"],
        },
      },
    });
    await transitionSettlement({
      agreementIdOrHash: child2.id,
      targetState: "ESCROW_LOCKED",
    });
    await transitionSettlement({
      agreementIdOrHash: child2.id,
      targetState: "DELIVERABLE_SUBMITTED",
      deliverablePayload: {
        redteamEvaluations: 40,
        safetyViolationScore: 0.0,
        approved: true,
      },
      proofAttestation: {
        signatures: [
          { nodeId: "subcontractor-safety-guard", sig: "0xaa82b...c91a" },
        ],
      },
    });
    await transitionSettlement({
      agreementIdOrHash: child2.id,
      targetState: "VERIFYING",
    });

    isSeeded = true;
  } catch (err: any) {
    console.warn("[SETTLEMENT_SEED_WARNING]:", err?.message || err);
    isSeeded = true; // Avoid repeated failing calls
  }
}

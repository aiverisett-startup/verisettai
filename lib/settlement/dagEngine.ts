import { SettlementAgreement, SettlementState } from "./types";
import { getAgreement, listAgreements, transitionSettlement } from "./stateMachine";
import prisma from "@/lib/prisma";

export interface DAGNode {
  id: string;
  agreementHash: string;
  buyerAgentId: string;
  workerAgentId: string;
  escrowAmountPaise: number;
  state: SettlementState;
  parentAgreementId?: string | null;
  children: DAGNode[];
  depth: number;
}

export interface DAGSummary {
  rootNode: DAGNode;
  totalNodes: number;
  totalEscrowPaise: number;
  settledNodes: number;
  activeNodes: number;
  isFullyResolved: boolean;
}

/**
 * Builds a hierarchical DAG tree from a root agreement ID
 */
export async function buildTaskDependencyTree(
  rootAgreementIdOrHash: string
): Promise<DAGSummary | null> {
  const root = await getAgreement(rootAgreementIdOrHash);
  if (!root) return null;

  const allAgreements = await listAgreements();

  // Map agreements by parent ID
  const childrenMap = new Map<string, SettlementAgreement[]>();
  for (const agr of allAgreements) {
    if (agr.parentAgreementId) {
      const existing = childrenMap.get(agr.parentAgreementId) || [];
      existing.push(agr);
      childrenMap.set(agr.parentAgreementId, existing);
    }
  }

  let totalNodes = 0;
  let totalEscrowPaise = 0;
  let settledNodes = 0;
  let activeNodes = 0;

  function buildNode(agreement: SettlementAgreement, depth = 0): DAGNode {
    totalNodes++;
    totalEscrowPaise += agreement.escrowAmountPaise;
    if (agreement.state === "SETTLED") {
      settledNodes++;
    } else {
      activeNodes++;
    }

    const childAgreements = childrenMap.get(agreement.id) || [];
    const children = childAgreements.map((child) => buildNode(child, depth + 1));

    return {
      id: agreement.id,
      agreementHash: agreement.agreementHash,
      buyerAgentId: agreement.buyerAgentId,
      workerAgentId: agreement.workerAgentId,
      escrowAmountPaise: agreement.escrowAmountPaise,
      state: agreement.state,
      parentAgreementId: agreement.parentAgreementId,
      children,
      depth,
    };
  }

  const rootNode = buildNode(root);

  return {
    rootNode,
    totalNodes,
    totalEscrowPaise,
    settledNodes,
    activeNodes,
    isFullyResolved: settledNodes === totalNodes,
  };
}

/**
 * Auto-resolves downstream subcontractor dependencies upon parent verification.
 * When a parent task successfully verifies or settles, downstream subcontractor
 * agreements whose execution was gated on parent completion are automatically
 * unblocked and advanced.
 */
export async function onParentSettledTriggerDownstream(
  parentAgreementId: string
): Promise<{ unblockedCount: number; transitionedAgreements: string[] }> {
  const allAgreements = await listAgreements();
  const directChildren = allAgreements.filter(
    (a) => a.parentAgreementId === parentAgreementId
  );

  const transitionedAgreements: string[] = [];

  for (const child of directChildren) {
    // If child was waiting at INITIALIZED, unlock escrow now that parent is verified
    if (child.state === "INITIALIZED") {
      try {
        const res = await transitionSettlement({
          agreementIdOrHash: child.id,
          targetState: "ESCROW_LOCKED",
        });
        if (res.success) {
          transitionedAgreements.push(child.agreementHash);
        }
      } catch (err: any) {
        console.error(`Failed to unlock downstream child ${child.id}:`, err.message);
      }
    } else if (child.state === "DELIVERABLE_SUBMITTED") {
      // If deliverable was already submitted and pending parent milestone completion, trigger verification
      try {
        const res = await transitionSettlement({
          agreementIdOrHash: child.id,
          targetState: "VERIFYING",
        });
        if (res.success) {
          transitionedAgreements.push(child.agreementHash);
        }
      } catch (err: any) {
        console.error(`Failed to verify downstream child ${child.id}:`, err.message);
      }
    }
  }

  return {
    unblockedCount: transitionedAgreements.length,
    transitionedAgreements,
  };
}

/**
 * Checks for circular dependency deadlocks in the DAG before linking parent-child
 */
export function detectCycle(
  agreements: SettlementAgreement[],
  proposedParentId: string,
  proposedChildId: string
): boolean {
  if (proposedParentId === proposedChildId) return true;

  const parentMap = new Map<string, string>();
  for (const agr of agreements) {
    if (agr.parentAgreementId) {
      parentMap.set(agr.id, agr.parentAgreementId);
    }
  }

  // Follow upward chain from proposedParentId
  let curr: string | undefined = proposedParentId;
  const visited = new Set<string>();

  while (curr) {
    if (visited.has(curr)) return true; // cycle already present
    visited.add(curr);
    if (curr === proposedChildId) return true; // cycle detected
    curr = parentMap.get(curr);
  }

  return false;
}

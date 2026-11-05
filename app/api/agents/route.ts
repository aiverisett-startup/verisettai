import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getVaultState, setServerAgentConnected } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
    });

    const serializedAgents = agents.map((a) => ({
      ...a,
      totalSettled: a.totalSettled ? a.totalSettled.toString() : "0",
    }));

    return NextResponse.json(
      {
        agents: serializedAgents,
        totalCount: serializedAgents.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("[AGENTS_GET_ERROR]:", err);
    return NextResponse.json(
      {
        agents: [],
        totalCount: 0,
        error: err?.message || "Failed to fetch agents",
      },
      {
        status: 200, // Safe database fallback without crashing UI
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, endpoint, protocol, userId } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Agent name is required" },
        { status: 400 }
      );
    }

    const createdAgent = await prisma.agent.create({
      data: {
        name: name.trim(),
        endpoint: endpoint ? String(endpoint).trim() : null,
        protocol: protocol || "A2A",
        userId: userId || null,
        status: "ACTIVE",
        throughputTps: 0.0,
        totalSettled: BigInt(0),
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        agent: {
          ...createdAgent,
          totalSettled: createdAgent.totalSettled.toString(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[AGENTS_POST_ERROR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create agent" },
      { status: 500 }
    );
  }
}

/**
 * Shared Agent Deletion Handler with Escrow Safety Invariant Checks
 */
export async function handleAgentDeregistration(targetId: string | null | undefined) {
  if (!targetId || typeof targetId !== "string" || !targetId.trim()) {
    return NextResponse.json(
      { success: false, error: "agent_id is required for deregistration" },
      { status: 400 }
    );
  }

  const cleanId = targetId.trim();

  // 1. Validate that the incoming agent exists in the registry (Prisma, Supabase, or Memory)
  let agentRecord: any = null;
  try {
    agentRecord = await prisma.agent.findFirst({
      where: {
        OR: [{ id: cleanId }, { name: cleanId }],
      },
    });
  } catch (err) {
    console.warn("[PRISMA_AGENT_LOOKUP_WARN]:", err);
  }

  let supaRecord: any = null;
  try {
    const { data: supaAgent } = await supabaseAdmin
      .from("agents")
      .select("id, name, status")
      .or(`id.eq.${cleanId},name.eq.${cleanId}`)
      .maybeSingle();

    if (supaAgent) {
      supaRecord = supaAgent;
    } else {
      const { data: regAgent } = await supabaseAdmin
        .from("registered_agents")
        .select("id, agent_name")
        .or(`id.eq.${cleanId},agent_name.eq.${cleanId}`)
        .maybeSingle();

      if (regAgent) {
        supaRecord = { id: regAgent.id, name: regAgent.agent_name, status: "ACTIVE" };
      }
    }
  } catch (err) {
    console.warn("[SUPABASE_AGENT_LOOKUP_WARN]:", err);
  }

  const vState = getVaultState();
  const inServerStore =
    vState.connected_agent_id === cleanId || vState.connected_agent_name === cleanId;

  if (!agentRecord && !supaRecord && !inServerStore) {
    return NextResponse.json(
      { success: false, error: `Agent "${cleanId}" not found in registry.` },
      { status: 404 }
    );
  }

  const agentId = agentRecord?.id || supaRecord?.id || cleanId;
  const agentName =
    agentRecord?.name || supaRecord?.name || (inServerStore ? vState.connected_agent_name : null);

  // 2. Escrow Safety Check:
  // Verify that the target agent has no active or in-progress escrow commitments (status === 'in_progress' or 'claimed').
  // If actively bound to an unsettled contract, reject with exact invariant message:
  const activeStatuses = [
    "in_progress",
    "claimed",
    "IN_PROGRESS",
    "CLAIMED",
    "locked",
    "LOCKED",
    "ESCROW_LOCKED",
    "DELIVERABLE_SUBMITTED",
    "VERIFYING",
  ];

  // Check 2A: Prisma escrows
  try {
    const activeEscrow = await prisma.escrows.findFirst({
      where: {
        OR: [
          { agent_id: agentId },
          { client_id: agentId },
          ...(agentName ? [{ agent_id: agentName }, { client_id: agentName }] : []),
          ...(cleanId !== agentId ? [{ agent_id: cleanId }, { client_id: cleanId }] : []),
        ],
        status: { in: activeStatuses },
      },
    });

    if (activeEscrow) {
      return NextResponse.json(
        { error: "Cannot deregister an agent with active locked escrow contracts." },
        { status: 400 }
      );
    }
  } catch (escrowErr) {
    console.warn("[ESCROW_SAFETY_CHECK_PRISMA_ESCROWS]:", escrowErr);
  }

  // Check 2B: Prisma SettlementAgreement
  try {
    const activeAgreement = await prisma.settlementAgreement.findFirst({
      where: {
        OR: [
          { buyerAgentId: agentId },
          { workerAgentId: agentId },
          ...(agentName ? [{ buyerAgentId: agentName }, { workerAgentId: agentName }] : []),
          ...(cleanId !== agentId ? [{ buyerAgentId: cleanId }, { workerAgentId: cleanId }] : []),
        ],
        state: {
          in: ["ESCROW_LOCKED", "DELIVERABLE_SUBMITTED", "VERIFYING", "CHALLENGED"],
        },
      },
    });

    if (activeAgreement) {
      return NextResponse.json(
        { error: "Cannot deregister an agent with active locked escrow contracts." },
        { status: 400 }
      );
    }
  } catch (agreementErr) {
    console.warn("[ESCROW_SAFETY_CHECK_SETTLEMENT]:", agreementErr);
  }

  // Check 2C: Supabase escrows table
  try {
    const clauses = [`agent_id.eq.${agentId}`, `client_id.eq.${agentId}`];
    if (agentName) {
      clauses.push(`agent_id.eq.${agentName}`, `client_id.eq.${agentName}`);
    }
    const { data: supaActive } = await supabaseAdmin
      .from("escrows")
      .select("id, status")
      .or(clauses.join(","))
      .in("status", ["in_progress", "claimed", "IN_PROGRESS", "CLAIMED", "locked", "LOCKED"]);

    if (supaActive && supaActive.length > 0) {
      return NextResponse.json(
        { error: "Cannot deregister an agent with active locked escrow contracts." },
        { status: 400 }
      );
    }
  } catch (supaErr) {
    console.warn("[ESCROW_SAFETY_CHECK_SUPABASE]:", supaErr);
  }

  // Check 2D: Memory Vault Deployments
  try {
    const hasLockedVault = vState.vault_deployments?.some((v) => {
      const isTarget =
        v.allocatedAgent === agentId ||
        v.allocatedAgent === agentName ||
        v.allocatedAgent === cleanId ||
        v.payer === agentId ||
        v.payer === agentName ||
        v.payer === cleanId ||
        v.payee === agentId ||
        v.payee === agentName ||
        v.payee === cleanId;
      const statusStr = String(v.status || "").toLowerCase();
      const isLocked =
        statusStr === "in_progress" ||
        statusStr === "claimed" ||
        statusStr.includes("lock");
      return isTarget && isLocked;
    });

    if (hasLockedVault) {
      return NextResponse.json(
        { error: "Cannot deregister an agent with active locked escrow contracts." },
        { status: 400 }
      );
    }
  } catch (storeErr) {
    console.warn("[ESCROW_SAFETY_CHECK_STORE]:", storeErr);
  }

  // 3. Clear of active contracts: Perform deletion across registry sources
  try {
    await prisma.agent.deleteMany({
      where: {
        OR: [
          { id: agentId },
          { id: cleanId },
          ...(agentName ? [{ name: agentName }] : []),
        ],
      },
    });
  } catch (prismaDelErr) {
    console.warn("[PRISMA_AGENT_DELETE_NOTE]:", prismaDelErr);
  }

  try {
    await prisma.agentPolicy.deleteMany({
      where: {
        OR: [{ agentId: agentId }, { agentId: cleanId }],
      },
    });
  } catch {
    // Policy cleanup is non-blocking
  }

  try {
    await supabaseAdmin
      .from("agents")
      .delete()
      .or(`id.eq.${agentId},id.eq.${cleanId}${agentName ? `,name.eq.${agentName}` : ""}`);
  } catch {
    // Supabase table delete is non-blocking
  }

  try {
    await supabaseAdmin
      .from("registered_agents")
      .delete()
      .or(`id.eq.${agentId},id.eq.${cleanId}${agentName ? `,agent_name.eq.${agentName}` : ""}`);
  } catch {
    // Supabase table delete is non-blocking
  }

  if (
    vState.connected_agent_id === agentId ||
    vState.connected_agent_id === cleanId ||
    vState.connected_agent_name === agentName
  ) {
    setServerAgentConnected(false, undefined, "Autonomous Settlement Agent");
  }

  // 4. Return standard 200 response
  return NextResponse.json(
    {
      success: true,
      deleted_agent_id: agentId,
      message: `Agent ${agentName || agentId} successfully deregistered.`,
    },
    { status: 200 }
  );
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let targetId =
      searchParams.get("id") ||
      searchParams.get("agent_id") ||
      searchParams.get("agentId");

    if (!targetId) {
      const body = await req.json().catch(() => ({}));
      targetId = body.id || body.agent_id || body.agentId;
    }

    return await handleAgentDeregistration(targetId);
  } catch (err: any) {
    console.error("[AGENTS_DELETE_ERROR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to deregister agent" },
      { status: 500 }
    );
  }
}

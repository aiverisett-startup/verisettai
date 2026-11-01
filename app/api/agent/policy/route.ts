import { NextRequest, NextResponse } from "next/server";
import { getAgentPolicy, saveAgentPolicy } from "@/lib/settlement/policyEvaluator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId") || "default-agent";
    const policy = await getAgentPolicy(agentId);
    return NextResponse.json({ success: true, policy });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch policy" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, maxPerTxSpend, dailySpendLimit, allowedNodes, requireProof } = body;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId is required" },
        { status: 400 }
      );
    }

    const updated = await saveAgentPolicy({
      agentId,
      maxPerTxSpend: maxPerTxSpend !== undefined ? Number(maxPerTxSpend) : undefined,
      dailySpendLimit: dailySpendLimit !== undefined ? Number(dailySpendLimit) : undefined,
      allowedNodes: Array.isArray(allowedNodes) ? allowedNodes : undefined,
      requireProof: requireProof !== undefined ? Boolean(requireProof) : undefined,
    });

    return NextResponse.json({ success: true, policy: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update policy" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createAgreement, listAgreements } from "@/lib/settlement/stateMachine";
import { ensureSettlementSeed } from "@/lib/settlement/seed";

export async function GET(req: NextRequest) {
  try {
    await ensureSettlementSeed();
    const agreements = await listAgreements();
    return NextResponse.json({ success: true, agreements });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list agreements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      buyerAgentId,
      workerAgentId,
      escrowAmountPaise,
      platformTakeRate,
      verificationMethod,
      acceptanceRules,
      parentAgreementId,
      challengeWindowHours,
    } = body;

    if (!buyerAgentId || !workerAgentId || !escrowAmountPaise) {
      return NextResponse.json(
        { success: false, error: "buyerAgentId, workerAgentId, and escrowAmountPaise are required" },
        { status: 400 }
      );
    }

    const agreement = await createAgreement({
      buyerAgentId,
      workerAgentId,
      escrowAmountPaise: Number(escrowAmountPaise),
      platformTakeRate: platformTakeRate ? Number(platformTakeRate) : 0.02,
      verificationMethod,
      acceptanceRules,
      parentAgreementId,
      challengeWindowHours,
    });

    return NextResponse.json({ success: true, agreement });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create agreement" },
      { status: 500 }
    );
  }
}

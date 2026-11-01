import { NextRequest, NextResponse } from "next/server";
import { getAgreement, transitionSettlement } from "@/lib/settlement/stateMachine";
import { ensureSettlementSeed } from "@/lib/settlement/seed";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSettlementSeed();
    const { id } = await params;
    const agreement = await getAgreement(id);

    if (!agreement) {
      return NextResponse.json(
        { success: false, error: "Agreement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, agreement });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch agreement" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { targetState, deliverablePayload, proofAttestation, challengeReason } = body;

    if (!targetState) {
      return NextResponse.json(
        { success: false, error: "targetState is required" },
        { status: 400 }
      );
    }

    const result = await transitionSettlement({
      agreementIdOrHash: id,
      targetState,
      deliverablePayload,
      proofAttestation,
      challengeReason,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, previousState: result.previousState },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Transition execution error" },
      { status: 500 }
    );
  }
}

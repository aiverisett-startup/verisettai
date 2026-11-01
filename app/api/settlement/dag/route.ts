import { NextRequest, NextResponse } from "next/server";
import { buildTaskDependencyTree } from "@/lib/settlement/dagEngine";
import { listAgreements } from "@/lib/settlement/stateMachine";
import { ensureSettlementSeed } from "@/lib/settlement/seed";

export async function GET(req: NextRequest) {
  try {
    await ensureSettlementSeed();
    const { searchParams } = new URL(req.url);
    let rootId = searchParams.get("rootId");

    if (!rootId) {
      // Find the first parent or root agreement
      const agreements = await listAgreements();
      const root = agreements.find((a) => !a.parentAgreementId) || agreements[0];
      if (root) {
        rootId = root.id;
      }
    }

    if (!rootId) {
      return NextResponse.json({ success: true, tree: null });
    }

    const tree = await buildTaskDependencyTree(rootId);
    return NextResponse.json({ success: true, tree });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to build DAG tree" },
      { status: 500 }
    );
  }
}

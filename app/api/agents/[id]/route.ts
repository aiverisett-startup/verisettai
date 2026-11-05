import { NextRequest, NextResponse } from "next/server";
import { handleAgentDeregistration } from "../route";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await handleAgentDeregistration(id);
  } catch (err: any) {
    console.error("[AGENT_BY_ID_DELETE_ERROR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to deregister agent" },
      { status: 500 }
    );
  }
}


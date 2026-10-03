import { NextRequest, NextResponse } from "next/server";
import { globalSandboxRouter } from "@/src/api/sandbox";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const outcome = await globalSandboxRouter.handleAssert(body);

    return NextResponse.json(outcome.body, {
      status: outcome.statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Settlement-Latency-Ms": String(outcome.body.settlement_latency_ms),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal clearinghouse error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    },
  });
}

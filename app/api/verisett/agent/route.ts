import { NextRequest, NextResponse } from "next/server";
import { getAgentAccount } from "@/lib/verisettDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let key = searchParams.get("key");

    // Also check headers
    if (!key) {
      const auth = req.headers.get("authorization") || req.headers.get("x-api-key");
      if (auth) {
        key = auth.replace(/^Bearer\s+/i, "").trim();
      }
    }

    // Default to the active agent key if none passed
    if (!key) {
      key = "vrs_live_aiverisettgmailcom89f72b";
    }

    const agent = getAgentAccount(key);

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: "Agent account not found in verisett.db",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: agent.id,
      name: agent.name,
      role: agent.role,
      balance_cents: agent.balance_cents,
      balance_credits: agent.balance_credits,
      frozen_cents: agent.frozen_cents,
      currency: agent.currency,
      status: agent.status,
      created_at: agent.created_at,
      updated_at: agent.updated_at,
      agent,
      account: agent,
    });
  } catch (error: any) {
    console.error("Error querying agent in verisett.db:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal database error",
      },
      { status: 500 }
    );
  }
}

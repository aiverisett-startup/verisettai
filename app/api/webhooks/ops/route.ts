import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { runGeminiOperationsEngine } from "@/lib/geminiOpsTools";

export const dynamic = "force-dynamic";

/**
 * Inbound Operations Webhook Route
 * Accepts inbound triggers:
 * - Customer email inquiry / support questions
 * - Failed FastMCP handshakes or MCP client disconnections
 * - Escrow threshold breach or dispute reports
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const triggerType = body.trigger_type || body.type || "INBOUND_INQUIRY";
    const customerEmail = body.customer_email || body.email || body.from || undefined;
    const agentId = body.agent_id || body.agentId || undefined;
    const message = body.message || body.query || body.details || body.error || "No details provided";
    const subject = body.subject || "Inbound Operation Inquiry";

    // 1. Generate / Validate Idempotency Key
    let idempotencyKey = body.idempotency_key;
    if (!idempotencyKey) {
      const minuteBucket = new Date().toISOString().slice(0, 16); // 1-minute window
      const rawString = `${triggerType}_${customerEmail || agentId || "anon"}_${message.slice(0, 50)}_${minuteBucket}`;
      idempotencyKey = `wh_${crypto.createHash("sha256").update(rawString).digest("hex").slice(0, 24)}`;
    }

    const contextDescription = `Inbound Operational Trigger: ${triggerType}
Subject: ${subject}
Customer/Developer: ${customerEmail || "Not specified"}
Target Agent Node: ${agentId || "Not specified"}
Message/Incident Content: ${message}`;

    // 2. Dispatch to 24/7 Gemini Operations Copilot
    const result = await runGeminiOperationsEngine({
      triggerType,
      idempotencyKey,
      agentId,
      customerEmail,
      rawPayload: body,
      contextDescription,
    });

    return NextResponse.json({
      status: "success",
      idempotencyKey,
      triggerType,
      geminiOps: result,
    });
  } catch (err: any) {
    console.error("[WEBHOOK-OPS-ERROR]", err);
    return NextResponse.json(
      { error: "Webhook processing failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for ops webhook
 */
export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Verisett Gemini Autonomous Operations Webhook Rail",
    version: "2.5-flash",
    model: process.env.GEMINI_OPS_MODEL || "gemini-2.5-flash",
    timestamp: new Date().toISOString(),
  });
}

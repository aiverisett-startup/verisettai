import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { markQrPaid } from "@/lib/qrStore";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Anti-replay deduplication cache for webhook event IDs
const processedWebhookEventIds = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    // 1. Capture raw request body bytes for HMAC-SHA256 signature verification
    const rawBodyBuffer = Buffer.from(await req.arrayBuffer());
    const rawBodyString = rawBodyBuffer.toString("utf8");

    const signature =
      req.headers.get("x-razorpay-signature") ||
      req.headers.get("X-Razorpay-Signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing required X-Razorpay-Signature header." },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[RAZORPAY_WEBHOOK] RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json(
        { error: "Server configuration error: Webhook secret missing." },
        { status: 500 }
      );
    }

    // 2. Validate cryptographic signature using constant-time comparison
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBodyBuffer)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      console.warn("[RAZORPAY_WEBHOOK] Signature mismatch detected.");
      return NextResponse.json(
        { error: "Invalid webhook cryptographic signature." },
        { status: 400 }
      );
    }

    // 3. Parse JSON payload
    let eventPayload: Record<string, any>;
    try {
      eventPayload = JSON.parse(rawBodyString);
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON payload." },
        { status: 400 }
      );
    }

    const eventName = eventPayload.event;
    const eventId =
      eventPayload.id ||
      `evt_${crypto.createHash("sha256").update(rawBodyString).digest("hex").slice(0, 16)}`;

    // Anti-replay check
    if (processedWebhookEventIds.has(eventId)) {
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }
    processedWebhookEventIds.add(eventId);
    if (processedWebhookEventIds.size > 10000) {
      processedWebhookEventIds.clear();
    }

    console.log(`[RAZORPAY_WEBHOOK_EVENT]: ${eventName} (ID: ${eventId})`);

    // 4. Handle QR credited or payment captured events
    if (
      eventName === "qr_code.credited" ||
      eventName === "payment.captured" ||
      eventName === "order.paid"
    ) {
      const qrEntity = eventPayload.payload?.qr_code?.entity || {};
      const paymentEntity = eventPayload.payload?.payment?.entity || {};

      const qrCodeId: string =
        qrEntity.id ||
        paymentEntity.qr_code_id ||
        eventPayload.qr_code_id ||
        paymentEntity.notes?.qr_id ||
        "";

      const paymentId: string =
        paymentEntity.id ||
        eventPayload.payload?.payment?.id ||
        eventPayload.payment_id ||
        `pay_manual_${Date.now()}`;

      const amount: number = Number(
        paymentEntity.amount ||
        qrEntity.payments_amount_received ||
        eventPayload.amount ||
        0
      );

      const notes = {
        ...(paymentEntity.notes || {}),
        ...(qrEntity.notes || {}),
      };

      console.log("[RAZORPAY_WEBHOOK_PROCESSED]", {
        eventName,
        qrCodeId,
        paymentId,
        amount,
        notes,
      });

      // Update in-memory / local fast lookup store
      if (qrCodeId) {
        markQrPaid(qrCodeId, paymentId, amount);
      }

      // Update Supabase records if customer/agent notes are present
      const agentId = notes.agent_id || notes.agentId;
      const email = notes.email || paymentEntity.email;

      if (agentId || email) {
        try {
          if (agentId) {
            await supabaseAdmin
              .from("plan_registrations")
              .update({
                payment_status: "verified_upi_qr",
                payment_utr: paymentId,
              })
              .eq("agent_id", agentId);
          }
        } catch (dbErr) {
          console.warn("[RAZORPAY_WEBHOOK] Non-fatal DB sync notice:", dbErr);
        }
      }
    }

    // 5. Acknowledge receipt to Razorpay
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err: any) {
    console.error("[RAZORPAY_WEBHOOK_HANDLER_ERROR]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal webhook handling failure." },
      { status: 500 }
    );
  }
}

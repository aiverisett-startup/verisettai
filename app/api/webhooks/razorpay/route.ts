import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { markQrPaid } from "@/lib/qrStore";

// Deduplication cache to prevent re-processing identical webhook events
const processedEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    // 1. Extract raw string payload exactly as required for HMAC SHA256 validation
    const rawBody = await req.text();

    // 2. Read signature header
    const signature =
      req.headers.get("x-razorpay-signature") ||
      req.headers.get("X-Razorpay-Signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Invalid signature: Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET?.trim().replace(/^["']|["']$/g, "") ||
      "veri_sett_live_webhook_secret_2026";

    // 3. Cryptographic signature verification using HMAC SHA256
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      console.warn("[RAZORPAY_WEBHOOK_SECURITY] Signature verification failed.");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // 4. Parse verified webhook JSON payload
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON payload" },
        { status: 400 }
      );
    }

    const eventName = payload.event;
    const eventId = payload.id || `evt_${Date.now()}`;

    // Deduplication check
    if (processedEvents.has(eventId)) {
      return NextResponse.json({ status: "ok", notice: "already_processed" }, { status: 200 });
    }
    processedEvents.add(eventId);
    if (processedEvents.size > 10000) {
      processedEvents.clear();
    }

    console.log(`[RAZORPAY_WEBHOOK_PROCESSED]: ${eventName} (${eventId})`);

    // 5. Handle payment.captured or order.paid
    if (eventName === "payment.captured" || eventName === "order.paid") {
      const payment = payload.payload?.payment?.entity || {};
      const order = payload.payload?.order?.entity || {};

      const order_id: string = order.id || payment.order_id || "";
      const payment_id: string = payment.id || "";
      const amountPaise: number = Number(payment.amount || order.amount || 0);
      const email: string = (payment.email || payment.notes?.email || order.notes?.email || "").toLowerCase().trim();

      // Determine appropriate plan tier from notes or amount
      const rawPlanId = payment.notes?.planId || payment.notes?.tier_id || order.notes?.planId || "";
      let tierKey = "BUILDER";
      let tierName = "Builder Protocol";

      if (rawPlanId) {
        const lower = String(rawPlanId).toLowerCase();
        if (lower.includes("builder") || lower.includes("tier_1")) {
          tierKey = "BUILDER";
          tierName = "Builder Protocol";
        } else if (lower.includes("growth") || lower.includes("settlement") || lower.includes("node")) {
          tierKey = "GROWTH";
          tierName = "Settlement Node";
        } else if (lower.includes("enterprise") || lower.includes("scale")) {
          tierKey = "ENTERPRISE";
          tierName = "Enterprise Scale";
        }
      } else {
        // Fallback by amount in paise
        if (amountPaise <= 2000) {
          tierKey = "BUILDER";
          tierName = "Builder Protocol";
        } else if (amountPaise <= 1500000) {
          tierKey = "GROWTH";
          tierName = "Settlement Node";
        } else {
          tierKey = "ENTERPRISE";
          tierName = "Enterprise Scale";
        }
      }

      // Mark local QR store if paid via dynamic QR
      if (order_id) {
        markQrPaid(order_id, payment_id, amountPaise);
      }

      // Update Database Status: Provision user tier & activate subscription
      try {
        if (email) {
          // 1. Update user profile if exists
          await supabaseAdmin
            .from("profiles")
            .update({
              plan_tier: tierKey,
              updated_at: new Date().toISOString(),
            })
            .eq("email", email);

          // 2. Upsert plan registration record
          await supabaseAdmin
            .from("plan_registrations")
            .upsert(
              {
                email: email,
                plan_tier: tierKey,
                is_paid: true,
                reservation_code: `ORD-${(order_id || payment_id).slice(-6).toUpperCase()}`,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "email" }
            );
        }

        // 3. Insert immutable ledger entry record
        await supabaseAdmin.from("ledger_entries").insert({
          transaction_id: payment_id || `txn_${Date.now()}`,
          escrow_id: order_id || `escrow_${Date.now()}`,
          entry_type: "CREDIT",
          amount: Math.round(amountPaise),
          currency: payment.currency || "INR",
          description: `Razorpay fulfillment for ${tierName} (${order_id})`,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr: any) {
        console.warn("[RAZORPAY_WEBHOOK_DB_NOTICE]:", dbErr?.message || dbErr);
      }
    }

    // 6. Return HTTP 200 immediately to prevent Razorpay delivery timeouts
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err: any) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]:", err);
    // Return HTTP 200 to acknowledge webhook reception even on unexpected error to stop endless retries
    return NextResponse.json({ status: "ok", error: err?.message }, { status: 200 });
  }
}

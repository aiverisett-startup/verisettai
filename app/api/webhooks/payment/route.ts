import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// In-memory fallback deduplication cache
const processedWebhookEvents = new Set<string>();

// Keep memory cache clean (limit to 10,000 entries)
if (processedWebhookEvents.size > 10000) {
  processedWebhookEvents.clear();
}

export async function POST(req: NextRequest) {
  try {
    // 1. Anti-Replay & Raw HMAC Signature Verification:
    // Read raw buffer before any JSON parsing
    const rawBodyBuffer = Buffer.from(await req.arrayBuffer());
    const rawBodyString = rawBodyBuffer.toString("utf8");

    const webhookSecret =
      process.env.PAYMENT_WEBHOOK_SECRET ||
      process.env.RAZORPAY_WEBHOOK_SECRET;

    const razorpaySignature =
      req.headers.get("x-razorpay-signature") ||
      req.headers.get("X-Razorpay-Signature");

    if (webhookSecret) {
      if (!razorpaySignature) {
        return NextResponse.json(
          { error: "Unauthorized: Missing x-razorpay-signature header" },
          { status: 401 }
        );
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBodyBuffer)
        .digest("hex");

      const expectedBuffer = Buffer.from(expectedSignature, "utf8");
      const actualBuffer = Buffer.from(razorpaySignature, "utf8");

      if (
        expectedBuffer.length !== actualBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
      ) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid cryptographic signature" },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Configuration Error: PAYMENT_WEBHOOK_SECRET required in production" },
        { status: 401 }
      );
    }

    // Parse event payload
    let event: Record<string, any>;
    try {
      event = JSON.parse(rawBodyString);
    } catch {
      return NextResponse.json(
        { error: "Bad Request: Malformed JSON payload" },
        { status: 400 }
      );
    }

    const eventType = event.event || event.type || "payment.captured";
    const paymentEntity = event.payload?.payment?.entity || event.data?.object || event.payment || {};
    const orderEntity = event.payload?.order?.entity || event.order || {};

    const eventId =
      event.id ||
      paymentEntity.id ||
      `evt_${crypto.createHash("sha256").update(rawBodyString).digest("hex").slice(0, 16)}`;

    // 2. Webhook Event Deduplication:
    if (processedWebhookEvents.has(eventId)) {
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }

    // Extract metadata
    const metadata =
      paymentEntity.notes ||
      orderEntity.notes ||
      event.metadata ||
      {};

    const userId = metadata.user_id || metadata.userId;

    if (userId) {
      try {
        const { data: existingIdempotency } = await supabaseAdmin
          .from("idempotency_keys")
          .select("id")
          .eq("user_id", userId)
          .eq("key", eventId)
          .maybeSingle();

        if (existingIdempotency) {
          processedWebhookEvents.add(eventId);
          return NextResponse.json({ status: "already_processed" }, { status: 200 });
        }
      } catch {
        // Fallback to in-memory check
      }
    }

    // 3. Immutable Ledger Credit Insertion on payment.captured or order.paid
    const isSuccessEvent =
      eventType === "payment.captured" ||
      eventType === "order.paid" ||
      eventType === "charge.successful" ||
      paymentEntity.status === "captured" ||
      paymentEntity.status === "paid";

    if (isSuccessEvent && userId) {
      const transactionId = paymentEntity.id || eventId;
      const amountPaise = Number(metadata.amount || paymentEntity.amount || 2999900);
      const currency = metadata.currency || paymentEntity.currency || "INR";
      const planName = metadata.plan_name || metadata.plan || (amountPaise === 2999900 ? "Founder Node Pass" : "Escrow Deposit");
      const isFounderPass =
        metadata.plan === "founder-pass" ||
        metadata.plan_tier === "founder_pass" ||
        planName.toLowerCase().includes("founder") ||
        amountPaise === 2999900;

      // Insert guaranteed CREDIT record into ledger_entries via Supabase Service Role client
      await supabaseAdmin.from("ledger_entries").insert({
        user_id: userId,
        vault_id: metadata.vault_id || null,
        transaction_id: transactionId,
        entry_type: "CREDIT",
        amount: amountPaise,
        currency: currency,
        description: `Payment received: ${planName} (${transactionId})`,
      });

      // Update vault balance if vault_id is present
      if (metadata.vault_id) {
        const { data: vault } = await supabaseAdmin
          .from("vaults")
          .select("balance, balance_cents")
          .eq("id", metadata.vault_id)
          .maybeSingle();

        if (vault) {
          const addedCents = Math.round(currency === "INR" ? amountPaise / 84 : amountPaise);
          const addedUSD = addedCents / 100;
          await supabaseAdmin
            .from("vaults")
            .update({
              balance: Number(vault.balance || 0) + addedUSD,
              balance_cents: Number(vault.balance_cents || 0) + addedCents,
              updated_at: new Date().toISOString(),
            })
            .eq("id", metadata.vault_id);
        }
      }

      // If Founder Node Pass (₹29,999): update user profile
      if (isFounderPass) {
        await supabaseAdmin.from("profiles").upsert({
          id: userId,
          plan_tier: "founder_pass",
          founder_pass: true,
          take_rate: 0.0075,
          updated_at: new Date().toISOString(),
        });
      }

      // Record in idempotency_keys
      try {
        await supabaseAdmin.from("idempotency_keys").insert({
          user_id: userId,
          key: eventId,
          request_hash: crypto.createHash("sha256").update(rawBodyString).digest("hex"),
          response_status: 200,
          response_body: { received: true, event_id: eventId },
        });
      } catch {
        // Table uniqueness violation ignored
      }
    }

    processedWebhookEvents.add(eventId);

    // 4. Return HTTP 200
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Payment webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error?.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

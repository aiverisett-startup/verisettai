import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient, getRazorpayPublicKey } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const keyId =
      process.env.RAZORPAY_KEY_ID?.trim().replace(/^["']|["']$/g, "") ||
      "rzp_live_TuVilsV1O3QDBS";
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET?.trim().replace(/^["']|["']$/g, "") ||
      "WHUWenzLXy03uJDaRib18rJ5";

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload. Expected JSON object with 'amount'." },
        { status: 400 }
      );
    }

    const { planId, amount, currency = "INR", receipt, notes } = body;

    let targetAmount = Number(amount);

    // Map or validate tier pricing
    const normalizedPlanId = typeof planId === "string" ? planId.toLowerCase().trim() : "";
    if (normalizedPlanId === "builder" || normalizedPlanId.includes("builder")) {
      // Builder Protocol: ₹2,500 base + 18% GST (₹450) = ₹2,950 = 295000 paise
      targetAmount = 295000;
    } else if (normalizedPlanId === "growth" || normalizedPlanId.includes("growth")) {
      targetAmount = 943900;
    } else if (normalizedPlanId === "enterprise" || normalizedPlanId.includes("enterprise")) {
      targetAmount = 3539900;
    }

    // Validate amount: must be a valid integer/number and at least 100 paise (₹1)
    if (!Number.isFinite(targetAmount) || targetAmount < 100) {
      return NextResponse.json(
        {
          error: "Invalid amount. Minimum allowable order amount is 100 paise (₹1).",
        },
        { status: 400 }
      );
    }

    const sanitizedAmount = parseInt(String(Math.round(targetAmount)), 10);
    const sanitizedCurrency =
      typeof currency === "string" && currency.trim().length > 0
        ? currency.toUpperCase().trim()
        : "INR";
    const sanitizedReceipt =
      typeof receipt === "string" && receipt.trim().length > 0
        ? receipt.trim().slice(0, 40)
        : `receipt_${Date.now()}`;

    const razorpay = getRazorpayClient();
    const publicKeyId = getRazorpayPublicKey();

    // Call Razorpay Orders API with payment_capture: 1
    const orderOptions: any = {
      amount: sanitizedAmount,
      currency: sanitizedCurrency,
      receipt: sanitizedReceipt,
      payment_capture: 1,
      notes: {
        ...(notes && typeof notes === "object" ? notes : {}),
        ...(planId ? { planId: String(planId) } : {}),
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      orderId: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: publicKeyId,
    });
  } catch (err: any) {
    console.error("[RAZORPAY_CREATE_ORDER_ERROR]:", err);
    const errorMessage =
      err?.error?.description ||
      err?.message ||
      "Failed to create Razorpay payment order.";
    const statusCode = typeof err?.statusCode === "number" ? err.statusCode : 500;

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}

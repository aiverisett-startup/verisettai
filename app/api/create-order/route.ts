import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient, getRazorpayPublicKey } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Check for server environment credentials before processing
    const keyId = process.env.RAZORPAY_KEY_ID?.trim().replace(/^["']|["']$/g, "");
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim().replace(/^["']|["']$/g, "");

    if (!keyId || !keySecret) {
      console.error("[RAZORPAY_CONFIG_ERROR]: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing on server.");
      return NextResponse.json(
        {
          error: "Razorpay credentials missing: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured in environment variables.",
          code: "CREDENTIALS_MISSING",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload. Expected JSON object with 'amount'." },
        { status: 400 }
      );
    }

    const { amount, currency = "INR", receipt, notes } = body;

    // Validate amount: must be a valid integer/number and at least 100 paise (₹1)
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 100) {
      return NextResponse.json(
        {
          error: "Invalid amount. Minimum allowable order amount is 100 paise (₹1).",
        },
        { status: 400 }
      );
    }

    const sanitizedAmount = parseInt(String(Math.round(numericAmount)), 10);
    const sanitizedCurrency =
      typeof currency === "string" && currency.trim().length > 0
        ? currency.toUpperCase().trim()
        : "INR";
    const sanitizedReceipt =
      typeof receipt === "string" && receipt.trim().length > 0
        ? receipt.trim().slice(0, 40)
        : `rcpt_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`;

    const razorpay = getRazorpayClient();
    const publicKeyId = getRazorpayPublicKey();

    // Call Razorpay Orders API with payment_capture: 1
    const orderOptions: any = {
      amount: sanitizedAmount,
      currency: sanitizedCurrency,
      receipt: sanitizedReceipt,
      payment_capture: 1,
    };

    if (notes && typeof notes === "object") {
      orderOptions.notes = notes;
    }

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
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

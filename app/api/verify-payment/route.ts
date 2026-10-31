import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload. Expected JSON body with payment verification details.",
        },
        { status: 400 }
      );
    }

    // Accept standard razorpay keys as well as simplified aliases
    const orderId = body.razorpay_order_id || body.order_id;
    const paymentId = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: 'razorpay_order_id', 'razorpay_payment_id', and 'razorpay_signature' must be provided.",
        },
        { status: 400 }
      );
    }

    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid field types: all verification fields must be strings.",
        },
        { status: 400 }
      );
    }

    const rawSecret = process.env.RAZORPAY_KEY_SECRET;
    const secret = rawSecret?.trim().replace(/^["']|["']$/g, "");
    if (!secret) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error: RAZORPAY_KEY_SECRET is missing.",
        },
        { status: 500 }
      );
    }

    // Compute expected HMAC-SHA256 signature: ${order_id}|${payment_id}
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId.trim()}|${paymentId.trim()}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const actualBuffer = Buffer.from(signature.trim(), "utf8");

    // Constant-time comparison to prevent timing side-channel attacks
    const isSignatureValid =
      expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);

    if (!isSignatureValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Signature verification failed: Invalid HMAC-SHA256 signature.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      payment_id: paymentId,
      message: "Payment signature verified successfully.",
    });
  } catch (err: any) {
    console.error("[RAZORPAY_VERIFY_PAYMENT_ERROR]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal error during payment verification.",
      },
      { status: 500 }
    );
  }
}

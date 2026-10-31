import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import { saveQrRecord } from "@/lib/qrStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload. Expected JSON body with 'amount'." },
        { status: 400 }
      );
    }

    const { amount, description, customer_name } = body;

    // Validate amount: numeric and at least 100 paise (₹1)
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 100) {
      return NextResponse.json(
        {
          error: "Invalid amount. Minimum amount is 100 paise (₹1).",
        },
        { status: 400 }
      );
    }

    const sanitizedAmount = Math.round(numericAmount);
    const sanitizedCustomerName =
      typeof customer_name === "string" && customer_name.trim().length > 0
        ? customer_name.trim().slice(0, 40)
        : "Verisett Operator";
    const sanitizedDescription =
      typeof description === "string" && description.trim().length > 0
        ? description.trim().slice(0, 255)
        : "Verisett Protocol Settlement QR";

    const razorpay = getRazorpayClient();

    // Create a dynamic single-use UPI QR code via Razorpay
    const qrPayload: any = {
      type: "upi_qr",
      name: sanitizedCustomerName,
      usage: "single_use",
      fixed_amount: true,
      payment_amount: sanitizedAmount,
      description: sanitizedDescription,
    };

    const qr: any = await razorpay.qrCode.create(qrPayload);

    if (!qr || !qr.id) {
      throw new Error("Razorpay returned an empty QR code response.");
    }

    // Convert to Base64 data URL so it never fails or gets blocked by CSP/ad-blockers
    let resolvedImageUrl = qr.image_url;
    try {
      const imgRes = await fetch(qr.image_url);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        resolvedImageUrl = `data:image/png;base64,${base64}`;
      }
    } catch (fetchErr) {
      console.warn("[QR_IMAGE_CONVERT_NOTICE]:", fetchErr);
    }

    // Cache the record for polling & webhook matching
    saveQrRecord({
      qr_id: qr.id,
      image_url: qr.image_url,
      amount: qr.payment_amount || sanitizedAmount,
      description: sanitizedDescription,
      customer_name: sanitizedCustomerName,
      status: "active",
      created_at: Date.now(),
    });

    return NextResponse.json({
      qr_id: qr.id,
      image_url: resolvedImageUrl,
      amount: qr.payment_amount || sanitizedAmount,
    });
  } catch (err: any) {
    console.error("[RAZORPAY_CREATE_QR_ERROR]:", err);
    const statusCode = err?.statusCode || 500;
    const errorMsg =
      err?.error?.description ||
      err?.message ||
      "Failed to generate dynamic Razorpay UPI QR code.";

    return NextResponse.json(
      {
        error: errorMsg,
      },
      { status: statusCode }
    );
  }
}

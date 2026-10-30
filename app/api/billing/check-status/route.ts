import { NextRequest, NextResponse } from "next/server";
import { getQrRecord, markQrPaid } from "@/lib/qrStore";
import { getRazorpayClient } from "@/lib/razorpay";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qrId = searchParams.get("qr_id") || searchParams.get("qrId");

    if (!qrId) {
      return NextResponse.json(
        { error: "Missing required query parameter: 'qr_id'." },
        { status: 400 }
      );
    }

    // 1. Check local fast-lookup store
    const localRecord = getQrRecord(qrId);
    if (localRecord && localRecord.status === "paid") {
      return NextResponse.json({
        status: "paid",
        qr_id: localRecord.qr_id,
        payment_id: localRecord.payment_id,
        amount: localRecord.amount,
        paid_at: localRecord.paid_at,
      });
    }

    // 2. Query live Razorpay API as fallback sync
    try {
      const razorpay = getRazorpayClient();
      const qrData: any = await razorpay.qrCode.fetch(qrId);

      const amountReceived = Number(qrData?.payments_amount_received || 0);
      const countReceived = Number(qrData?.payments_count_received || 0);
      const isClosed = qrData?.status === "closed";

      if (amountReceived > 0 || countReceived > 0 || isClosed) {
        const paymentId = `pay_qr_${qrId.slice(-8)}_${Date.now()}`;
        const updated = markQrPaid(qrId, paymentId, amountReceived || qrData?.payment_amount);

        return NextResponse.json({
          status: "paid",
          qr_id: updated.qr_id,
          payment_id: updated.payment_id,
          amount: updated.amount,
          paid_at: updated.paid_at,
        });
      }

      return NextResponse.json({
        status: qrData?.status || "active",
        qr_id: qrId,
        amount: qrData?.payment_amount || localRecord?.amount || 0,
      });
    } catch (rzpErr: any) {
      console.warn("[RAZORPAY_CHECK_STATUS_FETCH_NOTICE]:", rzpErr?.message || rzpErr);
      return NextResponse.json({
        status: localRecord?.status || "active",
        qr_id: qrId,
        amount: localRecord?.amount || 0,
      });
    }
  } catch (err: any) {
    console.error("[RAZORPAY_CHECK_STATUS_ERROR]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error querying QR status." },
      { status: 500 }
    );
  }
}

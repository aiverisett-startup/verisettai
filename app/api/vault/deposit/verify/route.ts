import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required verification parameters: order_id, payment_id, signature",
        },
        { status: 400 }
      );
    }

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET?.trim().replace(/^["']|["']$/g, "") ||
      "WHUWenzLXy03uJDaRib18rJ5";

    // 1. Verify cryptographic HMAC SHA256 signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("[VAULT_VERIFY_SIGNATURE_MISMATCH]:", {
        expected: generatedSignature,
        received: razorpay_signature,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Cryptographic payment signature verification failed",
        },
        { status: 400 }
      );
    }

    // 2. Query matching VaultTransaction
    const transaction = await prisma.vaultTransaction.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { vault: true },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "No pending vault transaction found for order ID",
        },
        { status: 404 }
      );
    }

    // 3. Idempotency check: if already completed, return existing balance without re-incrementing
    if (transaction.status === "COMPLETED") {
      const currentBalance = Number(transaction.vault.balancePaise);
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        newBalancePaise: currentBalance,
        balanceInr: (currentBalance / 100).toFixed(2),
        currency: transaction.vault.currency,
      });
    }

    // 4. Update transaction status & atomically increment UserVault balance in a transaction
    const [updatedTx, updatedVault] = await prisma.$transaction([
      prisma.vaultTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          razorpayPaymentId: razorpay_payment_id,
        },
      }),
      prisma.userVault.update({
        where: { id: transaction.vaultId },
        data: {
          balancePaise: {
            increment: transaction.amountPaise,
          },
        },
      }),
    ]);

    const newBalancePaise = Number(updatedVault.balancePaise);
    const balanceInr = (newBalancePaise / 100).toFixed(2);
    const balanceUsd = (newBalancePaise / 100 / 84.0).toFixed(2);

    console.log(
      `[VAULT_DEPOSIT_SETTLED]: Vault ${updatedVault.id} credited with ₹${(
        Number(transaction.amountPaise) / 100
      ).toFixed(2)}. New balance: ₹${balanceInr}`
    );

    return NextResponse.json({
      success: true,
      transactionId: updatedTx.id,
      newBalancePaise,
      balanceInr,
      balanceUsd,
      currency: updatedVault.currency,
    });
  } catch (error: any) {
    console.error("[VAULT_DEPOSIT_VERIFY_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to verify payment and credit vault balance",
      },
      { status: 500 }
    );
  }
}


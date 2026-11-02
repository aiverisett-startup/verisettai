import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient, getRazorpayPublicKey } from "@/lib/razorpay";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { amountInr, userId: explicitUserId } = body;
    const numAmountInr = Number(amountInr);

    if (!Number.isFinite(numAmountInr) || numAmountInr < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Minimum vault deposit amount is ₹100.00",
        },
        { status: 400 }
      );
    }

    // Resolve authenticated user ID
    let userId = explicitUserId;
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        userId = user.id;
      }
    } catch {
      // Graceful session error fallback
    }

    if (!userId) {
      userId = req.headers.get("x-user-id") || "guest-operator";
    }

    // Defensive lookup or provision of UserVault
    let vault = null;
    try {
      vault = await prisma.userVault.findUnique({
        where: { userId },
      });

      if (!vault) {
        try {
          vault = await prisma.userVault.create({
            data: {
              userId,
              balancePaise: BigInt(0),
              currency: "INR",
            },
          });
        } catch {
          vault = await prisma.userVault.findUnique({
            where: { userId },
          });
        }
      }
    } catch (dbErr: any) {
      console.warn("[VAULT_DEPOSIT_DB_FALLBACK]:", dbErr?.message || dbErr);
    }

    const vaultId = vault?.id || `vlt_${userId}`;
    const amountPaise = Math.round(numAmountInr * 100);
    const razorpay = getRazorpayClient();
    const receiptId = `vlt_${Date.now().toString().slice(-8)}_${Math.random().toString(36).slice(2, 6)}`;

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        vaultId,
        userId,
        purpose: "ESCROW_VAULT_DEPOSIT",
      },
    });

    // Create pending VaultTransaction in database if connection active
    if (vault?.id) {
      try {
        await prisma.vaultTransaction.create({
          data: {
            vaultId: vault.id,
            amountPaise: BigInt(amountPaise),
            type: "DEPOSIT",
            status: "PENDING",
            razorpayOrderId: order.id,
          },
        });
      } catch (txErr: any) {
        console.warn("[VAULT_TX_RECORD_DEFERRED]:", txErr?.message || txErr);
      }
    }

    return NextResponse.json({
      success: true,
      status: "active",
      orderId: order.id,
      amountPaise,
      amountInr: numAmountInr,
      currency: "INR",
      key: getRazorpayPublicKey(),
    });
  } catch (error: any) {
    console.error("[VAULT_DEPOSIT_CREATE_ORDER_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        status: "standby",
        balancePaise: 0,
        error: error?.message || "Payment rail is temporarily in standby mode. Please retry in a moment.",
      },
      { status: 200 }
    );
  }
}

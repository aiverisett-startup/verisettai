import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // 1. Validate authenticated session via @supabase/ssr
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lpoconfurcrrkndguycr.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb2NvbmZ1cmNycmtuZGd1eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTIzNDIsImV4cCI6MjEwNDc4ODM0Mn0.3yyJUB6duad7COImmhU8afbMoDtOOi7NaaWzL8jHiTA",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Middleware handles cookies
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required to initiate checkout" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { plan = "founder-pass", amount, vaultId } = body;

    // 2. Fixed pricing & plan configuration
    let orderAmount: number;
    let planTitle: string;

    if (plan === "founder-pass") {
      orderAmount = 2999900; // Fixed at ₹29,999.00 (in paise)
      planTitle = "Verisett Founder Node Pass (Lifetime)";
    } else {
      orderAmount = amount ? Math.round(Number(amount)) : 1000000; // in paise
      planTitle = "Autonomous Escrow Vault Custody Deposit";
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // 3. Razorpay Order Generation
    if (razorpayKeyId && razorpayKeySecret) {
      try {
        const authString = Buffer.from(
          `${razorpayKeyId}:${razorpayKeySecret}`
        ).toString("base64");

        const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authString}`,
          },
          body: JSON.stringify({
            amount: orderAmount,
            currency: "INR",
            receipt: `rcpt_${crypto.randomUUID().slice(0, 12)}`,
            notes: {
              user_id: user.id,
              user_email: user.email || "",
              plan: plan,
              plan_title: planTitle,
              vault_id: vaultId || "",
            },
          }),
        });

        if (rzpResponse.ok) {
          const rzpData = await rzpResponse.json();
          return NextResponse.json({
            order_id: rzpData.id,
            amount: rzpData.amount,
            currency: rzpData.currency || "INR",
            key: razorpayKeyId,
            plan: plan,
            plan_title: planTitle,
            isSandbox: false,
            customer: {
              id: user.id,
              email: user.email || "",
            },
          });
        }
      } catch (rzpErr) {
        console.warn("Razorpay live API order creation notice:", rzpErr);
      }
    }

    // 4. Fallback / Sandbox Order Generation
    const mockOrderId = `order_mock_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    return NextResponse.json({
      order_id: mockOrderId,
      amount: orderAmount,
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
      plan: plan,
      plan_title: planTitle,
      isSandbox: true,
      customer: {
        id: user.id,
        email: user.email || "",
      },
    });
  } catch (error: any) {
    console.error("Checkout order initialization error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error?.message || "Order creation failed" },
      { status: 500 }
    );
  }
}

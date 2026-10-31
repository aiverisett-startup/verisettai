"use client";

import { RazorpayOptions, RazorpaySuccessResponse, RazorpayErrorResponse } from "@/types/razorpay";

export interface CheckoutVerificationResult {
  success: boolean;
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface OpenRazorpayCheckoutOptions {
  amount: number; // in paise (e.g. 1180 for ₹11.80)
  currency?: string;
  name?: string;
  description?: string;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  themeColor?: string;
  onSuccess: (result: CheckoutVerificationResult) => void;
  onFailure?: (error: { description: string; code?: string }) => void;
  onDismiss?: () => void;
}

/**
 * Standard Razorpay Web Checkout Orchestrator:
 * 1. Checks if window.Razorpay exists (with 500ms retry)
 * 2. Never dynamically creates script tags on click
 * 3. Creates an order via backend /api/create-order
 * 4. Launches standard modal: new window.Razorpay(options).open()
 * 5. Verifies HMAC-SHA256 signature via backend /api/verify-payment
 * 6. Handles modal dismiss and payment.failed events
 */
export async function openRazorpayCheckout({
  amount,
  currency = "INR",
  name = "Verisett AI",
  description = "Autonomous Clearinghouse Node Allocation",
  receipt,
  notes,
  prefill,
  themeColor = "#2563EB",
  onSuccess,
  onFailure,
  onDismiss,
}: OpenRazorpayCheckoutOptions): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Check if Razorpay SDK is available (static script loaded via root layout)
  if (!window.Razorpay) {
    // Retry once after 500ms
    await new Promise((res) => setTimeout(res, 500));
  }

  if (!window.Razorpay) {
    const errorMsg = "Razorpay script was blocked by browser. Please disable ad-blocker/Brave Shields and refresh.";
    console.error("[RAZORPAY_SCRIPT_BLOCKED]:", errorMsg);
    onFailure?.({ description: errorMsg });
    return;
  }

  // 2. Fetch order from backend /api/create-order
  let orderData: { order_id: string; amount: number; currency: string; key_id: string };
  try {
    const orderRes = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(Number(amount)),
        currency: currency || "INR",
        receipt,
        notes,
      }),
    });

    const data = await orderRes.json();
    if (!orderRes.ok || !data.order_id) {
      throw new Error(data.error || "Failed to create payment order.");
    }

    orderData = data;
  } catch (err: any) {
    const errorMsg = err?.message || "Order creation failed.";
    console.error("[RAZORPAY_CHECKOUT_CLIENT]:", errorMsg);
    onFailure?.({ description: errorMsg });
    return;
  }

  // 3. Configure standard Razorpay options
  // Ensure public key ID is resolved cleanly from order response or environment fallback
  const clientPublicKey =
    orderData.key_id ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID;

  if (!clientPublicKey) {
    const errorMsg = "Razorpay public key ID is missing. Please check your environment configuration.";
    console.error("[RAZORPAY_PUBLIC_KEY_MISSING]:", errorMsg);
    onFailure?.({ description: errorMsg });
    return;
  }

  const options: RazorpayOptions = {
    key: clientPublicKey,
    amount: orderData.amount,
    currency: orderData.currency,
    name,
    description,
    order_id: orderData.order_id,
    prefill,
    notes,
    theme: {
      color: themeColor,
    },
    // Handler invoked upon successful client-side authorization
    handler: async (response: RazorpaySuccessResponse) => {
      try {
        // Forward credentials to backend verification endpoint
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || "Cryptographic signature verification failed.");
        }

        onSuccess({
          success: true,
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      } catch (err: any) {
        console.error("[RAZORPAY_VERIFICATION_CLIENT]:", err);
        onFailure?.({
          description: err?.message || "Payment verification failed on the server.",
        });
      }
    },
    modal: {
      ondismiss: () => {
        onDismiss?.();
      },
    },
  };

  // 4. Initialize and open Razorpay modal
  try {
    const rzp = new window.Razorpay(options);

    // 5. Handle failure event
    rzp.on("payment.failed", (resp: { error: RazorpayErrorResponse }) => {
      console.error("[RAZORPAY_PAYMENT_FAILED]:", resp.error);
      onFailure?.({
        description: resp.error?.description || "Payment failed. Please try again.",
        code: resp.error?.code,
      });
    });

    rzp.open();
  } catch (err: any) {
    console.error("[RAZORPAY_MODAL_OPEN_ERROR]:", err);
    onFailure?.({
      description: "Unable to initialize payment gateway window. Please disable ad-blockers and try again.",
    });
  }
}

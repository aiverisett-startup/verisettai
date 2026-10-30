"use client";

import { RazorpayOptions, RazorpaySuccessResponse, RazorpayErrorResponse } from "@/types/razorpay";

/**
 * Dynamically loads the official Razorpay Checkout SDK (checkout.js).
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag is already in DOM
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout script from checkout.razorpay.com");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface CheckoutVerificationResult {
  success: boolean;
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface OpenRazorpayCheckoutOptions {
  amount: number; // in paise (e.g. 250000 for ₹2,500)
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
 * 1. Ensures checkout.js is loaded
 * 2. Creates an order via backend /api/create-order
 * 3. Launches standard modal
 * 4. Verifies HMAC-SHA256 signature via backend /api/verify-payment
 * 5. Handles modal dismiss and payment.failed events
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
  // 1. Ensure SDK is loaded
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    const errorMsg = "Unable to load Razorpay payment SDK. Please check your network connection.";
    console.error(errorMsg);
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
        amount,
        currency,
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
  const options: RazorpayOptions = {
    key: orderData.key_id,
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
}

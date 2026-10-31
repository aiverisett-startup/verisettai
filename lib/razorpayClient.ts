"use client";

import { RazorpayOptions, RazorpaySuccessResponse, RazorpayErrorResponse } from "@/types/razorpay";

/**
 * Dynamically loads the official Razorpay Checkout SDK (checkout.js) with timeout protection.
 */
export function loadRazorpayScript(timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    let isSettled = false;
    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        console.warn("[RAZORPAY_LOAD_TIMEOUT]: SDK script load timed out after", timeoutMs, "ms");
        resolve(false);
      }
    }, timeoutMs);

    // Check if script tag is already in DOM
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          resolve(true);
        }
      });
      existingScript.addEventListener("error", () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          resolve(false);
        }
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };
    script.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        console.error("Failed to load Razorpay Checkout script from checkout.razorpay.com");
        resolve(false);
      }
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
 * 1. Ensures checkout.js is loaded (with 4s timeout fallback)
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
  // 1. Ensure SDK is loaded within 4 seconds
  const isLoaded = await loadRazorpayScript(4000);
  if (!isLoaded || !window.Razorpay) {
    const errorMsg = "Gateway connection timeout. Please check ad-blockers or try again.";
    console.error(errorMsg);
    onFailure?.({ description: errorMsg });
    return;
  }

  // 2. Fetch order from backend /api/create-order with timeout protection
  let orderData: { order_id: string; amount: number; currency: string; key_id: string };
  try {
    const controller = new AbortController();
    const fetchTimer = setTimeout(() => controller.abort(), 6000);

    const orderRes = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes,
      }),
      signal: controller.signal,
    });
    clearTimeout(fetchTimer);

    const data = await orderRes.json();
    if (!orderRes.ok || !data.order_id) {
      throw new Error(data.error || "Failed to create payment order.");
    }

    orderData = data;
  } catch (err: any) {
    const errorMsg =
      err?.name === "AbortError"
        ? "Gateway connection timeout. Please check ad-blockers or try again."
        : err?.message || "Order creation failed.";
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

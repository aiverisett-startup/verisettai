import Razorpay from "razorpay";

/**
 * Server-side Razorpay client singleton / factory.
 * Strictly uses private RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
 * NEVER import this file in client-side components.
 */
let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  const rawKeyId = process.env.RAZORPAY_KEY_ID;
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

  const key_id = rawKeyId?.trim().replace(/^["']|["']$/g, "");
  const key_secret = rawKeySecret?.trim().replace(/^["']|["']$/g, "");

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay credentials missing: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured in environment variables."
    );
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayInstance;
}

/**
 * Returns the public Key ID safe for client-side checkout initialization.
 */
export function getRazorpayPublicKey(): string {
  const rawKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const key_id = rawKeyId?.trim().replace(/^["']|["']$/g, "");
  if (!key_id) {
    throw new Error("Razorpay public key ID is not configured.");
  }
  return key_id;
}

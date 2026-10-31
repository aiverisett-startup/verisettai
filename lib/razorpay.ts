import Razorpay from "razorpay";

/**
 * Server-side Razorpay client singleton / factory.
 * Strictly uses private RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
 * NEVER import this file in client-side components.
 */
let razorpayInstance: Razorpay | null = null;

const FALLBACK_KEY_ID = "rzp_live_TuVilsV1O3QDBS";
const FALLBACK_KEY_SECRET = "WHUWenzLXy03uJDaRib18rJ5";

export function getRazorpayClient(): Razorpay {
  const rawKeyId = process.env.RAZORPAY_KEY_ID || FALLBACK_KEY_ID;
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || FALLBACK_KEY_SECRET;

  const key_id = rawKeyId?.trim().replace(/^["']|["']$/g, "") || FALLBACK_KEY_ID;
  const key_secret = rawKeySecret?.trim().replace(/^["']|["']$/g, "") || FALLBACK_KEY_SECRET;

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
  const rawKeyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    FALLBACK_KEY_ID;
  const key_id = rawKeyId?.trim().replace(/^["']|["']$/g, "");
  return key_id || FALLBACK_KEY_ID;
}

import crypto from "crypto";

export interface SettlementReceiptInput {
  vaultId: string;
  txId: string;
  amount: number;
  timestamp: string;
}

export interface SettlementReceipt {
  receipt_id: string;
  receipt_hash: string;
  signature: string;
  verified_at: string;
  canonical_payload: string;
}

/**
 * Cryptographic Settlement Receipt Generator
 * Computes canonical SHA-256 hash of settlement parameters and signs with HMAC-SHA256.
 */
export function generateSettlementReceipt(
  data: SettlementReceiptInput
): SettlementReceipt {
  // 1. Build canonical payload string with sorted keys
  const canonicalPayload = JSON.stringify({
    amount: data.amount,
    timestamp: data.timestamp,
    txId: data.txId,
    vaultId: data.vaultId,
  });

  // 2. Compute canonical SHA-256 hash
  const receipt_hash = crypto
    .createHash("sha256")
    .update(canonicalPayload)
    .digest("hex");

  // 3. Sign hash with HMAC-SHA256 using secret
  const secret =
    process.env.PAYMENT_WEBHOOK_SECRET ||
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    "whsec_verisett_production_receipt_secret";

  const signature = crypto
    .createHmac("sha256", secret)
    .update(receipt_hash)
    .digest("hex");

  const verified_at = new Date().toISOString();
  const receipt_id = `rcpt_${receipt_hash.slice(0, 16)}`;

  return {
    receipt_id,
    receipt_hash,
    signature,
    verified_at,
    canonical_payload: canonicalPayload,
  };
}

/**
 * Verify cryptographic signature of a settlement receipt
 */
export function verifySettlementReceipt(
  receipt: SettlementReceipt,
  secretOverride?: string
): boolean {
  const secret =
    secretOverride ||
    process.env.PAYMENT_WEBHOOK_SECRET ||
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    "whsec_verisett_production_receipt_secret";

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(receipt.receipt_hash)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const actualBuffer = Buffer.from(receipt.signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

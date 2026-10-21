import crypto from "crypto";

/**
 * Normalizes deliverable content into a consistent UTF-8 string representation
 * for deterministic SHA-256 hashing across multi-agent systems.
 */
export function normalizeDeliverableContent(
  content: string | Buffer | Record<string, any> | unknown
): string {
  if (content === null || content === undefined) {
    return "";
  }
  if (Buffer.isBuffer(content)) {
    return content.toString("utf8");
  }
  if (typeof content === "string") {
    return content;
  }
  try {
    // Sort keys deterministically for JSON objects to avoid key ordering discrepancies
    if (typeof content === "object") {
      return JSON.stringify(content, Object.keys(content as Record<string, any>).sort());
    }
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

/**
 * Computes a standard SHA-256 cryptographic digest of a milestone deliverable.
 * Matches: crypto.createHash('sha256').update(deliverableContent).digest('hex')
 */
export function computeDeliverableHash(
  deliverableContent: string | Buffer | Record<string, any> | unknown
): string {
  const normalized = normalizeDeliverableContent(deliverableContent);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Validates a delivered artifact against an expected SHA-256 hash.
 * Handles hex strings with or without "0x" prefix in constant-time comparison.
 */
export function verifyDeliverableHash(
  deliverableContent: string | Buffer | Record<string, any> | unknown,
  expectedHash: string
): { isValid: boolean; computedHash: string; expectedHash: string } {
  const computedHash = computeDeliverableHash(deliverableContent).toLowerCase();
  const normalizedExpected = (expectedHash || "").trim().toLowerCase().replace(/^0x/, "");

  if (!normalizedExpected || normalizedExpected.length !== 64) {
    return {
      isValid: false,
      computedHash,
      expectedHash: normalizedExpected,
    };
  }

  // Timing-safe buffer comparison to prevent timing side-channel attacks
  let isValid = false;
  try {
    const computedBuf = Buffer.from(computedHash, "hex");
    const expectedBuf = Buffer.from(normalizedExpected, "hex");
    if (computedBuf.length === expectedBuf.length) {
      isValid = crypto.timingSafeEqual(computedBuf, expectedBuf);
    }
  } catch {
    isValid = computedHash === normalizedExpected;
  }

  return {
    isValid,
    computedHash,
    expectedHash: normalizedExpected,
  };
}

/**
 * Verifies whether a milestone unlock condition is met.
 */
export function canUnlockEscrowFunds(
  registeredHash: string,
  submittedDeliverable: string | Buffer | Record<string, any> | unknown
): boolean {
  return verifyDeliverableHash(submittedDeliverable, registeredHash).isValid;
}

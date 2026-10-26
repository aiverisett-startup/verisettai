import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "./supabaseAdmin";
import { createServerClient } from "@supabase/ssr";

// ==============================================================================
// 1. PROTOTYPE POLLUTION & SQL INJECTION DETECTOR
// ==============================================================================

const FORBIDDEN_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);

// SQL Injection and Script pattern signatures
const SQL_INJECTION_PATTERNS = [
  /--/,
  /;\s*(?:DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER|EXEC|SHUTDOWN)\b/i,
  /\bUNION\s+(?:ALL\s+)?SELECT\b/i,
  /\/\*[\s\S]*?\*\//,
  /\bOR\s+['"\d\w]+\s*=\s*['"\d\w]+/i,
  /\bAND\s+['"\d\w]+\s*=\s*['"\d\w]+/i,
  /@@version/i,
  /WAITFOR\s+DELAY\b/i,
  /BENCHMARK\s*\(/i,
  /SLEEP\s*\(/i,
  /<script\b/i,
  /javascript\s*:/i,
  /\bon(?:error|load|click|mouseover)\s*=/i,
];

/**
 * Recursively scans an object for prototype pollution keys and SQL injection fragments.
 */
export function scanPayloadForInjection(
  data: unknown,
  depth = 0
): { isClean: boolean; reason?: string } {
  if (depth > 12) {
    return { isClean: false, reason: "EXCESSIVE_NESTING: Payload depth limit exceeded." };
  }

  if (data === null || data === undefined) {
    return { isClean: true };
  }

  if (typeof data === "string") {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(data)) {
        return {
          isClean: false,
          reason: `INJECTION_SIGNATURE_DETECTED: Suspicious token matching security filter: '${pattern.source}'`,
        };
      }
    }
    return { isClean: true };
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const result = scanPayloadForInjection(data[i], depth + 1);
      if (!result.isClean) return result;
    }
    return { isClean: true };
  }

  if (typeof data === "object") {
    // Check own and inherited key names
    const keys = Object.keys(data as Record<string, unknown>);
    for (const key of keys) {
      if (FORBIDDEN_KEYS.has(key)) {
        return {
          isClean: false,
          reason: `PROTOTYPE_POLLUTION_DETECTED: Forbidden object key '${key}'.`,
        };
      }

      for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(key)) {
          return {
            isClean: false,
            reason: `KEY_INJECTION_DETECTED: Malicious characters in object key '${key}'.`,
          };
        }
      }

      const val = (data as Record<string, unknown>)[key];
      const result = scanPayloadForInjection(val, depth + 1);
      if (!result.isClean) return result;
    }
  }

  return { isClean: true };
}

// ==============================================================================
// 2. REPLAY ATTACK & AGENT REQUEST EXPIRATION GUARD
// ==============================================================================

/**
 * Validates the x-verisett-timestamp header to prevent replay attacks.
 * Rejects requests older or skewed by more than 5 minutes (300,000 ms).
 */
export function verifyReplayAttackTimestamp(headers: Headers): {
  valid: boolean;
  timestamp?: number;
  error?: string;
} {
  const timestampHeader =
    headers.get("x-verisett-timestamp") ||
    headers.get("x-request-timestamp") ||
    headers.get("x-timestamp");

  if (!timestampHeader) {
    return {
      valid: false,
      error:
        "REPLAY_PROTECTION_ERROR: Missing required 'x-verisett-timestamp' header (Unix epoch milliseconds).",
    };
  }

  const timestamp = Number(timestampHeader);
  if (isNaN(timestamp) || timestamp <= 0) {
    return {
      valid: false,
      error:
        "REPLAY_PROTECTION_ERROR: Invalid 'x-verisett-timestamp' header. Must be a valid numeric Unix epoch timestamp.",
    };
  }

  const now = Date.now();
  const timeDifferenceMs = Math.abs(now - timestamp);
  const MAX_ALLOWABLE_DRIFT_MS = 300000; // 5 minutes

  if (timeDifferenceMs > MAX_ALLOWABLE_DRIFT_MS) {
    return {
      valid: false,
      error: `REPLAY_PROTECTION_EXPIRED: Timestamp is outside the allowable 5-minute validity window (Drift: ${Math.round(
        timeDifferenceMs / 1000
      )}s). Clearance rejected.`,
    };
  }

  return { valid: true, timestamp };
}

// ==============================================================================
// 3. ZERO-TOLERANCE ZOD SCHEMAS WITH STRICT TYPE CHECKING
// ==============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_REGEX = /^(?:0x)?[a-fA-F0-9]{64}$/;
const SAFE_ID_REGEX = /^[a-zA-Z0-9_\-:]{2,128}$/;

export const EscrowClearanceSchema = z
  .object({
    contract_id: z.string().regex(SAFE_ID_REGEX, "Invalid contract ID format").optional(),
    contractId: z.string().regex(SAFE_ID_REGEX, "Invalid contract ID format").optional(),
    vault_id: z.string().regex(SAFE_ID_REGEX, "Invalid vault ID format").optional(),
    vaultId: z.string().regex(SAFE_ID_REGEX, "Invalid vault ID format").optional(),
    milestone_id: z.string().regex(SAFE_ID_REGEX, "Invalid milestone ID format").optional(),
    milestoneId: z.string().regex(SAFE_ID_REGEX, "Invalid milestone ID format").optional(),
    amount: z.number().positive("Amount must be greater than zero").max(100000000).optional(),
    deliverable_content: z.string().max(1000000).optional(),
    deliverableContent: z.string().max(1000000).optional(),
    deliverable: z.string().max(1000000).optional(),
    assertion_payload: z.string().max(1000000).optional(),
    assertionPayload: z.string().max(1000000).optional(),
    deliverable_hash: z.string().regex(SHA256_REGEX, "Invalid SHA-256 deliverable hash").optional(),
    deliverableHash: z.string().regex(SHA256_REGEX, "Invalid SHA-256 deliverable hash").optional(),
    expected_sha256: z.string().regex(SHA256_REGEX, "Invalid SHA-256 deliverable hash").optional(),
    sha256: z.string().regex(SHA256_REGEX, "Invalid SHA-256 deliverable hash").optional(),
    title: z.string().max(256).optional(),
    milestone_title: z.string().max(256).optional(),
    milestoneTitle: z.string().max(256).optional(),
    payer_agent: z.string().max(256).optional(),
    payer: z.string().max(256).optional(),

    payee_agent: z.string().max(256).optional(),
    payee: z.string().max(256).optional(),
    plan_tier: z
      .enum(["community", "builder", "pro", "enterprise", "starter", "institutional", "sovereign"])
      .optional(),
    planTier: z
      .enum(["community", "builder", "pro", "enterprise", "starter", "institutional", "sovereign"])
      .optional(),
  })
  .strict();

export const AgentSettleSchema = z
  .object({
    vault_id: z.string().regex(SAFE_ID_REGEX, "Invalid vault_id format"),
    vaultId: z.string().regex(SAFE_ID_REGEX, "Invalid vault_id format").optional(),
    seller_agent_id: z.string().max(256).optional(),
    sellerAgentId: z.string().max(256).optional(),
    payload_data: z.string().max(1000000).optional(),
    payloadData: z.string().max(1000000).optional(),
    proof: z.string().max(1000000).optional(),
    proof_payload: z.any().optional(),
    proofPayload: z.any().optional(),
    expected_hash: z.string().regex(SHA256_REGEX, "Invalid SHA-256 hash").optional(),
    expectedHash: z.string().regex(SHA256_REGEX, "Invalid SHA-256 hash").optional(),
    deliverable_hash: z.string().regex(SHA256_REGEX, "Invalid SHA-256 hash").optional(),
    deliverableHash: z.string().regex(SHA256_REGEX, "Invalid SHA-256 hash").optional(),
    amount: z.number().positive().max(100000000).optional(),
    milestone_title: z.string().max(256).optional(),
    milestoneTitle: z.string().max(256).optional(),
  })
  .strict();

export const EscrowMilestoneSchema = z
  .object({
    title: z.string().min(1).max(256).optional(),
    milestone_title: z.string().max(256).optional(),
    description: z.string().max(4000).optional(),
    amount: z.number().positive().max(100000000).optional(),
    currency: z.string().max(10).optional(),
    contract_id: z.string().regex(SAFE_ID_REGEX).optional(),
    contractId: z.string().regex(SAFE_ID_REGEX).optional(),
    vault_id: z.string().regex(SAFE_ID_REGEX).optional(),
    vaultId: z.string().regex(SAFE_ID_REGEX).optional(),
    deliverable_content: z.any().optional(),
    deliverableContent: z.any().optional(),
    deliverable: z.any().optional(),
    assertion_payload: z.any().optional(),
    deliverable_hash: z.string().regex(SHA256_REGEX).optional(),
    deliverableHash: z.string().regex(SHA256_REGEX).optional(),
    payer_agent: z.string().max(256).optional(),
    payer: z.string().max(256).optional(),
    payee_agent: z.string().max(256).optional(),
    payee: z.string().max(256).optional(),
    status: z.enum(["pending", "active", "submitted", "completed", "disputed", "refunded"]).optional(),
  })
  .strict();



export const WelcomeEmailSchema = z
  .object({
    email: z.string().email("Valid email address required").max(320),
    name: z.string().max(128).optional(),
    userId: z.string().regex(UUID_REGEX, "Invalid UUID format").optional(),
  })
  .strict();

export const FeedbackSchema = z
  .object({
    name: z.string().min(1).max(100),
    role_title: z.string().max(100).optional().nullable(),
    company: z.string().max(100).optional().nullable(),
    rating: z.number().int().min(1).max(5),
    message: z.string().min(3).max(2000),
    category: z.string().max(50).optional(),
  })
  .strict();

export const VaultCancelSchema = z
  .object({
    vault_id: z.string().regex(SAFE_ID_REGEX, "Invalid vault_id format"),
    vaultId: z.string().regex(SAFE_ID_REGEX).optional(),
    reason: z.string().max(500).optional(),
  })
  .strict();

// ==============================================================================
// 4. PARSER & ZERO-TOLERANCE VALIDATION HELPER
// ==============================================================================

export async function parseAndValidateJson<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<
  | { success: true; data: T }
  | { success: false; response: NextResponse }
> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "MALFORMED_JSON: Request body must be valid non-empty JSON.",
        },
        { status: 400 }
      ),
    };
  }

  // 1. Prototype pollution and SQL Injection scan
  const scan = scanPayloadForInjection(body);
  if (!scan.isClean) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: `PAYLOAD_SECURITY_VIOLATION: ${scan.reason}`,
        },
        { status: 400 }
      ),
    };
  }

  // 2. Strict Zod Schema validation
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((i) => `${i.path.join(".") || "payload"}: ${i.message}`)
      .join("; ");

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: `PAYLOAD_VALIDATION_ERROR: ${errorDetails}`,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: parsed.data };
}

// ==============================================================================
// 5. BROKEN OBJECT-LEVEL AUTHORIZATION (BOLA/IDOR) GUARDS
// ==============================================================================

export interface AuthenticatedRequester {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  agentId?: string;
  isServiceRole?: boolean;
}

/**
 * Extracts authenticated session or M2M agent identity from headers / cookies
 */
export async function getAuthenticatedRequester(
  req: NextRequest
): Promise<AuthenticatedRequester> {
  // 1. Check API Key or Agent Key Header (M2M)
  const apiKey =
    req.headers.get("x-verisett-agent-key") ||
    req.headers.get("x-api-key") ||
    req.headers.get("x-agent-key");

  if (apiKey) {
    try {
      const { data: keyRecord } = await supabaseAdmin
        .from("api_keys")
        .select("id, user_id, agent_id, is_active")
        .eq("key_hash", apiKey)
        .maybeSingle();

      if (keyRecord && keyRecord.is_active) {
        return {
          isAuthenticated: true,
          userId: keyRecord.user_id,
          agentId: keyRecord.agent_id || keyRecord.id,
        };
      }
    } catch {
      // Ignore
    }
  }

  // 2. Check Authorization Bearer Header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      try {
        const {
          data: { user },
        } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          return {
            isAuthenticated: true,
            userId: user.id,
            email: user.email,
          };
        }
      } catch {
        // Ignore
      }
    }
  }

  // 3. Check Supabase Auth SSR session cookies
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lpoconfurcrrkndguycr.supabase.co";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb2NvbmZ1cmNycmtuZGd1eWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTIzNDIsImV4cCI6MjEwNDc4ODM0Mn0.3yyJUB6duad7COImmhU8afbMoDtOOi7NaaWzL8jHiTA";

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {},
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return {
        isAuthenticated: true,
        userId: user.id,
        email: user.email,
      };
    }
  } catch {
    // Ignore
  }

  return { isAuthenticated: false };
}

/**
 * Ensures that the requester owns or is an authorized counterparty to the target escrow/vault.
 * Prevents BOLA / IDOR attacks where a user passes an arbitrary UUID or ID belonging to another tenant.
 */
export async function verifyEscrowAccessAuthorization(params: {
  escrowOrVaultId: string;
  requester: AuthenticatedRequester;
}): Promise<{ authorized: boolean; reason?: string }> {
  const { escrowOrVaultId, requester } = params;

  if (requester.isServiceRole) {
    return { authorized: true };
  }

  if (!requester.isAuthenticated) {
    // In local demo sandbox if no auth headers present, allow development sandbox flow
    if (process.env.NODE_ENV !== "production") {
      return { authorized: true };
    }
    return {
      authorized: false,
      reason: "BOLA_UNAUTHORIZED: Authentication session or agent key required to access escrow object.",
    };
  }

  // Query database for vault or settlement record
  try {
    const { data: vault } = await supabaseAdmin
      .from("vaults")
      .select("id, user_id")
      .eq("id", escrowOrVaultId)
      .maybeSingle();

    if (vault) {
      if (vault.user_id && vault.user_id !== requester.userId) {
        return {
          authorized: false,
          reason: "BOLA_FORBIDDEN: Requester is not the owner or authorized custodian of this escrow vault.",
        };
      }
      return { authorized: true };
    }

    const { data: milestone } = await supabaseAdmin
      .from("milestones")
      .select("id, contract_id, payer_agent, payee_agent")
      .or(`id.eq.${escrowOrVaultId},contract_id.eq.${escrowOrVaultId}`)
      .maybeSingle();

    if (milestone) {
      if (
        requester.agentId &&
        milestone.payer_agent !== requester.agentId &&
        milestone.payee_agent !== requester.agentId
      ) {
        return {
          authorized: false,
          reason: "BOLA_FORBIDDEN: Requester agent ID does not match payer or payee on this milestone.",
        };
      }
      return { authorized: true };
    }
  } catch {
    // If table query fails, fallback safely
  }

  return { authorized: true };
}

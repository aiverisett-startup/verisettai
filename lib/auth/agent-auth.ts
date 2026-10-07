import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface AuthenticateAgentResult {
  authorized: boolean;
  userId?: string;
  scopes?: string[];
  error?: string;
  status?: number;
}

/**
 * FastMCP Agent Bearer Key Guard
 * Authenticates incoming agent requests via Authorization: Bearer vst_live_<token>
 * and verifies against cryptographically hashed keys in public.api_keys.
 */
export async function authenticateAgentKey(
  req: Request
): Promise<AuthenticateAgentResult> {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) {
    return {
      authorized: false,
      error: "Missing Authorization header. Expected: Bearer vst_live_<token>",
      status: 401,
    };
  }

  const parts = authHeader.trim().split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return {
      authorized: false,
      error: "Malformed Authorization header. Format: Bearer vst_live_<token>",
      status: 401,
    };
  }

  const rawKey = parts[1].trim();

  // Reject with HTTP 401 if missing or invalid prefix
  if (!rawKey.startsWith("vst_live_")) {
    return {
      authorized: false,
      error: "Invalid API key format. Key must start with 'vst_live_'",
      status: 401,
    };
  }

  // Hash the incoming raw token using SHA-256
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  try {
    // Query public.api_keys using Supabase Service Role client matching key_hash
    const { data: apiKey, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, user_id, status, revoked_at")
      .eq("key_hash", keyHash)
      .maybeSingle();

    if (error || !apiKey) {
      return {
        authorized: false,
        error: "Unauthorized: Invalid or unknown FastMCP agent key",
        status: 401,
      };
    }

    if (apiKey.status !== "ACTIVE" || apiKey.revoked_at) {
      return {
        authorized: false,
        error: "Unauthorized: FastMCP agent key has been revoked",
        status: 401,
      };
    }

    // Touch last_used_at in the background
    Promise.resolve(
      supabaseAdmin
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", apiKey.id)
    ).catch(() => {});

    return {
      authorized: true,
      userId: apiKey.user_id,
      scopes: ["agent:settle", "vault:read", "vault:write"],
    };
  } catch (err) {
    console.error("FastMCP key authentication error:", err);
    return {
      authorized: false,
      error: "Authentication service internal error",
      status: 500,
    };
  }
}

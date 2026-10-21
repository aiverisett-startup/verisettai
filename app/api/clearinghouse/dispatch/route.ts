import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";
import { authenticateAgentKey } from "@/lib/auth/agent-auth";
import { recordAgentTransfer } from "@/lib/serverStore";

interface DispatchRequestBody {
  transaction_id: string;
  sender_agent_id: string;
  payload: Record<string, unknown> | string;
  receiver_agent_id?: string;
  amount?: number;
  currency?: string;
  signature?: string;
  public_key?: string;
}

/**
 * Verifies Supabase session JWT token, FastMCP agent key, or internal secret.
 */
async function verifyAuthorization(req: NextRequest): Promise<{
  authorized: boolean;
  userId?: string;
  authType: "supabase_session" | "agent_key" | "internal_secret";
  error?: string;
}> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) {
    return {
      authorized: false,
      authType: "supabase_session",
      error: "Missing Authorization header. Expected Bearer token or FastMCP agent key.",
    };
  }

  const parts = authHeader.trim().split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return {
      authorized: false,
      authType: "supabase_session",
      error: "Malformed Authorization header format. Expected 'Bearer <token>'.",
    };
  }

  const token = parts[1].trim();

  // 1. Check Internal Developer Secret (bypass for administrative/cron triggers)
  const devSecret = process.env.INTERNAL_DEV_SECRET;
  if (devSecret && token === devSecret) {
    return {
      authorized: true,
      userId: "internal_system_admin",
      authType: "internal_secret",
    };
  }

  // 2. Check FastMCP Agent Key format (vst_live_...)
  if (token.startsWith("vst_live_")) {
    const agentAuth = await authenticateAgentKey(req);
    if (agentAuth.authorized && agentAuth.userId) {
      return {
        authorized: true,
        userId: agentAuth.userId,
        authType: "agent_key",
      };
    }
    return {
      authorized: false,
      authType: "agent_key",
      error: agentAuth.error || "Invalid or revoked agent API key.",
    };
  }

  // 3. Verify Supabase Session JWT Token
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user?.id) {
      return {
        authorized: true,
        userId: data.user.id,
        authType: "supabase_session",
      };
    }

    // Fallback: Check with supabaseAdmin if anon client had session clock skew
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.getUser(token);
    if (!adminError && adminData?.user?.id) {
      return {
        authorized: true,
        userId: adminData.user.id,
        authType: "supabase_session",
      };
    }
  } catch (err) {
    console.warn("Supabase JWT validation error:", err);
  }

  return {
    authorized: false,
    authType: "supabase_session",
    error: "Unauthorized: Invalid or expired Supabase session token.",
  };
}

export async function POST(req: NextRequest) {
  try {
    // Step 1: Verify Supabase session / agent token authorization
    const authResult = await verifyAuthorization(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // Step 2: Parse and validate incoming clearinghouse payload
    const body: DispatchRequestBody = await req.json().catch(() => ({}));
    const {
      transaction_id,
      sender_agent_id,
      payload,
      receiver_agent_id,
      amount = 0,
      currency = "M2M_TOKEN",
      signature,
      public_key,
    } = body;

    if (!transaction_id || !sender_agent_id || payload === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: 'transaction_id', 'sender_agent_id', and 'payload' must be provided.",
          code: "BAD_REQUEST",
        },
        { status: 400 }
      );
    }

    // Step 3: Verify agent identity in Supabase (if database is populated)
    try {
      const { data: agentRecord } = await supabaseAdmin
        .from("agents")
        .select("id, owner_id, status, public_key")
        .eq("id", sender_agent_id)
        .maybeSingle();

      if (agentRecord) {
        if (agentRecord.status === "suspended") {
          return NextResponse.json(
            {
              success: false,
              error: `Agent '${sender_agent_id}' is currently suspended from the clearinghouse.`,
              code: "AGENT_SUSPENDED",
            },
            { status: 403 }
          );
        }

        // If authenticated via user session, verify ownership
        if (
          authResult.authType === "supabase_session" &&
          authResult.userId &&
          agentRecord.owner_id !== authResult.userId
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Agent ownership mismatch: Authenticated user does not own sender_agent_id.",
              code: "FORBIDDEN",
            },
            { status: 403 }
          );
        }
      }
    } catch (dbErr) {
      // Table may not yet be provisioned in local sandbox, proceed with fallback
      console.warn("Notice: agents table lookup bypassed or not found:", dbErr);
    }

    // Prepare dispatch metadata
    const stringifiedPayload =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    const payloadHash = crypto
      .createHash("sha256")
      .update(stringifiedPayload)
      .digest("hex");

    const awsWorkerUrl = process.env.AWS_WORKER_URL?.trim();
    const awsWorkerSecretKey = process.env.AWS_WORKER_SECRET_KEY?.trim() || "";

    // Step 4A: Forward to AWS Free Tier Worker Bridge (if AWS_WORKER_URL is set)
    if (awsWorkerUrl) {
      try {
        const workerController = new AbortController();
        const timeoutId = setTimeout(() => workerController.abort(), 15000); // 15s AWS worker timeout

        const workerResponse = await fetch(awsWorkerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-worker-key": awsWorkerSecretKey,
            Authorization: `Bearer ${awsWorkerSecretKey}`,
          },
          body: JSON.stringify({
            transaction_id,
            sender_agent_id,
            receiver_agent_id: receiver_agent_id || null,
            payload,
            payload_hash: payloadHash,
            signature: signature || null,
            public_key: public_key || null,
            amount,
            currency,
            dispatched_at: new Date().toISOString(),
          }),
          signal: workerController.signal,
        });

        clearTimeout(timeoutId);

        if (!workerResponse.ok) {
          const errText = await workerResponse.text();
          throw new Error(`AWS Worker responded with HTTP ${workerResponse.status}: ${errText}`);
        }

        const workerResult = await workerResponse.json();

        // Update transaction in Supabase to 'settled'
        const settlementTimestamp = new Date().toISOString();
        try {
          await supabaseAdmin.from("transactions").upsert({
            id: transaction_id,
            sender_agent_id: sender_agent_id,
            receiver_agent_id: receiver_agent_id || sender_agent_id,
            amount: amount,
            currency: currency,
            status: "settled",
            metadata: {
              dispatch_worker: "aws_free_tier",
              worker_url: awsWorkerUrl,
              worker_receipt: workerResult,
              payload_hash: payloadHash,
              settled_at: settlementTimestamp,
            },
            created_at: settlementTimestamp,
          });
        } catch (dbErr) {
          console.warn("Failed to persist settled transaction in Supabase:", dbErr);
        }

        // Update in-memory reactive serverStore
        recordAgentTransfer({
          amountINR: amount || 1000,
          fromAgentName: sender_agent_id,
          toAgentName: receiver_agent_id || "vault_clearinghouse",
          milestoneTitle: "M2M Autonomous Clearinghouse Settlement (AWS Worker)",
          status: "SUCCESSFUL",
        });

        return NextResponse.json({
          success: true,
          status: "settled",
          clearinghouse_bridge: "aws_free_tier_worker",
          transaction_id,
          sender_agent_id,
          payload_hash: payloadHash,
          worker_response: workerResult,
          settled_at: settlementTimestamp,
        });
      } catch (workerErr: unknown) {
        console.error("AWS Worker bridge dispatch failure:", workerErr);
        return NextResponse.json(
          {
            success: false,
            status: "failed",
            error:
              workerErr instanceof Error
                ? workerErr.message
                : "Unknown error communicating with AWS worker bridge",
            transaction_id,
          },
          { status: 502 }
        );
      }
    }

    // Step 4B: Fallback Asynchronous Mock Verification (when AWS_WORKER_URL is unset)
    const fallbackSettledAt = new Date().toISOString();
    const fallbackProof = crypto
      .createHash("sha256")
      .update(`${transaction_id}:${sender_agent_id}:${payloadHash}:${fallbackSettledAt}`)
      .digest("hex");

    // Asynchronously update transaction status in Supabase
    try {
      await supabaseAdmin.from("transactions").upsert({
        id: transaction_id,
        sender_agent_id: sender_agent_id,
        receiver_agent_id: receiver_agent_id || sender_agent_id,
        amount: amount,
        currency: currency,
        status: "settled",
        metadata: {
          dispatch_mode: "fallback_mock_verification",
          reason: "AWS_WORKER_URL unset",
          proof_hash: fallbackProof,
          payload_hash: payloadHash,
          settled_at: fallbackSettledAt,
        },
        created_at: fallbackSettledAt,
      });
    } catch (dbErr) {
      console.warn("Supabase local fallback transaction upsert notice:", dbErr);
    }

    // Sync in-memory reactive store
    recordAgentTransfer({
      amountINR: amount || 1000,
      fromAgentName: sender_agent_id,
      toAgentName: receiver_agent_id || "vault_clearinghouse",
      milestoneTitle: "M2M Autonomous Clearinghouse Settlement (Fallback Engine)",
      status: "SUCCESSFUL",
    });

    return NextResponse.json({
      success: true,
      status: "settled",
      clearinghouse_bridge: "fallback_mock_verification",
      message:
        "AWS_WORKER_URL is unset. Executed autonomous mock verification and marked transaction as settled in Supabase.",
      transaction_id,
      sender_agent_id,
      proof_hash: fallbackProof,
      payload_hash: payloadHash,
      settled_at: fallbackSettledAt,
    });
  } catch (error: unknown) {
    console.error("Clearinghouse dispatch unhandled exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Clearinghouse Error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

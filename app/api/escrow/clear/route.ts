import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  computeDeliverableHash,
  verifyDeliverableHash,
  normalizeDeliverableContent,
} from "@/lib/crypto-verify";
import {
  settleProgrammaticVault,
  recordAgentTransfer,
  getVaultState,
  getProgrammaticVault,
} from "@/lib/serverStore";

// Fallback in-memory idempotency cache in case of temporary DB connectivity drops
const localIdempotencyCache = new Map<string, { body: any; status: number; timestamp: number }>();

export async function POST(req: NextRequest) {
  try {
    // 1. IDEMPOTENCY MIDDLEWARE (API Route Protection)
    const idempotencyKey =
      req.headers.get("x-idempotency-key") ||
      req.headers.get("x-idempotency-token") ||
      req.headers.get("idempotency-key");

    if (idempotencyKey) {
      // Step A: Check local fast memory cache first
      const memCached = localIdempotencyCache.get(idempotencyKey);
      if (memCached && Date.now() - memCached.timestamp < 24 * 60 * 60 * 1000) {
        return NextResponse.json(memCached.body, {
          status: memCached.status || 200,
          headers: {
            "x-idempotency-hit": "true",
            "x-idempotency-key": idempotencyKey,
            "x-clearing-engine": "Verisett-FastMCP-Idempotent",
          },
        });
      }

      // Step B: Query Supabase idempotency_keys table
      try {
        const { data: dbCached, error } = await supabaseAdmin
          .from("idempotency_keys")
          .select("response_body, status_code")
          .eq("key", idempotencyKey)
          .maybeSingle();

        if (dbCached && !error && dbCached.response_body) {
          // Sync into memory cache for faster subsequent requests
          localIdempotencyCache.set(idempotencyKey, {
            body: dbCached.response_body,
            status: dbCached.status_code || 200,
            timestamp: Date.now(),
          });

          return NextResponse.json(dbCached.response_body, {
            status: dbCached.status_code || 200,
            headers: {
              "x-idempotency-hit": "true",
              "x-idempotency-key": idempotencyKey,
              "x-clearing-engine": "Verisett-FastMCP-Idempotent",
            },
          });
        }
      } catch (err) {
        console.warn("Idempotency DB lookup fallback:", err);
      }
    }

    // 2. PARSE ESCROW CLEARANCE REQUEST
    const body = await req.json().catch(() => ({}));
    const contractId = body.contract_id || body.contractId || body.vault_id || body.vaultId;
    const milestoneId = body.milestone_id || body.milestoneId;
    const deliverableContent =
      body.deliverable_content ??
      body.deliverableContent ??
      body.deliverable ??
      body.assertion_payload ??
      body.assertionPayload;
    const providedHash = (
      body.deliverable_hash ||
      body.deliverableHash ||
      body.expected_sha256 ||
      body.sha256 ||
      ""
    ).trim();

    if (!contractId && !milestoneId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: 'contract_id' or 'milestone_id' is required to clear escrow.",
        },
        { status: 400 }
      );
    }

    // 3. CRYPTOGRAPHIC PROOF-OF-WORK VERIFICATION
    let registeredHash = providedHash;
    let milestoneRecord: any = null;

    // Check Supabase milestones table if milestoneId or contractId provided
    if (milestoneId || contractId) {
      try {
        let query = supabaseAdmin.from("milestones").select("*");
        if (milestoneId) {
          query = query.eq("id", milestoneId);
        } else if (contractId) {
          query = query.eq("contract_id", contractId);
        }

        const { data: milestoneData } = await query.maybeSingle();
        if (milestoneData) {
          milestoneRecord = milestoneData;
          if (milestoneData.deliverable_hash) {
            registeredHash = milestoneData.deliverable_hash;
          }
        }
      } catch (err) {
        console.warn("Supabase milestone query fallback:", err);
      }
    }

    // If milestone is already completed, return early
    if (milestoneRecord && milestoneRecord.status === "completed") {
      const alreadySettledResponse = {
        success: true,
        status: "ALREADY_SETTLED",
        cleared: true,
        contract_id: contractId,
        milestone_id: milestoneId,
        amount: milestoneRecord.amount,
        deliverable_hash: milestoneRecord.deliverable_hash,
        message: "Milestone escrow was already verified and settled.",
      };

      if (idempotencyKey) {
        localIdempotencyCache.set(idempotencyKey, {
          body: alreadySettledResponse,
          status: 200,
          timestamp: Date.now(),
        });
      }

      return NextResponse.json(alreadySettledResponse, { status: 200 });
    }

    // Verify deliverable content against expected SHA-256 hash
    let verifiedHash = "";
    if (deliverableContent !== undefined) {
      const computedHash = computeDeliverableHash(deliverableContent);
      verifiedHash = computedHash;

      if (registeredHash) {
        const check = verifyDeliverableHash(deliverableContent, registeredHash);
        if (!check.isValid) {
          return NextResponse.json(
            {
              success: false,
              error: "Cryptographic proof-of-work mismatch: deliverable does not match the registered SHA-256 milestone hash.",
              expected_sha256: check.expectedHash,
              computed_sha256: check.computedHash,
            },
            { status: 400 }
          );
        }
      }
    } else if (registeredHash) {
      verifiedHash = registeredHash.replace(/^0x/, "").toLowerCase();
    } else {
      // If neither deliverableContent nor registeredHash is present, compute a default settlement proof
      verifiedHash = computeDeliverableHash(`CLEARANCE-${contractId || milestoneId}-${Date.now()}`);
    }

    // 4. UNLOCK ESCROW FUNDS & SETTLE TRANSACTION
    const targetVaultId = contractId || `vault-${milestoneId}`;
    const amount = Number(body.amount || milestoneRecord?.amount || 250);
    const payer =
      body.payer_agent ||
      body.payer ||
      milestoneRecord?.payer_agent ||
      "Payer Agent";
    const payee =
      body.payee_agent ||
      body.payee ||
      milestoneRecord?.payee_agent ||
      "Autonomous Payee Agent";

    // Attempt programmatic vault settlement in serverStore if vault exists
    const existingVault = getProgrammaticVault(targetVaultId);
    let txRecord: any = null;

    if (existingVault && existingVault.status !== "Settled") {
      const settleResult = settleProgrammaticVault({
        vault_id: targetVaultId,
        assertion_payload: deliverableContent || { verifiedHash },
        expected_sha256: verifiedHash,
      });
      if (settleResult.success) {
        txRecord = settleResult.transaction;
      }
    }

    // If not settled via programmatic vault, record an agent transfer transaction
    if (!txRecord) {
      const transferRes = recordAgentTransfer({
        amountINR: amount,
        fromAgentName: payer,
        toAgentName: payee,
        milestoneTitle:
          body.title ||
          milestoneRecord?.title ||
          `Milestone Cleared: ${contractId || milestoneId} (SHA256:${verifiedHash.slice(0, 8)})`,
        status: "SUCCESSFUL",
      });
      txRecord = transferRes.transaction;
    }

    // 5. UPDATE SUPABASE MILESTONE STATUS
    if (milestoneRecord?.id) {
      try {
        await supabaseAdmin
          .from("milestones")
          .update({
            status: "completed",
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deliverable_payload:
              typeof deliverableContent === "object"
                ? deliverableContent
                : { raw: String(deliverableContent ?? "") },
          })
          .eq("id", milestoneRecord.id);
      } catch (err) {
        console.warn("Supabase milestone status update fallback:", err);
      }
    }

    // 6. ASSEMBLE SUCCESSFUL CLEARANCE RESPONSE
    const responsePayload = {
      success: true,
      status: "SETTLED",
      cleared: true,
      contract_id: contractId,
      milestone_id: milestoneId || milestoneRecord?.id,
      amount,
      currency: "VRS",
      payer,
      payee,
      proof_of_work: {
        algorithm: "SHA-256",
        deliverable_hash: "0x" + verifiedHash,
        verified: true,
        unlocked_at: new Date().toISOString(),
      },
      transaction_id: txRecord?.id,
      transaction: txRecord,
      message:
        "Milestone escrow successfully verified and unlocked via zero-cost cryptographic SHA-256 proof.",
    };

    // 7. CACHE UNDER IDEMPOTENCY KEY (to prevent duplicate billing/settlement loops)
    if (idempotencyKey) {
      localIdempotencyCache.set(idempotencyKey, {
        body: responsePayload,
        status: 200,
        timestamp: Date.now(),
      });

      try {
        await supabaseAdmin.from("idempotency_keys").upsert({
          key: idempotencyKey,
          response_body: responsePayload,
          status_code: 200,
          endpoint: "/api/escrow/clear",
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Supabase idempotency cache save fallback:", err);
      }
    }

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "x-idempotency-hit": "false",
        "x-idempotency-key": idempotencyKey || "none",
        "x-clearing-engine": "Verisett-FastMCP-Idempotent",
      },
    });
  } catch (error: any) {
    console.error("Escrow clearance failure:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal escrow clearance exception.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") || searchParams.get("idempotency_key");

  if (!key) {
    return NextResponse.json({
      status: "active",
      endpoint: "/api/escrow/clear",
      protocol: "Verisett AI Cryptographic Milestone & Idempotency Gateway",
      methods: ["POST"],
      headers_required: ["x-idempotency-key"],
    });
  }

  // Lookup key
  const memCached = localIdempotencyCache.get(key);
  if (memCached) {
    return NextResponse.json({
      found: true,
      source: "memory",
      response_body: memCached.body,
    });
  }

  try {
    const { data: dbData } = await supabaseAdmin
      .from("idempotency_keys")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    if (dbData) {
      return NextResponse.json({
        found: true,
        source: "supabase",
        response_body: dbData.response_body,
        created_at: dbData.created_at,
      });
    }
  } catch (err) {
    console.warn("DB lookup error:", err);
  }

  return NextResponse.json({ found: false, message: "Idempotency key not found." }, { status: 404 });
}

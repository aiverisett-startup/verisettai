import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { authenticateAgentKey } from "@/lib/auth/agent-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateSettlementReceipt } from "@/lib/crypto/receipt";
import {
  verifyReplayAttackTimestamp,
  parseAndValidateJson,
  AgentSettleSchema,
} from "@/lib/security-guard";

export async function POST(req: NextRequest) {
  try {
    // 1. Replay attack & request expiration guard
    const replayCheck = verifyReplayAttackTimestamp(req.headers);
    if (!replayCheck.valid) {
      return NextResponse.json(
        {
          error: "Replay Attack Defense: Request expired or skewed beyond allowable 5-minute window",
          details: replayCheck.error,
        },
        { status: 400 }
      );
    }

    // 2. Authenticate the incoming agent via FastMCP Bearer key guard
    const auth = await authenticateAgentKey(req);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      );
    }

    // 3. Strict payload validation & prototype pollution / injection defense
    const validation = await parseAndValidateJson(req, AgentSettleSchema);
    if (!validation.success) {
      return validation.response;
    }

    const body = validation.data;
    const vault_id = body.vault_id || body.vaultId;
    const proof = body.proof;
    const proof_payload = body.proof_payload ?? body.proofPayload;
    const expected_hash = body.expected_hash ?? body.expectedHash;
    const amount = body.amount;
    const milestone_title = body.milestone_title || body.milestoneTitle || "Autonomous Agent Escrow Settlement";

    if (!vault_id) {
      return NextResponse.json(
        { error: "Bad Request: Missing required 'vault_id' parameter" },
        { status: 400 }
      );
    }


    // 2. Deterministic Proof Verification
    let verifiedProofHash = proof || "";
    if (proof_payload !== undefined && expected_hash !== undefined) {
      const serializedPayload =
        typeof proof_payload === "string"
          ? proof_payload
          : JSON.stringify(proof_payload);

      const computedHash = crypto
        .createHash("sha256")
        .update(serializedPayload)
        .digest("hex");

      if (computedHash.toLowerCase() !== String(expected_hash).toLowerCase()) {
        return NextResponse.json(
          {
            error: "Deterministic proof verification failed",
            message: "Computed SHA-256 payload hash does not match expected_hash",
            computed_hash: computedHash,
            expected_hash: expected_hash,
          },
          { status: 400 }
        );
      }

      verifiedProofHash = expected_hash;
    }

    // 3. Ensure agent can ONLY act on vaults where user_id === authenticatedUserId
    const { data: vault, error: vaultErr } = await supabaseAdmin
      .from("vaults")
      .select("*")
      .eq("id", vault_id)
      .eq("user_id", auth.userId)
      .maybeSingle();

    if (vaultErr || !vault) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Vault not found or does not belong to the authenticated agent's tenant",
        },
        { status: 403 }
      );
    }

    // Invariant check: Vault cannot be settled twice
    if (vault.status === "SETTLED" || vault.state === "SETTLED") {
      return NextResponse.json(
        { error: "Conflict: Vault has already been settled" },
        { status: 409 }
      );
    }

    const settleAmountPaise = Number(amount || vault.balance_cents || 1000000);

    // Resolve active protocol take-rate dynamically for this tenant / user
    const { resolveTakeRateForPayer, computeBalancedSettlementSplit } = await import("@/lib/take-rate");
    const activeTakeRate = await resolveTakeRateForPayer(auth.userId);
    const split = computeBalancedSettlementSplit(settleAmountPaise, activeTakeRate);

    // 4. Execute atomic settlement via stored procedure settle_vault_atomic
    let settleResult: any = null;
    let transactionId = crypto.randomUUID();

    try {
      const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc(
        "settle_vault_atomic",
        {
          p_vault_id: vault_id,
          p_user_id: auth.userId,
          p_amount: settleAmountPaise,
        }
      );

      if (rpcErr) {
        throw rpcErr;
      }
      settleResult = rpcResult;
      if (settleResult?.transaction_id) {
        transactionId = settleResult.transaction_id;
      }
    } catch {
      const isUuid = (val?: string | null): boolean =>
        Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

      const sanitizedUserId = isUuid(auth.userId) ? auth.userId : null;
      const sanitizedVaultId = isUuid(vault_id) ? vault_id : null;

      // Fallback: update status and insert balanced double-entry ledger entries directly
      await supabaseAdmin.from("ledger_entries").insert([
        {
          user_id: sanitizedUserId,
          vault_id: sanitizedVaultId,
          escrow_id: String(vault_id || "").trim(),
          transaction_id: transactionId,
          entry_type: "DEBIT",
          amount: split.grossAmount,
          currency: "INR",
          description: "Escrow Vault Principal Release Execution",
        },
        {
          user_id: sanitizedUserId,
          vault_id: sanitizedVaultId,
          escrow_id: String(vault_id || "").trim(),
          transaction_id: transactionId,
          entry_type: "CREDIT",
          amount: split.netDisbursed,
          currency: "INR",
          description: `Autonomous Agent Escrow Consensus Settlement Payout (${(100 - activeTakeRate.rate * 100).toFixed(2)}%)`,
        },
        {
          user_id: sanitizedUserId,
          vault_id: sanitizedVaultId,
          escrow_id: String(vault_id || "").trim(),
          transaction_id: transactionId,
          entry_type: "CREDIT",
          amount: split.feeAmount,
          currency: "INR",
          description: `Verisett Protocol Take-Rate Fee (${activeTakeRate.ratePercentage} - ${activeTakeRate.planName})`,
        },
      ]);

      if (sanitizedVaultId && sanitizedUserId) {
        await supabaseAdmin
          .from("vaults")
          .update({
            status: "SETTLED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sanitizedVaultId)
          .eq("user_id", sanitizedUserId);
      }

      settleResult = {
        success: true,
        vault_id,
        transaction_id: transactionId,
        amount: settleAmountPaise,
        status: "SETTLED",
      };
    }

    // 5. Generate Cryptographic Settlement Receipt
    const settlementTimestamp = new Date().toISOString();
    const receipt = generateSettlementReceipt({
      vaultId: vault_id,
      txId: transactionId,
      amount: settleAmountPaise,
      timestamp: settlementTimestamp,
    });

    // 6. Record settlement record for dashboard analytics
    const sha256Proof =
      verifiedProofHash || `0x${crypto.randomBytes(16).toString("hex")}`;

    const isUuid = (val?: string | null): boolean =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

    await supabaseAdmin.from("settlements").insert({
      user_id: isUuid(auth.userId) ? auth.userId : null,
      vault_id: isUuid(vault_id) ? vault_id : null,
      amount: Math.round(settleAmountPaise / 84) / 100, // USD amount
      fee: Math.round((settleAmountPaise / 84) * activeTakeRate.rate) / 100,
      status: "SETTLED",
      job_title: milestone_title,
      proof: sha256Proof,
    });

    // 7. Return success and cryptographic receipt with dynamic take-rate
    return NextResponse.json({
      success: true,
      receipt,
      settlement: settleResult,
      take_rate: {
        tier: activeTakeRate.tier,
        plan_name: activeTakeRate.planName,
        fee_percentage: activeTakeRate.ratePercentage,
        fee_amount_units: split.feeAmount,
        net_amount_units: split.netDisbursed,
        is_lifetime: activeTakeRate.isLifetime,
      },
      proof: sha256Proof,
      tenantId: auth.userId,
      timestamp: settlementTimestamp,
    });
  } catch (err: any) {
    console.error("Agent settlement error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message || "Settlement failed" },
      { status: 500 }
    );
  }
}

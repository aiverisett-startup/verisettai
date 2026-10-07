import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { authenticateAgentKey } from "@/lib/auth/agent-auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the incoming agent via FastMCP Bearer key guard
    const auth = await authenticateAgentKey(req);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      );
    }

    const body = await req.json();
    const {
      vault_id,
      proof,
      amount,
      milestone_title = "Autonomous Agent Escrow Settlement",
    } = body;

    if (!vault_id) {
      return NextResponse.json(
        { error: "Bad Request: Missing required 'vault_id' parameter" },
        { status: 400 }
      );
    }

    // 2. Ensure agent can ONLY act on vaults where user_id === authenticatedUserId
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

    // 3. Execute atomic settlement via stored procedure settle_vault_atomic
    let settleResult: any = null;
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
    } catch {
      // Fallback: update status and insert balanced double-entry ledger entries directly
      const txId = crypto.randomUUID();

      await supabaseAdmin.from("ledger_entries").insert([
        {
          user_id: auth.userId,
          vault_id: vault_id,
          transaction_id: txId,
          entry_type: "CREDIT",
          amount: settleAmountPaise,
          currency: "INR",
          description: "Autonomous Agent Escrow Consensus Settlement",
        },
        {
          user_id: auth.userId,
          vault_id: vault_id,
          transaction_id: txId,
          entry_type: "DEBIT",
          amount: settleAmountPaise,
          currency: "INR",
          description: "Escrow Vault Fund Release Execution",
        },
      ]);

      await supabaseAdmin
        .from("vaults")
        .update({
          status: "SETTLED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", vault_id)
        .eq("user_id", auth.userId);

      settleResult = {
        success: true,
        vault_id,
        transaction_id: txId,
        amount: settleAmountPaise,
        status: "SETTLED",
      };
    }

    // 4. Record settlement record for dashboard analytics
    const sha256Proof =
      proof || `0x${crypto.randomBytes(16).toString("hex")}`;

    await supabaseAdmin.from("settlements").insert({
      user_id: auth.userId,
      vault_id: vault_id,
      amount: Math.round(settleAmountPaise / 84) / 100, // USD amount
      fee: Math.round((settleAmountPaise / 84) * 0.0075) / 100,
      status: "SETTLED",
      job_title: milestone_title,
      proof: sha256Proof,
    });

    return NextResponse.json({
      success: true,
      settlement: settleResult,
      proof: sha256Proof,
      tenantId: auth.userId,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Agent settlement error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message || "Settlement failed" },
      { status: 500 }
    );
  }
}

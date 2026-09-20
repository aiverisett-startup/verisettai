import { NextRequest, NextResponse } from "next/server";
import { getVaultState, recordAgentTransfer, setServerAgentConnected } from "@/lib/serverStore";

export async function GET() {
  const state = getVaultState();
  return NextResponse.json({
    success: true,
    vaultBalance: {
      testnet_balance: state.testnet_balance,
      available_balance: state.available_balance,
      frozen_balance: state.frozen_balance,
      total_volume: state.total_volume,
      total_commission: state.total_commission,
    },
    isAgentConnected: state.is_agent_connected,
    connectedAgentId: state.connected_agent_id,
    transactions: state.transactions,
    lastUpdated: state.last_updated,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Extract authorization key if present
    const authHeader = req.headers.get("authorization") || "";
    const apiKey = body.apiKey || body.api_key || authHeader.replace(/^Bearer\s+/i, "");

    // Resolve amount in INR
    let amount = 1000;
    if (body.amount !== undefined) amount = Number(body.amount);
    else if (body.amountINR !== undefined) amount = Number(body.amountINR);
    else if (body.amount_inr !== undefined) amount = Number(body.amount_inr);
    else if (body.amount_cents !== undefined) amount = Math.round(Number(body.amount_cents) / 100);

    if (isNaN(amount) || amount <= 0) {
      amount = 2500;
    }

    // Resolve Agent Names
    const fromAgentName =
      body.fromAgent ||
      body.from_agent ||
      body.from ||
      body.payer ||
      body.payer_name ||
      "Google Antigravity Agent #1";

    const toAgentName =
      body.toAgent ||
      body.to_agent ||
      body.to ||
      body.worker ||
      body.worker_name ||
      body.beneficiary ||
      body.beneficiary_id ||
      "Google Antigravity Agent #2";

    const milestoneTitle =
      body.milestone ||
      body.milestoneTitle ||
      body.milestone_title ||
      body.task ||
      body.task_description ||
      body.description ||
      "Autonomous Agent-to-Agent Transfer & Settlement";

    const status =
      String(body.status || "SUCCESSFUL").toUpperCase() === "FAILED"
        ? "FAILED"
        : "SUCCESSFUL";

    // Record the transaction and update the vault money
    const result = recordAgentTransfer({
      amountINR: amount,
      fromAgentName,
      fromAgentModel: body.fromAgentModel || body.from_model || "FastMCP v2.4 Node",
      toAgentName,
      toAgentModel: body.toAgentModel || body.to_model || "Autonomous Worker Node",
      milestoneTitle,
      status,
      failureReason: body.failureReason || body.failure_reason,
    });

    return NextResponse.json({
      success: true,
      message: `Transaction settled successfully for ₹${amount.toLocaleString("en-IN")}`,
      transaction: result.transaction,
      vaultBalance: {
        testnet_balance: result.state.testnet_balance,
        available_balance: result.state.available_balance,
        frozen_balance: result.state.frozen_balance,
        total_volume: result.state.total_volume,
        total_commission: result.state.total_commission,
      },
      isAgentConnected: true,
    });
  } catch (error: any) {
    console.error("Error processing agent transfer:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute agent transfer" },
      { status: 500 }
    );
  }
}

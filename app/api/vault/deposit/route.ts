import { NextRequest, NextResponse } from "next/server";
import { recordVaultDeposit, getVaultState } from "@/lib/serverStore";

export async function GET() {
  const state = getVaultState();
  return NextResponse.json({
    success: true,
    vaultBalance: {
      testnet_balance: state.testnet_balance,
      available_balance: state.available_balance,
      frozen_balance: state.frozen_balance,
      total_volume: state.total_volume,
    },
    isAgentConnected: state.is_agent_connected,
    connectedAgentName: state.connected_agent_name,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    let amount = 5000;
    if (body.amount !== undefined) amount = Number(body.amount);
    else if (body.amountINR !== undefined) amount = Number(body.amountINR);
    else if (body.amount_inr !== undefined) amount = Number(body.amount_inr);
    else if (body.amount_cents !== undefined) amount = Math.round(Number(body.amount_cents) / 100);

    if (isNaN(amount) || amount <= 0) {
      amount = 5000;
    }

    const state = getVaultState();
    const agentName =
      body.agent_name ||
      body.agentName ||
      body.fromAgent ||
      body.from ||
      body.name ||
      state.connected_agent_name ||
      "Autonomous Connected Agent";

    const milestoneTitle =
      body.milestone ||
      body.description ||
      `Autonomous Vault Deposit by ${agentName}`;

    const result = recordVaultDeposit({
      amountINR: amount,
      agentName,
      agentModel: body.agentModel || body.model || "FastMCP Client v2.4",
      milestoneTitle,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deposited ₹${amount.toLocaleString("en-IN")} to Vault by ${agentName}`,
      newBalance: result.state.available_balance,
      vaultBalance: {
        testnet_balance: result.state.testnet_balance,
        available_balance: result.state.available_balance,
        total_volume: result.state.total_volume,
      },
      transaction: result.transaction,
      isAgentConnected: true,
      connectedAgentName: result.state.connected_agent_name,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

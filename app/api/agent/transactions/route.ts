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
    connectedAgentName: state.connected_agent_name,
    transactions: state.transactions,
    lastUpdated: state.last_updated,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "connect") {
      const state = setServerAgentConnected(
        true,
        body.agentId,
        body.agentName || body.agent_name,
        body.agentModel || body.agent_model
      );
      return NextResponse.json({
        success: true,
        isAgentConnected: true,
        connectedAgentName: state.connected_agent_name,
        state,
      });
    }

    if (action === "disconnect") {
      const state = setServerAgentConnected(false);
      return NextResponse.json({ success: true, isAgentConnected: false, state });
    }

    // Default: record transaction
    const currentState = getVaultState();
    const amount = Number(body.amountINR || body.amount || 2500);
    const fromAgentName =
      body.fromAgentName ||
      body.fromAgent ||
      body.payer ||
      currentState.connected_agent_name ||
      "Autonomous Agent A";

    const toAgentName =
      body.toAgentName ||
      body.toAgent ||
      body.worker ||
      "Autonomous Agent B";

    const result = recordAgentTransfer({
      amountINR: amount,
      fromAgentName,
      toAgentName,
      milestoneTitle: body.milestoneTitle || `Autonomous Milestone: ${fromAgentName} -> ${toAgentName}`,
      status: body.status || "SUCCESSFUL",
      failureReason: body.failureReason,
    });

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      vaultBalance: {
        testnet_balance: result.state.testnet_balance,
        available_balance: result.state.available_balance,
      },
      transactions: result.state.transactions,
      isAgentConnected: true,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

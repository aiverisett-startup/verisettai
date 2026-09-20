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
    const action = body.action;

    if (action === "connect") {
      const state = setServerAgentConnected(true, body.agentId);
      return NextResponse.json({ success: true, isAgentConnected: true, state });
    }

    if (action === "disconnect") {
      const state = setServerAgentConnected(false);
      return NextResponse.json({ success: true, isAgentConnected: false, state });
    }

    // Default: record transaction
    const amount = Number(body.amountINR || body.amount || 2500);
    const result = recordAgentTransfer({
      amountINR: amount,
      fromAgentName: body.fromAgentName || body.fromAgent || "Google Antigravity Agent #1",
      toAgentName: body.toAgentName || body.toAgent || "Google Antigravity Agent #2",
      milestoneTitle: body.milestoneTitle || "Autonomous Real-Time Milestone Settlement",
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

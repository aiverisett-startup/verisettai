import { NextRequest, NextResponse } from "next/server";
import {
  recordAgentTransfer,
  recordVaultDeposit,
  getVaultState,
  autoDetectAgentIdentity,
  setServerAgentConnected,
} from "@/lib/serverStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const detected = autoDetectAgentIdentity(req.headers, body);
    const state = getVaultState();

    let amount = 25000;
    if (body.amount_cents) amount = Math.round(Number(body.amount_cents) / 100);
    else if (body.amount_inr) amount = Number(body.amount_inr);
    else if (body.amount) amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) amount = 2500;

    const headerAgentName = req.headers.get("x-agent-name");
    const agentName =
      headerAgentName ||
      body.agent_name ||
      body.agentName ||
      body.payer_name ||
      body.payer_id ||
      body.from_agent ||
      body.fromAgent ||
      (detected.hasAgentSignals ? detected.name : state.connected_agent_name) ||
      "Autonomous Agent A";

    // Mark agent connected
    setServerAgentConnected(true, undefined, agentName, detected.model);

    const isDeposit =
      body.type === "deposit" ||
      body.action === "deposit" ||
      body.isDeposit === true ||
      body.is_deposit === true;

    if (isDeposit) {
      const depositResult = recordVaultDeposit({
        amountINR: amount,
        agentName,
        milestoneTitle: body.milestone_title || body.milestone || `Vault Liquidity Deposit by ${agentName}`,
      });

      return NextResponse.json({
        success: true,
        type: "DEPOSIT",
        contract_id: depositResult.transaction.id,
        amount_inr: amount,
        status: "SETTLED",
        transaction: depositResult.transaction,
        vaultBalance: {
          testnet_balance: depositResult.state.testnet_balance,
          available_balance: depositResult.state.available_balance,
        },
        isAgentConnected: true,
        connectedAgentName: depositResult.state.connected_agent_name,
        activeVaults: depositResult.state.vault_deployments || [],
      });
    }

    const toAgentName =
      body.beneficiary_id ||
      body.beneficiary_name ||
      body.worker_id ||
      body.worker_name ||
      body.to_agent ||
      body.toAgent ||
      "Autonomous Counterparty Agent";

    const result = recordAgentTransfer({
      amountINR: amount,
      fromAgentName: agentName,
      toAgentName,
      milestoneTitle: body.milestone_id || body.milestone_title || `Programmatic Escrow: ${agentName} -> ${toAgentName}`,
      status: "SUCCESSFUL",
    });

    return NextResponse.json({
      success: true,
      contract_id: result.transaction.id,
      amount_cents: amount * 100,
      amount_inr: amount,
      fee_cents: Math.round(amount * 0.015 * 100),
      status: "SETTLED",
      transaction: result.transaction,
      vaultBalance: {
        testnet_balance: result.state.testnet_balance,
        available_balance: result.state.available_balance,
      },
      isAgentConnected: true,
      connectedAgentName: result.state.connected_agent_name,
      activeVaults: result.state.vault_deployments || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

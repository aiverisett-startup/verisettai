import { NextRequest, NextResponse } from "next/server";
import {
  getVaultState,
  recordAgentTransfer,
  recordVaultDeposit,
  setServerAgentConnected,
  autoDetectAgentIdentity,
} from "@/lib/serverStore";

export async function GET(req: NextRequest) {
  const detected = autoDetectAgentIdentity(req.headers);
  if (detected.hasAgentSignals) {
    setServerAgentConnected(true, undefined, detected.name, detected.model);
  }
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
    connectedAgentModel: state.connected_agent_model,
    transactions: state.transactions,
    activeVaults: state.vault_deployments || [],
    lastUpdated: state.last_updated,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const detected = autoDetectAgentIdentity(req.headers, body);
    const state = getVaultState();

    // Resolve amount in INR
    let amount = 1000;
    if (body.amount !== undefined) amount = Number(body.amount);
    else if (body.amountINR !== undefined) amount = Number(body.amountINR);
    else if (body.amount_inr !== undefined) amount = Number(body.amount_inr);
    else if (body.amount_cents !== undefined) amount = Math.round(Number(body.amount_cents) / 100);

    if (isNaN(amount) || amount <= 0) {
      amount = 2500;
    }

    // Check if this is an Agent Vault DEPOSIT request (adding money to vault!)
    const isDeposit =
      body.type === "deposit" ||
      body.action === "deposit" ||
      body.isDeposit === true ||
      body.toAgent === "vault" ||
      body.to === "vault";

    if (isDeposit) {
      const agentName =
        body.fromAgent ||
        body.from_agent ||
        body.from ||
        body.agent_name ||
        body.agentName ||
        (detected.hasAgentSignals ? detected.name : state.connected_agent_name) ||
        "Autonomous Agent";

      const depositResult = recordVaultDeposit({
        amountINR: amount,
        agentName,
        agentModel: body.agentModel || body.model || detected.model || "FastMCP Client v2.4",
        milestoneTitle: body.milestone || `Vault Liquidity Deposit by ${agentName}`,
      });

      return NextResponse.json({
        success: true,
        type: "DEPOSIT",
        message: `Successfully deposited ₹${amount.toLocaleString("en-IN")} into Vault by ${agentName}`,
        transaction: depositResult.transaction,
        vaultBalance: {
          testnet_balance: depositResult.state.testnet_balance,
          available_balance: depositResult.state.available_balance,
          total_volume: depositResult.state.total_volume,
        },
        isAgentConnected: true,
        connectedAgentName: depositResult.state.connected_agent_name,
        activeVaults: depositResult.state.vault_deployments || [],
      });
    }

    // Resolve Dynamic Agent Names (Auto-detected if not given)
    const fromAgentName =
      body.fromAgent ||
      body.from_agent ||
      body.from ||
      body.payer ||
      body.payer_name ||
      (detected.hasAgentSignals ? detected.name : state.connected_agent_name) ||
      "Autonomous Agent A";

    const toAgentName =
      body.toAgent ||
      body.to_agent ||
      body.to ||
      body.worker ||
      body.worker_name ||
      body.beneficiary ||
      body.beneficiary_id ||
      "Autonomous Agent B";

    const milestoneTitle =
      body.milestone ||
      body.milestoneTitle ||
      body.milestone_title ||
      body.task ||
      body.task_description ||
      body.description ||
      `Autonomous Settlement: ${fromAgentName} -> ${toAgentName}`;

    const status =
      String(body.status || "SUCCESSFUL").toUpperCase() === "FAILED"
        ? "FAILED"
        : "SUCCESSFUL";

    // Record the transaction and update the vault money
    const result = recordAgentTransfer({
      amountINR: amount,
      fromAgentName,
      fromAgentModel: body.fromAgentModel || body.from_model || detected.model || "FastMCP v2.4 Node",
      toAgentName,
      toAgentModel: body.toAgentModel || body.to_model || "Autonomous Worker Node",
      milestoneTitle,
      status,
      failureReason: body.failureReason || body.failure_reason,
    });

    return NextResponse.json({
      success: true,
      type: "TRANSFER",
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
      connectedAgentName: result.state.connected_agent_name,
      activeVaults: result.state.vault_deployments || [],
    });
  } catch (error: any) {
    console.error("Error processing agent transfer:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute agent transfer" },
      { status: 500 }
    );
  }
}

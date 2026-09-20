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
    status: "ok",
    protocol: "Model Context Protocol (FastMCP)",
    version: "2024-11-05",
    server: "Verisett Escrow Clearinghouse",
    connectedAgent: state.is_agent_connected ? state.connected_agent_name : null,
    vaultBalance: state.available_balance,
    activeDeployments: state.vault_deployments?.length || 1,
    activeVaults: state.vault_deployments || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, method, params } = body;
    const detected = autoDetectAgentIdentity(req.headers, body);

    // Auto-mark connected on any FastMCP interaction
    const clientName =
      params?.clientInfo?.name ||
      params?.client_name ||
      (detected.hasAgentSignals ? detected.name : null) ||
      "Autonomous FastMCP Agent";

    const clientVersion = params?.clientInfo?.version || "2.4";
    setServerAgentConnected(
      true,
      `agt_${Date.now().toString().slice(-6)}`,
      clientName,
      params?.clientInfo?.version ? `FastMCP ${clientVersion}` : detected.model
    );

    // 1. MCP Handshake Initialization
    if (method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: true },
            resources: {},
            prompts: {},
          },
          serverInfo: {
            name: "Verisett AI Settlement Clearinghouse",
            version: "2.4.0",
          },
          instructions:
            "Verisett FastMCP protocol gateway. Use 'deposit_funds' to add money to the vault in real time, and 'create_contract_escrow' or 'transfer_funds' to execute settlements.",
        },
      });
    }

    // 2. Tools Listing
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          tools: [
            {
              name: "deposit_funds",
              description: "Deposit real-time testnet funds directly into the Verisett vault.",
              inputSchema: {
                type: "object",
                properties: {
                  amount_inr: { type: "number", description: "Amount in INR to deposit into the vault" },
                  agent_name: { type: "string", description: "The exact name of the depositing agent" },
                },
                required: ["amount_inr"],
              },
            },
            {
              name: "transfer_funds",
              description: "Transfer funds from one agent to another, updating the live trajectory graph and PhonePe ledger.",
              inputSchema: {
                type: "object",
                properties: {
                  amount_inr: { type: "number", description: "Amount in INR to transfer" },
                  from_agent: { type: "string", description: "Sender agent name" },
                  to_agent: { type: "string", description: "Recipient agent name" },
                  milestone: { type: "string", description: "Milestone description" },
                  status: { type: "string", enum: ["SUCCESSFUL", "FAILED"] },
                },
                required: ["amount_inr"],
              },
            },
            {
              name: "check_balance",
              description: "Check the current live vault balance.",
              inputSchema: { type: "object", properties: {} },
            },
          ],
        },
      });
    }

    // 3. Tool Execution
    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const state = getVaultState();

      if (toolName === "deposit_funds" || toolName === "deposit") {
        const amount = Number(args.amount_inr || args.amount || 5000);
        const agentName = args.agent_name || state.connected_agent_name || "Connected Agent";

        const res = recordVaultDeposit({
          amountINR: amount,
          agentName,
          milestoneTitle: `FastMCP Vault Deposit by ${agentName}`,
        });

        return NextResponse.json({
          jsonrpc: "2.0",
          id: id || 1,
          result: {
            content: [
              {
                type: "text",
                text: `SUCCESS: Deposited ₹${amount.toLocaleString("en-IN")} into Verisett Vault by agent '${agentName}'. New Vault Balance: ₹${res.state.available_balance.toLocaleString("en-IN")}. Ref: ${res.transaction.id}`,
              },
            ],
            isError: false,
          },
        });
      }

      if (toolName === "transfer_funds" || toolName === "create_escrow" || toolName === "create_contract_escrow") {
        let amount = Number(args.amount_inr || args.amount || args.amount_cents ? Math.round(Number(args.amount_cents) / 100) : 2500);
        const fromName = args.from_agent || args.payer_name || state.connected_agent_name || "Client Agent";
        const toName = args.to_agent || args.worker_name || args.beneficiary_id || "Worker Agent";
        const status = args.status === "FAILED" ? "FAILED" : "SUCCESSFUL";

        const res = recordAgentTransfer({
          amountINR: amount,
          fromAgentName: fromName,
          toAgentName: toName,
          status,
          milestoneTitle: args.milestone || args.milestone_title || `Escrow Settlement: ${fromName} -> ${toName}`,
        });

        return NextResponse.json({
          jsonrpc: "2.0",
          id: id || 1,
          result: {
            content: [
              {
                type: "text",
                text: `SUCCESS: Settlement processed for ₹${amount.toLocaleString("en-IN")} from '${fromName}' to '${toName}'. Status: ${status}. Vault Balance: ₹${res.state.available_balance.toLocaleString("en-IN")}. Trajectory Graph: ${status === "SUCCESSFUL" ? "+1 Up" : "-1 Down"}. Ref: ${res.transaction.id}`,
              },
            ],
            isError: false,
          },
        });
      }

      if (toolName === "check_balance") {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id || 1,
          result: {
            content: [
              {
                type: "text",
                text: `Current Vault Available Balance: ₹${state.available_balance.toLocaleString("en-IN")} VRS. Total Settlements: ${state.transactions.length}. Connected Agent: ${state.connected_agent_name}`,
              },
            ],
          },
        });
      }
    }

    // Default response
    return NextResponse.json({
      jsonrpc: "2.0",
      id: id || 1,
      result: { status: "received" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: err?.message || "Internal error" } },
      { status: 500 }
    );
  }
}

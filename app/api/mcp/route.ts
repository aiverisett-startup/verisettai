import { NextRequest, NextResponse } from "next/server";
import {
  getVaultState,
  recordAgentTransfer,
  recordVaultDeposit,
  setServerAgentConnected,
  autoDetectAgentIdentity,
  createProgrammaticVault,
  settleProgrammaticVault,
  getProgrammaticVault,
} from "@/lib/serverStore";
import { verifyApiKeyConstantTime } from "@/lib/verisettDb";

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

    // 1. Constant-Time Authentication Middleware
    const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key");
    let authenticatedAccount: any = null;

    if (authHeader) {
      const authVerification = verifyApiKeyConstantTime(authHeader);
      if (!authVerification.valid) {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id || null,
            error: {
              code: -32001,
              message: "Unauthorized: Invalid or revoked API key. Constant-time hash verification failed.",
            },
          },
          { status: 401 }
        );
      }
      authenticatedAccount = authVerification.account;
    }

    // Auto-mark connected on any FastMCP interaction
    const clientName =
      authenticatedAccount?.name ||
      params?.clientInfo?.name ||
      params?.client_name ||
      (detected.hasAgentSignals ? detected.name : null) ||
      "Autonomous FastMCP Agent";

    const clientVersion = params?.clientInfo?.version || "2.4";
    setServerAgentConnected(
      true,
      authenticatedAccount?.id || `agt_${Date.now().toString().slice(-6)}`,
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
            "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP. Use 'deposit_funds' to add money to the vault in real time, and 'create_contract_escrow' or 'transfer_funds' to execute settlements.",
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
              name: "create_vault",
              description: "Create and fund a deterministic programmatic escrow vault between payer and payee.",
              inputSchema: {
                type: "object",
                properties: {
                  vault_id: { type: "string", description: "Unique identifier for the escrow vault" },
                  payer: { type: "string", description: "Payer agent identifier or name" },
                  payee: { type: "string", description: "Payee / worker agent identifier or name" },
                  amount: { type: "number", description: "Amount in VRS to lock into the vault" },
                  ttl: { type: "number", description: "Time-to-live expiration in seconds (default: 300)" },
                },
                required: ["vault_id", "payer", "payee", "amount"],
              },
            },
            {
              name: "settle_vault",
              description: "Settle an escrow vault by verifying deliverable output against expected SHA-256 hash.",
              inputSchema: {
                type: "object",
                properties: {
                  vault_id: { type: "string", description: "Vault ID to settle" },
                  assertion_payload: { description: "The deliverable output or assertion payload to verify" },
                  expected_sha256: { type: "string", description: "Expected SHA-256 hash proof" },
                },
                required: ["vault_id", "assertion_payload", "expected_sha256"],
              },
            },
            {
              name: "get_vault_status",
              description: "Retrieve current state, balances, and audit proof of an escrow vault.",
              inputSchema: {
                type: "object",
                properties: {
                  vault_id: { type: "string", description: "Vault ID to inspect" },
                },
                required: ["vault_id"],
              },
            },
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

    // Direct JSON-RPC: create_vault
    if (method === "create_vault") {
      const args = params || {};
      const vId = args.vault_id || args.vaultId || `vlt_${Date.now()}`;
      const payer = args.payer || args.payer_name || state.connected_agent_name || "Agent A";
      const payee = args.payee || args.payee_name || "Agent B";
      const amount = Number(args.amount ?? args.amount_vrs ?? 100);
      const ttl = Number(args.ttl || 300);

      const res = createProgrammaticVault({ vault_id: vId, payer, payee, amount, ttl });
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          vault_id: res.vault.id,
          status: res.vault.status,
          payer: res.vault.payer,
          payee: res.vault.payee,
          amount: res.vault.amount,
          currency: res.vault.currency,
          ttl: res.vault.ttl,
          expires_at: res.vault.expiresAt,
          created_at: res.vault.createdAt,
          message: `Vault '${res.vault.id}' successfully locked with ${amount} VRS.`,
        },
      });
    }

    // Direct JSON-RPC: settle_vault
    if (method === "settle_vault") {
      const args = params || {};
      const vId = args.vault_id || args.vaultId;
      const assertion = args.assertion_payload ?? args.assertion;
      const expected = args.expected_sha256 || args.expectedSha256 || "";

      const res = settleProgrammaticVault({
        vault_id: vId,
        assertion_payload: assertion,
        expected_sha256: expected,
      });

      if (!res.success) {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id || 1,
            error: { code: -32002, message: res.error || "Settlement verification failed" },
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          vault_id: res.vault?.id,
          status: res.vault?.status,
          settled_at: res.vault?.settledAt,
          payer: res.vault?.payer,
          payee: res.vault?.payee,
          gross_amount: res.vault?.amount,
          protocol_commission: Math.round((res.vault?.amount || 0) * 0.015),
          verified_sha256: res.vault?.sha256Proof,
          transaction_id: res.transaction?.id,
          message: "Cryptographic assertion verified. Funds cleared to payee.",
        },
      });
    }

    // Direct JSON-RPC: get_vault_status
    if (method === "get_vault_status") {
      const args = params || {};
      const vId = args.vault_id || args.vaultId;
      const vault = getProgrammaticVault(vId);
      if (!vault) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id || 1,
          result: { vault_id: vId, status: "NOT_FOUND", exists: false },
        });
      }
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          vault_id: vault.id,
          status: vault.status,
          amount: vault.amount,
          currency: vault.currency,
          payer: vault.payer,
          payee: vault.payee,
          created_at: vault.createdAt,
          expires_at: vault.expiresAt,
          settled_at: vault.settledAt,
          sha256_proof: vault.sha256Proof,
          transaction_id: vault.transactionId,
          exists: true,
        },
      });
    }

    // 3. Tool Execution
    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const state = getVaultState();

      if (toolName === "create_vault" || toolName === "create_escrow_vault") {
        const vId = args.vault_id || args.vaultId || `vlt_${Date.now()}`;
        const payer = args.payer || args.payer_name || state.connected_agent_name || "Agent A";
        const payee = args.payee || args.payee_name || "Agent B";
        const amount = Number(args.amount ?? args.amount_vrs ?? 100);
        const ttl = Number(args.ttl || 300);

        const res = createProgrammaticVault({ vault_id: vId, payer, payee, amount, ttl });
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id || 1,
          result: {
            content: [
              {
                type: "text",
                text: `SUCCESS: Programmatic Vault '${res.vault.id}' created. Locked: ${amount} VRS between '${payer}' -> '${payee}'. TTL: ${ttl}s. Status: ${res.vault.status}`,
              },
            ],
            data: res.vault,
            isError: false,
          },
        });
      }

      if (toolName === "settle_vault") {
        const vId = args.vault_id || args.vaultId;
        const assertion = args.assertion_payload ?? args.assertion;
        const expected = args.expected_sha256 || args.expectedSha256 || "";

        const res = settleProgrammaticVault({
          vault_id: vId,
          assertion_payload: assertion,
          expected_sha256: expected,
        });

        if (!res.success) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id: id || 1,
            result: {
              content: [
                {
                  type: "text",
                  text: `VERIFICATION FAILED: ${res.error}`,
                },
              ],
              isError: true,
            },
          });
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id: id || 1,
          result: {
            content: [
              {
                type: "text",
                text: `SUCCESS: Vault '${vId}' settled! Funds released to '${res.vault?.payee}'. Verified SHA-256: ${res.vault?.sha256Proof}. Tx: ${res.transaction?.id}`,
              },
            ],
            data: res.vault,
            isError: false,
          },
        });
      }

      if (toolName === "get_vault_status") {
        const vId = args.vault_id || args.vaultId;
        const vault = getProgrammaticVault(vId);
        return NextResponse.json({
          jsonrpc: "2.0",
          id: id || 1,
          result: {
            content: [
              {
                type: "text",
                text: vault
                  ? `Vault '${vault.id}': Status=${vault.status}, Amount=${vault.amount} VRS, Payer='${vault.payer}', Payee='${vault.payee}'`
                  : `Vault '${vId}' not found.`,
              },
            ],
            data: vault || null,
            isError: !vault,
          },
        });
      }

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
        const amount = Number(args.amount_inr ?? args.amount ?? (args.amount_cents ? Math.round(Number(args.amount_cents) / 100) : 2500));
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

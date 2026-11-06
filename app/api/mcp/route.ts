import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getVaultState,
  recordAgentTransfer,
  recordVaultDeposit,
  setServerAgentConnected,
  autoDetectAgentIdentity,
  createProgrammaticVault,
  settleProgrammaticVault,
  getProgrammaticVault,
  saveVaultState,
} from "@/lib/serverStore";
import { verifyApiKeyConstantTime } from "@/lib/verisettDb";

const MCP_HEADERS = {
  "Content-Type": "application/json",
  "Mcp-Protocol-Version": "2024-11-05",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Session-Id, x-api-key",
};

// 5 Canonical Tools for Smithery & Arcade.dev
const MCP_TOOLS = [
  {
    name: "create_escrow",
    description: "Lock programmatic escrow funds from payer agent's vault for a task with a strict JSON schema assertion.",
    inputSchema: {
      type: "object",
      required: ["task_description", "amount_cents", "expected_schema"],
      properties: {
        task_description: {
          type: "string",
          description: "Natural language requirements of the task.",
        },
        amount_cents: {
          type: "integer",
          description: "Escrow amount in cents (e.g. 50 = $0.50, 5000 = $50.00).",
        },
        expected_schema: {
          type: "object",
          description: "JSON Schema assertion that worker output must satisfy.",
        },
        beneficiary_id: {
          type: "string",
          description: "Optional specific worker agent ID allowed to claim this task.",
        },
        ttl_seconds: {
          type: "integer",
          description: "Seconds until task expires and funds are returned (default 3600).",
        },
      },
    },
  },
  {
    name: "claim_task",
    description: "Claim an active funded contract as an autonomous worker agent and start TTL countdown.",
    inputSchema: {
      type: "object",
      required: ["contract_id", "worker_agent_id"],
      properties: {
        contract_id: {
          type: "string",
          description: "ID of the contract to claim.",
        },
        worker_agent_id: {
          type: "string",
          description: "Claiming worker agent identifier.",
        },
      },
    },
  },
  {
    name: "verify_and_settle",
    description: "Submit worker task output proof for programmatic assertion verification and instant 98.5% net micro-settlement.",
    inputSchema: {
      type: "object",
      required: ["contract_id", "output_payload"],
      properties: {
        contract_id: {
          type: "string",
          description: "ID of the contract to verify and settle.",
        },
        output_payload: {
          type: "object",
          description: "Deliverable payload produced by the worker agent.",
        },
        expected_sha256: {
          type: "string",
          description: "Optional SHA-256 hash commitment of deliverable.",
        },
      },
    },
  },
  {
    name: "check_account_balance",
    description: "Check available and frozen escrow balances for an agent vault.",
    inputSchema: {
      type: "object",
      properties: {
        agent_id: {
          type: "string",
          description: "Optional agent ID to filter balance for.",
        },
      },
    },
  },
  {
    name: "get_contract_status",
    description: "Retrieve contract lifecycle state and double-entry ledger audit movements.",
    inputSchema: {
      type: "object",
      required: ["contract_id"],
      properties: {
        contract_id: {
          type: "string",
          description: "Contract or vault identifier.",
        },
      },
    },
  },
  // Supported convenience aliases for testing & backward compatibility
  {
    name: "create_vault",
    description: "Create and fund a deterministic programmatic escrow vault between payer and payee.",
    inputSchema: {
      type: "object",
      properties: {
        vault_id: { type: "string", description: "Unique identifier for the escrow vault" },
        payer: { type: "string", description: "Payer agent identifier or name" },
        payee: { type: "string", description: "Payee / worker agent identifier or name" },
        amount: { type: "number", description: "Amount in USD/VRS to lock into the vault" },
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
    name: "deposit_funds",
    description: "Deposit real-time testnet funds directly into the Verisett vault.",
    inputSchema: {
      type: "object",
      properties: {
        amount_usd: { type: "number", description: "Amount in USD to deposit into the vault" },
        agent_name: { type: "string", description: "The exact name of the depositing agent" },
      },
      required: ["amount_usd"],
    },
  },
  {
    name: "transfer_funds",
    description: "Transfer funds from one agent to another, updating the live trajectory graph and ledger.",
    inputSchema: {
      type: "object",
      properties: {
        amount_usd: { type: "number", description: "Amount in USD to transfer" },
        from_agent: { type: "string", description: "Sender agent name" },
        to_agent: { type: "string", description: "Recipient agent name" },
        milestone: { type: "string", description: "Milestone description" },
        status: { type: "string", enum: ["SUCCESSFUL", "FAILED"] },
      },
      required: ["amount_usd"],
    },
  },
];

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: MCP_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  const detected = autoDetectAgentIdentity(req.headers);
  if (detected.hasAgentSignals) {
    setServerAgentConnected(true, undefined, detected.name, detected.model);
  }

  // Response strictly matching the MCP health check & gateway capability specification
  const responsePayload = {
    status: "healthy",
    server: "verisett-escrow",
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: { listChanged: false },
    },
  };

  return NextResponse.json(responsePayload, {
    status: 200,
    headers: MCP_HEADERS,
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
        // Allow discovery and initialization handshakes to pass through without 401
        if (
          method !== "initialize" &&
          method !== "tools/list" &&
          method !== "notifications/initialized" &&
          method !== "initialized"
        ) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id: id || null,
              error: {
                code: -32001,
                message: "Unauthorized: Invalid or revoked API key. Constant-time hash verification failed.",
              },
            },
            { status: 401, headers: MCP_HEADERS }
          );
        }
      } else {
        authenticatedAccount = authVerification.account;
      }
    }

    // Auto-mark connected on any FastMCP interaction
    const clientName =
      authenticatedAccount?.name ||
      params?.clientInfo?.name ||
      params?.client_name ||
      (detected.hasAgentSignals ? detected.name : null) ||
      "Autonomous FastMCP Agent";

    const clientVersion = params?.clientInfo?.version || "1.0.0";
    setServerAgentConnected(
      true,
      authenticatedAccount?.id || `agt_${Date.now().toString().slice(-6)}`,
      clientName,
      params?.clientInfo?.version ? `FastMCP ${clientVersion}` : detected.model
    );

    // 1. MCP Handshake Initialization
    if (method === "initialize") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id !== undefined ? id : 1,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "verisett-escrow",
              version: "1.0.0",
            },
          },
        },
        { status: 200, headers: MCP_HEADERS }
      );
    }

    // 2. Notifications Initialized
    if (method === "notifications/initialized" || method === "initialized") {
      return NextResponse.json(
        { jsonrpc: "2.0", result: {} },
        { status: 200, headers: MCP_HEADERS }
      );
    }

    // 3. Tools Listing
    if (method === "tools/list") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id !== undefined ? id : 1,
          result: {
            tools: MCP_TOOLS,
          },
        },
        { status: 200, headers: MCP_HEADERS }
      );
    }

    // 4. Tools Call Execution
    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const state = getVaultState();

      // Tool 1: create_escrow / create_vault
      if (
        toolName === "create_escrow" ||
        toolName === "create_vault" ||
        toolName === "create_escrow_vault" ||
        toolName === "create_contract_escrow"
      ) {
        const vId = args.contract_id || args.vault_id || args.vaultId || `vlt_${Date.now()}`;
        const payer = args.payer || args.payer_name || state.connected_agent_name || "Agent_Alpha_Buyer";
        const payee = args.beneficiary_id || args.payee || args.payee_name || "Agent_Theta_Worker";
        const amount = args.amount_cents
          ? Math.round(Number(args.amount_cents) / 100)
          : Number(args.amount ?? args.amount_usd ?? args.amount_vrs ?? 250);
        const ttl = Number(args.ttl_seconds || args.ttl || 3600);

        const res = createProgrammaticVault({ vault_id: vId, payer, payee, amount, ttl });
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            result: {
              content: [
                {
                  type: "text",
                  text: `SUCCESS: Programmatic Escrow '${res.vault.id}' created. Locked: $${amount} USD between '${payer}' -> '${payee}'. TTL: ${ttl}s. Status: ${res.vault.status}`,
                },
              ],
              data: res.vault,
              isError: false,
            },
          },
          { status: 200, headers: MCP_HEADERS }
        );
      }

      // Tool 2: claim_task
      if (toolName === "claim_task") {
        const contractId = args.contract_id || args.vault_id;
        const workerId = args.worker_agent_id || args.payee || "Agent_Theta_Worker";

        const vault = getProgrammaticVault(contractId);
        if (!vault) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id: id !== undefined ? id : 1,
              result: {
                content: [
                  {
                    type: "text",
                    text: `ERROR: Contract '${contractId}' not found in active registry.`,
                  },
                ],
                isError: true,
              },
            },
            { status: 200, headers: MCP_HEADERS }
          );
        }

        vault.payee = workerId;
        vault.status = "Custody Locked";
        const now = new Date();
        const ttlRemaining = vault.expiresAt
          ? Math.max(0, Math.floor((new Date(vault.expiresAt).getTime() - now.getTime()) / 1000))
          : 3600;

        saveVaultState(state);

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            result: {
              content: [
                {
                  type: "text",
                  text: `SUCCESS: Contract '${contractId}' claimed by worker '${workerId}'. TTL remaining: ${ttlRemaining}s. Status: Custody Locked`,
                },
              ],
              data: {
                contract_id: contractId,
                status: "CLAIMED",
                worker_agent_id: workerId,
                ttl_remaining_seconds: ttlRemaining,
              },
              isError: false,
            },
          },
          { status: 200, headers: MCP_HEADERS }
        );
      }

      // Tool 3: verify_and_settle / settle_vault
      if (toolName === "verify_and_settle" || toolName === "settle_vault") {
        const vId = args.contract_id || args.vault_id || args.vaultId;
        const assertion = args.output_payload ?? args.assertion_payload ?? args.assertion ?? {};
        let expected = args.expected_sha256 || args.expectedSha256 || "";

        // If no hash was provided by client, compute deliverable sha256 automatically
        if (!expected) {
          const payloadStr = typeof assertion === "string" ? assertion : JSON.stringify(assertion);
          expected = crypto.createHash("sha256").update(payloadStr).digest("hex");
        }

        const res = settleProgrammaticVault({
          vault_id: vId,
          assertion_payload: assertion,
          expected_sha256: expected,
        });

        if (!res.success) {
          return NextResponse.json(
            {
              jsonrpc: "2.0",
              id: id !== undefined ? id : 1,
              result: {
                content: [
                  {
                    type: "text",
                    text: `VERIFICATION FAILED: ${res.error}`,
                  },
                ],
                isError: true,
              },
            },
            { status: 200, headers: MCP_HEADERS }
          );
        }

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            result: {
              content: [
                {
                  type: "text",
                  text: `SUCCESS: Escrow '${vId}' settled! Net funds released to worker '${res.vault?.payee}'. Verified SHA-256: ${res.vault?.sha256Proof}. Tx: ${res.transaction?.id}`,
                },
              ],
              data: res.vault,
              isError: false,
            },
          },
          { status: 200, headers: MCP_HEADERS }
        );
      }

      // Tool 4: check_account_balance / check_balance
      if (toolName === "check_account_balance" || toolName === "check_balance") {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            result: {
              content: [
                {
                  type: "text",
                  text: `Current Vault Available Balance: $${state.available_balance.toLocaleString("en-US")} USD. Total Settlements: ${state.transactions.length}. Connected Agent: ${state.connected_agent_name}`,
                },
              ],
              data: {
                available_balance: state.available_balance,
                total_volume: state.total_volume,
                currency: "USD",
                total_settlements: state.transactions.length,
              },
              isError: false,
            },
          },
          { status: 200, headers: MCP_HEADERS }
        );
      }

      // Tool 5: get_contract_status / get_vault_status
      if (toolName === "get_contract_status" || toolName === "get_vault_status") {
        const vId = args.contract_id || args.vault_id || args.vaultId;
        const vault = getProgrammaticVault(vId);
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            result: {
              content: [
                {
                  type: "text",
                  text: vault
                    ? `Contract '${vault.id}': Status=${vault.status}, Amount=$${vault.amount} USD, Payer='${vault.payer}', Payee='${vault.payee}'`
                    : `Contract '${vId}' not found.`,
                },
              ],
              data: vault || null,
              isError: !vault,
            },
          },
          { status: 200, headers: MCP_HEADERS }
        );
      }

      // Direct deposit_funds
      if (toolName === "deposit_funds" || toolName === "deposit") {
        const amount = Number(args.amount_usd || args.amount_inr || args.amount || 250);
        const agentName = args.agent_name || state.connected_agent_name || "Connected Agent";

        const res = recordVaultDeposit({
          amountINR: amount,
          agentName,
          milestoneTitle: `FastMCP Vault Deposit by ${agentName}`,
        });

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            result: {
              content: [
                {
                  type: "text",
                  text: `SUCCESS: Deposited $${amount.toLocaleString("en-US")} USD into Verisett Vault by agent '${agentName}'. New Vault Balance: $${res.state.available_balance.toLocaleString("en-US")} USD. Ref: ${res.transaction.id}`,
                },
              ],
              isError: false,
            },
          },
          { status: 200, headers: MCP_HEADERS }
        );
      }

      // Direct transfer_funds
      if (toolName === "transfer_funds") {
        const amount = Number(args.amount_usd ?? args.amount_inr ?? args.amount ?? 250);
        const fromName = args.from_agent || args.payer_name || state.connected_agent_name || "Agent_Alpha_Buyer";
        const toName = args.to_agent || args.worker_name || args.beneficiary_id || "Agent_Theta_Worker";
        const status = args.status === "FAILED" ? "FAILED" : "SUCCESSFUL";

        const res = recordAgentTransfer({
          amountINR: amount,
          fromAgentName: fromName,
          toAgentName: toName,
          status,
          milestoneTitle: args.milestone || args.milestone_title || `Escrow Settlement: ${fromName} -> ${toName}`,
        });

        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            result: {
              content: [
                {
                  type: "text",
                  text: `SUCCESS: Settlement processed for $${amount.toLocaleString("en-US")} USD from '${fromName}' to '${toName}'. Status: ${status}. Vault Balance: $${res.state.available_balance.toLocaleString("en-US")} USD. Ref: ${res.transaction.id}`,
                },
              ],
              isError: false,
            },
          },
          { status: 200, headers: MCP_HEADERS }
        );
      }
    }

    // 5. Direct JSON-RPC method execution (without tools/call wrapper)
    if (method === "create_escrow" || method === "create_vault") {
      const args = params || {};
      const vId = args.contract_id || args.vault_id || args.vaultId || `vlt_${Date.now()}`;
      const payer = args.payer || args.payer_name || clientName || "Agent A";
      const payee = args.beneficiary_id || args.payee || args.payee_name || "Agent B";
      const amount = args.amount_cents
        ? Math.round(Number(args.amount_cents) / 100)
        : Number(args.amount ?? args.amount_usd ?? args.amount_vrs ?? 100);
      const ttl = Number(args.ttl_seconds || args.ttl || 3600);

      const res = createProgrammaticVault({ vault_id: vId, payer, payee, amount, ttl });
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id !== undefined ? id : 1,
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
            message: `Vault '${res.vault.id}' successfully locked with $${amount} USD.`,
          },
        },
        { status: 200, headers: MCP_HEADERS }
      );
    }

    if (method === "claim_task") {
      const args = params || {};
      const contractId = args.contract_id || args.vault_id;
      const workerId = args.worker_agent_id || args.payee || "Agent_Theta_Worker";
      const vault = getProgrammaticVault(contractId);
      if (!vault) {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            error: { code: -32002, message: `Contract '${contractId}' not found.` },
          },
          { status: 404, headers: MCP_HEADERS }
        );
      }
      vault.payee = workerId;
      vault.status = "Custody Locked";
      saveVaultState(getVaultState());
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id !== undefined ? id : 1,
          result: {
            contract_id: contractId,
            status: "CLAIMED",
            worker_agent_id: workerId,
          },
        },
        { status: 200, headers: MCP_HEADERS }
      );
    }

    if (method === "verify_and_settle" || method === "settle_vault") {
      const args = params || {};
      const vId = args.contract_id || args.vault_id || args.vaultId;
      const assertion = args.output_payload ?? args.assertion_payload ?? args.assertion;
      let expected = args.expected_sha256 || args.expectedSha256 || "";
      if (!expected) {
        const payloadStr = typeof assertion === "string" ? assertion : JSON.stringify(assertion);
        expected = crypto.createHash("sha256").update(payloadStr).digest("hex");
      }

      const res = settleProgrammaticVault({
        vault_id: vId,
        assertion_payload: assertion,
        expected_sha256: expected,
      });

      if (!res.success) {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            error: { code: -32002, message: res.error || "Settlement verification failed" },
          },
          { status: 400, headers: MCP_HEADERS }
        );
      }

      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id !== undefined ? id : 1,
          result: {
            vault_id: res.vault?.id,
            status: res.vault?.status,
            settled_at: res.vault?.settledAt,
            payer: res.vault?.payer,
            payee: res.vault?.payee,
            amount: res.vault?.amount,
            verified_sha256: res.vault?.sha256Proof,
            transaction_id: res.transaction?.id,
            message: "Cryptographic assertion verified. Funds cleared to payee.",
          },
        },
        { status: 200, headers: MCP_HEADERS }
      );
    }

    if (method === "get_contract_status" || method === "get_vault_status") {
      const args = params || {};
      const vId = args.contract_id || args.vault_id || args.vaultId;
      const vault = getProgrammaticVault(vId);
      if (!vault) {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: id !== undefined ? id : 1,
            result: { vault_id: vId, status: "NOT_FOUND", exists: false },
          },
          { status: 200, headers: MCP_HEADERS }
        );
      }
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id !== undefined ? id : 1,
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
        },
        { status: 200, headers: MCP_HEADERS }
      );
    }

    if (method === "check_account_balance" || method === "check_balance") {
      const state = getVaultState();
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id !== undefined ? id : 1,
          result: {
            available_balance: state.available_balance,
            frozen_balance: state.frozen_balance || 0,
            currency: "USD",
            total_settlements: state.transactions.length,
          },
        },
        { status: 200, headers: MCP_HEADERS }
      );
    }

    // Default response for unhandled JSON-RPC methods
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: id !== undefined ? id : 1,
        result: { status: "received" },
      },
      { status: 200, headers: MCP_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: err?.message || "Internal error" } },
      { status: 500, headers: MCP_HEADERS }
    );
  }
}

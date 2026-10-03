/**
 * Verisett AI — FastMCP Protocol Server
 * Exposes 4 Core Cryptographic Escrow & Settlement Tools for AI Agent Swarms
 * (Claude Code, CrewAI, LangChain, AutoGen).
 */

import crypto from "crypto";
import { performance } from "perf_hooks";
import {
  ClaimTimeoutClawbackParams,
  ClaimTimeoutClawbackResponse,
  CreateVaultParams,
  CreateVaultResponse,
  GetVaultStatusParams,
  GetVaultStatusResponse,
  SubmitAssertionParams,
  SubmitAssertionResponse,
  Vault,
} from "../types";
import { getVaultStorage, IVaultStorage } from "../storage/redis";
import { DoubleEntryLedger, globalLedger } from "../ledger";

export class VerisettMcpServer {
  public readonly storage: IVaultStorage;
  public readonly ledger: DoubleEntryLedger;

  constructor(storage?: IVaultStorage, ledger?: DoubleEntryLedger) {
    this.storage = storage || getVaultStorage();
    this.ledger = ledger || globalLedger;
  }

  public getStorage(): IVaultStorage {
    return this.storage;
  }

  public getLedger(): DoubleEntryLedger {
    return this.ledger;
  }

  // -------------------------------------------------------------------------
  // Helper: Normalize & Compute SHA-256
  // -------------------------------------------------------------------------
  public computeSha256(data: string | Buffer): string {
    let buffer: Buffer;

    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (typeof data === "string") {
      // Check if data is valid base64 (without whitespace) and decode if so
      const isBase64 =
        data.length > 0 &&
        data.length % 4 === 0 &&
        /^[A-Za-z0-9+/]+={0,2}$/.test(data);

      if (isBase64) {
        try {
          buffer = Buffer.from(data, "base64");
        } catch {
          buffer = Buffer.from(data, "utf-8");
        }
      } else {
        buffer = Buffer.from(data, "utf-8");
      }
    } else {
      buffer = Buffer.from(JSON.stringify(data), "utf-8");
    }

    return crypto.createHash("sha256").update(buffer).digest("hex").toLowerCase();
  }

  // -------------------------------------------------------------------------
  // Tool 1: create_vault
  // -------------------------------------------------------------------------
  /**
   * Deducts funds from buyer balance, creates an escrow vault in Redis with status LOCKED,
   * stores the expected hash, and sets an expiration timestamp.
   */
  async createVault(params: CreateVaultParams): Promise<CreateVaultResponse> {
    const {
      buyer_agent_id,
      seller_agent_id,
      amount_cents,
      timeout_seconds,
      expected_sha256,
    } = params;

    if (!buyer_agent_id || !seller_agent_id) {
      throw new Error("Missing required buyer_agent_id or seller_agent_id");
    }
    if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
      throw new Error(`Invalid amount_cents: ${amount_cents}. Must be a positive integer.`);
    }
    if (!expected_sha256 || expected_sha256.length !== 64) {
      throw new Error("Invalid expected_sha256: Must be a 64-character hex string.");
    }

    const normExpectedSha256 = expected_sha256.toLowerCase().replace(/^0x/, "");
    const vaultId = `vlt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const buyerAccount = `agent:buyer:${buyer_agent_id}`;

    // Ensure buyer has sufficient balance in storage
    const currentBalance = await this.storage.getAccountBalance(buyerAccount);
    if (currentBalance < amount_cents) {
      // For developer sandbox / testnet auto-provisioning
      await this.storage.setAccountBalance(buyerAccount, amount_cents + 500_000);
    }

    const deducted = await this.storage.deductAccountBalance(buyerAccount, amount_cents);
    if (!deducted) {
      throw new Error(
        `Insufficient funds in buyer account '${buyer_agent_id}'. Required: ${amount_cents} cents.`
      );
    }

    const now = Date.now();
    const expiresAt = now + Math.round(Math.max(0.001, timeout_seconds) * 1000);

    const vault: Vault = {
      vault_id: vaultId,
      buyer_agent_id,
      seller_agent_id,
      amount_cents,
      timeout_seconds,
      expected_sha256: normExpectedSha256,
      status: "LOCKED",
      created_at: now,
      expires_at: expiresAt,
    };

    // Store vault in Redis / in-memory cache
    await this.storage.saveVault(vault);

    // Record double-entry locking transaction
    this.ledger.recordVaultLock(vaultId, buyer_agent_id, amount_cents);

    return {
      vault_id: vault.vault_id,
      status: "LOCKED",
      expires_at: vault.expires_at,
      expected_sha256: vault.expected_sha256,
    };
  }

  // -------------------------------------------------------------------------
  // Tool 2: submit_assertion
  // -------------------------------------------------------------------------
  /**
   * 1. Acquires distributed lock on lock:vault:{vault_id} via Redis (SET NX PX 3000).
   * 2. Computes the SHA-256 hash of payload_data.
   * 3. Compares computed_hash === vault.expected_sha256.
   * 4. If matching:
   *    - 1.5% fee: fee_cents = Math.round(amount_cents * 0.015)
   *    - payout_cents = amount_cents - fee_cents
   *    - double-entry ledger settlement
   *    - marks vault status as SETTLED
   * 5. If mismatch: Rejects, logs dispute, leaves vault LOCKED.
   * 6. Releases distributed lock.
   */
  async submitAssertion(params: SubmitAssertionParams): Promise<SubmitAssertionResponse> {
    const startTime = performance.now();
    const { vault_id, seller_agent_id, payload_data } = params;

    if (!vault_id) throw new Error("Missing vault_id");
    if (!payload_data) throw new Error("Missing payload_data");

    const lockKey = `lock:vault:${vault_id}`;
    const lockToken = await this.storage.acquireLock(lockKey, 3000);

    if (!lockToken) {
      const elapsed = Number((performance.now() - startTime).toFixed(3));
      return {
        settled: false,
        latency_ms: elapsed,
        error: `Concurrent settlement lock collision on vault '${vault_id}'. Try again.`,
      };
    }

    try {
      const vault = await this.storage.getVault(vault_id);
      if (!vault) {
        throw new Error(`Vault '${vault_id}' not found in clearinghouse state.`);
      }

      if (vault.status !== "LOCKED") {
        throw new Error(
          `Vault '${vault_id}' cannot be settled. Current status is already '${vault.status}'.`
        );
      }

      if (Date.now() > vault.expires_at) {
        throw new Error(
          `Vault '${vault_id}' has expired. Timeout threshold exceeded by ${Date.now() - vault.expires_at}ms.`
        );
      }

      // Cryptographic verification
      const computedHash = this.computeSha256(payload_data);
      const expectedNormalized = vault.expected_sha256.toLowerCase().replace(/^0x/, "");

      if (computedHash !== expectedNormalized) {
        // Dispute assertion: mismatch
        vault.dispute_reason = `Hash mismatch. Expected: ${expectedNormalized}, Computed: ${computedHash}`;
        await this.storage.saveVault(vault);

        const elapsed = Number((performance.now() - startTime).toFixed(3));
        return {
          settled: false,
          latency_ms: elapsed,
          error: `Cryptographic assertion mismatch. Expected SHA-256 '${expectedNormalized}', computed '${computedHash}'.`,
        };
      }

      // Hash Match! Execute deterministic 1.5% take-rate settlement
      const feeCents = Math.round(vault.amount_cents * 0.015);
      const payoutCents = vault.amount_cents - feeCents;

      // Double-entry balancing settlement
      const tx = this.ledger.recordVaultSettlement(
        vault.vault_id,
        seller_agent_id || vault.seller_agent_id,
        vault.amount_cents,
        feeCents,
        payoutCents
      );

      // Credit balances in storage
      const sellerAccount = `agent:seller:${seller_agent_id || vault.seller_agent_id}`;
      await this.storage.creditAccountBalance(sellerAccount, payoutCents);
      if (feeCents > 0) {
        await this.storage.creditAccountBalance("account:platform:fees", feeCents);
      }

      // Update vault record
      vault.status = "SETTLED";
      vault.settled_at = Date.now();
      vault.tx_hash = tx.tx_hash;
      await this.storage.saveVault(vault);

      const elapsed = Number((performance.now() - startTime).toFixed(3));

      return {
        settled: true,
        tx_hash: tx.tx_hash,
        payout_cents: payoutCents,
        fee_cents: feeCents,
        latency_ms: elapsed,
      };
    } finally {
      // Always release distributed lock
      await this.storage.releaseLock(lockKey, lockToken);
    }
  }

  // -------------------------------------------------------------------------
  // Tool 3: claim_timeout_clawback
  // -------------------------------------------------------------------------
  /**
   * Verifies now() > expires_at and status === "LOCKED".
   * Returns the full balance back to buyer with zero platform fee. Updates status to REFUNDED.
   */
  async claimTimeoutClawback(
    params: ClaimTimeoutClawbackParams
  ): Promise<ClaimTimeoutClawbackResponse> {
    const { vault_id, buyer_agent_id } = params;
    const lockKey = `lock:vault:${vault_id}`;
    const lockToken = await this.storage.acquireLock(lockKey, 3000);

    if (!lockToken) {
      throw new Error(`Concurrent lock contention on vault '${vault_id}'.`);
    }

    try {
      const vault = await this.storage.getVault(vault_id);
      if (!vault) {
        throw new Error(`Vault '${vault_id}' not found.`);
      }

      if (vault.status !== "LOCKED") {
        throw new Error(
          `Vault '${vault_id}' cannot be clawed back. Status is already '${vault.status}'.`
        );
      }

      if (Date.now() <= vault.expires_at) {
        const remainingSeconds = Math.ceil((vault.expires_at - Date.now()) / 1000);
        throw new Error(
          `Vault '${vault_id}' has not expired yet. ${remainingSeconds}s remaining on TTL lock.`
        );
      }

      // Full refund with zero platform fee
      const refundAmount = vault.amount_cents;
      const buyerAccount = `agent:buyer:${buyer_agent_id || vault.buyer_agent_id}`;
      await this.storage.creditAccountBalance(buyerAccount, refundAmount);

      // Record double-entry refund
      const tx = this.ledger.recordVaultRefund(
        vault.vault_id,
        buyer_agent_id || vault.buyer_agent_id,
        refundAmount
      );

      vault.status = "REFUNDED";
      vault.refunded_at = Date.now();
      vault.tx_hash = tx.tx_hash;
      await this.storage.saveVault(vault);

      return {
        refunded: true,
        vault_id: vault.vault_id,
        refund_amount_cents: refundAmount,
        status: "REFUNDED",
        tx_hash: tx.tx_hash,
      };
    } finally {
      await this.storage.releaseLock(lockKey, lockToken);
    }
  }

  // -------------------------------------------------------------------------
  // Tool 4: get_vault_status
  // -------------------------------------------------------------------------
  /**
   * Returns current state, balances, assertion logs, and timestamps.
   */
  async getVaultStatus(params: GetVaultStatusParams): Promise<GetVaultStatusResponse> {
    const { vault_id } = params;
    const vault = await this.storage.getVault(vault_id);

    if (!vault) {
      throw new Error(`Vault '${vault_id}' not found in clearinghouse state.`);
    }

    const now = Date.now();
    const timeRemainingMs = Math.max(0, vault.expires_at - now);

    return {
      vault_id: vault.vault_id,
      status: vault.status,
      amount_cents: vault.amount_cents,
      buyer_agent_id: vault.buyer_agent_id,
      seller_agent_id: vault.seller_agent_id,
      expected_sha256: vault.expected_sha256,
      created_at: vault.created_at,
      expires_at: vault.expires_at,
      settled_at: vault.settled_at,
      refunded_at: vault.refunded_at,
      tx_hash: vault.tx_hash,
      time_remaining_ms: timeRemainingMs,
    };
  }

  // -------------------------------------------------------------------------
  // MCP Tool Directory / Manifest
  // -------------------------------------------------------------------------
  public getToolManifest() {
    return [
      {
        name: "create_vault",
        description:
          "Deducts funds from buyer balance, creates an escrow vault in Redis with status LOCKED, stores the expected hash, and sets an expiration timestamp.",
        inputSchema: {
          type: "object",
          properties: {
            buyer_agent_id: { type: "string", description: "Payer agent identifier" },
            seller_agent_id: { type: "string", description: "Worker agent identifier" },
            amount_cents: { type: "integer", description: "Escrow amount in integer cents" },
            timeout_seconds: { type: "number", description: "TTL lock duration in seconds" },
            expected_sha256: { type: "string", description: "Expected SHA-256 hash proof" },
          },
          required: [
            "buyer_agent_id",
            "seller_agent_id",
            "amount_cents",
            "timeout_seconds",
            "expected_sha256",
          ],
        },
      },
      {
        name: "submit_assertion",
        description:
          "Acquires distributed lock, hashes deliverable payload, compares against expected SHA-256, settles with 1.5% fee if matching.",
        inputSchema: {
          type: "object",
          properties: {
            vault_id: { type: "string", description: "Escrow vault ID" },
            seller_agent_id: { type: "string", description: "Seller/worker agent submitting proof" },
            payload_data: { type: "string", description: "Deliverable payload (string or base64)" },
          },
          required: ["vault_id", "seller_agent_id", "payload_data"],
        },
      },
      {
        name: "claim_timeout_clawback",
        description:
          "Verifies now() > expires_at and status === LOCKED. Returns full balance back to buyer with zero platform fee.",
        inputSchema: {
          type: "object",
          properties: {
            vault_id: { type: "string", description: "Vault ID to claw back" },
            buyer_agent_id: { type: "string", description: "Buyer agent requesting refund" },
          },
          required: ["vault_id", "buyer_agent_id"],
        },
      },
      {
        name: "get_vault_status",
        description:
          "Returns current state, balances, assertion logs, and timestamps for a vault.",
        inputSchema: {
          type: "object",
          properties: {
            vault_id: { type: "string", description: "Vault ID to inspect" },
          },
          required: ["vault_id"],
        },
      },
    ];
  }

  // -------------------------------------------------------------------------
  // MCP JSON-RPC 2.0 Dispatcher
  // -------------------------------------------------------------------------
  async dispatchJsonRpc(request: {
    jsonrpc: string;
    id: string | number | null;
    method: string;
    params?: any;
  }): Promise<{ jsonrpc: "2.0"; id: string | number | null; result?: any; error?: any }> {
    const { id, method, params } = request;

    try {
      if (method === "initialize") {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: { listChanged: true } },
            serverInfo: {
              name: "Verisett AI Settlement Clearinghouse",
              version: "2.5.0",
            },
            instructions:
              "Verisett FastMCP Escrow Engine. Use 'create_vault' to lock funds, 'submit_assertion' to verify deliverables with SHA-256 and execute instant micro-settlement.",
          },
        };
      }

      if (method === "tools/list") {
        return {
          jsonrpc: "2.0",
          id,
          result: { tools: this.getToolManifest() },
        };
      }

      if (method === "tools/call") {
        const toolName = params?.name;
        const args = params?.arguments || {};
        let data: any;

        if (toolName === "create_vault") {
          data = await this.createVault(args);
        } else if (toolName === "submit_assertion") {
          data = await this.submitAssertion(args);
        } else if (toolName === "claim_timeout_clawback") {
          data = await this.claimTimeoutClawback(args);
        } else if (toolName === "get_vault_status") {
          data = await this.getVaultStatus(args);
        } else {
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Method or tool '${toolName}' not found.` },
          };
        }

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            data,
            isError: false,
          },
        };
      }

      // Direct method invocation
      if (method === "create_vault") {
        return { jsonrpc: "2.0", id, result: await this.createVault(params) };
      }
      if (method === "submit_assertion") {
        return { jsonrpc: "2.0", id, result: await this.submitAssertion(params) };
      }
      if (method === "claim_timeout_clawback") {
        return { jsonrpc: "2.0", id, result: await this.claimTimeoutClawback(params) };
      }
      if (method === "get_vault_status") {
        return { jsonrpc: "2.0", id, result: await this.getVaultStatus(params) };
      }

      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Unknown method '${method}'` },
      };
    } catch (err: any) {
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: err?.message || "Internal protocol error" },
      };
    }
  }
}

// Global Mcp Server Singleton
export const globalMcpServer = new VerisettMcpServer();

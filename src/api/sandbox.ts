/**
 * Verisett AI — Public Testnet Sandbox Endpoint
 * Zero-auth instant cryptographic settlement verification for developers
 * (e.g. Hacker News Show HN live curl commands).
 */

import crypto from "crypto";
import http from "http";
import { performance } from "perf_hooks";
import { SandboxAssertRequest, SandboxAssertResponse, Vault } from "../types";
import { getVaultStorage, IVaultStorage } from "../storage/redis";
import { globalMcpServer, VerisettMcpServer } from "../mcp/server";

export class SandboxRouter {
  private mcpServer: VerisettMcpServer;
  private storage: IVaultStorage;

  constructor(mcpServer?: VerisettMcpServer, storage?: IVaultStorage) {
    this.mcpServer = mcpServer || globalMcpServer;
    this.storage = storage || this.mcpServer.getStorage();
  }

  /**
   * Core Handler for POST /v1/testnet/assert
   */
  async handleAssert(body: SandboxAssertRequest): Promise<{
    statusCode: number;
    body: SandboxAssertResponse;
  }> {
    const startTime = performance.now();
    const storage = this.storage;

    const payload = body?.payload;
    if (typeof payload !== "string") {
      const elapsed = Number((performance.now() - startTime).toFixed(3));
      return {
        statusCode: 400,
        body: {
          status: "REJECTED",
          verified: false,
          computed_sha256: "",
          expected_sha256: body?.expected_sha256 || "",
          network_fee_cents: 0,
          settlement_latency_ms: elapsed,
          audit_signature: "",
          error: "Missing required 'payload' string field in request body.",
        },
      };
    }

    const computedSha256 = this.mcpServer.computeSha256(payload);

    // If expected_sha256 was not explicitly passed, infer it from the deliverable for zero-auth demo
    const expectedSha256 = (body.expected_sha256 || computedSha256)
      .toLowerCase()
      .replace(/^0x/, "");

    const vaultId = body.vault_id || `vlt_testnet_${computedSha256.slice(0, 10)}`;

    // Ensure a testnet vault exists (auto-seed if not created yet)
    let vault = await storage.getVault(vaultId);
    if (!vault) {
      const now = Date.now();
      vault = {
        vault_id: vaultId,
        buyer_agent_id: "agent:buyer:hn_demo_sandbox",
        seller_agent_id: "agent:seller:autonomous_worker",
        amount_cents: 1000, // 10.00 VRS
        timeout_seconds: 300,
        expected_sha256: expectedSha256,
        status: "LOCKED",
        created_at: now,
        expires_at: now + 300_000,
      };
      await storage.saveVault(vault);
    }

    // Attempt settlement via MCP tool
    const settlementRes = await this.mcpServer.submitAssertion({
      vault_id: vault.vault_id,
      seller_agent_id: vault.seller_agent_id,
      payload_data: payload,
    });

    const elapsed = Number((performance.now() - startTime).toFixed(2));

    // Generate cryptographic HMAC audit signature
    const hmacSecret = process.env.AUDIT_HMAC_SECRET || "verisett_testnet_audit_secret_2026";
    const auditSignature =
      "sig_" +
      crypto
        .createHmac("sha256", hmacSecret)
        .update(`${vault.vault_id}:${computedSha256}:${settlementRes.settled}:${elapsed}`)
        .digest("hex")
        .slice(0, 32);

    if (settlementRes.settled) {
      return {
        statusCode: 200,
        body: {
          status: "SETTLED",
          verified: true,
          computed_sha256: `0x${computedSha256}`,
          expected_sha256: `0x${expectedSha256}`,
          network_fee_cents: settlementRes.fee_cents ?? 15,
          settlement_latency_ms: elapsed,
          audit_signature: auditSignature,
          tx_hash: settlementRes.tx_hash,
        },
      };
    } else {
      return {
        statusCode: 422,
        body: {
          status: "REJECTED",
          verified: false,
          computed_sha256: `0x${computedSha256}`,
          expected_sha256: `0x${expectedSha256}`,
          network_fee_cents: 0,
          settlement_latency_ms: elapsed,
          audit_signature: auditSignature,
          error: settlementRes.error || "Cryptographic assertion mismatch.",
        },
      };
    }
  }

  /**
   * Web Standard Fetch Handler (Compatible with Hono, Cloudflare, Next.js API Routes)
   */
  async fetchHandler(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
        },
      });
    }

    if (request.method === "POST" && (url.pathname === "/v1/testnet/assert" || url.pathname === "/api/sandbox/assert")) {
      try {
        const json = (await request.json().catch(() => ({}))) as SandboxAssertRequest;
        const result = await this.handleAssert(json);
        return new Response(JSON.stringify(result.body, null, 2), {
          status: result.statusCode,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "X-Settlement-Latency-Ms": String(result.body.settlement_latency_ms),
          },
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err?.message || "Internal server error" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        service: "Verisett AI Testnet Sandbox API",
        endpoint: "POST /v1/testnet/assert",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  /**
   * Create Standalone Node.js HTTP Server for local dev & benchmarking
   */
  createHttpServer(port: number = 8080): http.Server {
    const server = http.createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

      if (req.method === "POST" && parsedUrl.pathname === "/v1/testnet/assert") {
        let bodyRaw = "";
        req.on("data", (chunk) => {
          bodyRaw += chunk;
        });

        req.on("end", async () => {
          try {
            const parsed = bodyRaw ? JSON.parse(bodyRaw) : {};
            const outcome = await this.handleAssert(parsed);
            res.writeHead(outcome.statusCode, {
              "Content-Type": "application/json",
              "X-Settlement-Latency-Ms": String(outcome.body.settlement_latency_ms),
            });
            res.end(JSON.stringify(outcome.body, null, 2));
          } catch (e: any) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: e?.message || "Malformed JSON body" }));
          }
        });
        return;
      }

      // Default Health / Info
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          service: "Verisett AI Testnet Sandbox",
          status: "ONLINE",
          usage: "POST /v1/testnet/assert with { payload, expected_sha256 }",
        })
      );
    });

    return server;
  }
}

export const globalSandboxRouter = new SandboxRouter();

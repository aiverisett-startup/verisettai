import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runGeminiOperationsEngine } from "@/lib/geminiOpsTools";

export const dynamic = "force-dynamic";

/**
 * 24/7 Autonomous Operations Health Cron Handler
 * Can be triggered on a scheduled interval (e.g. every 5 or 15 minutes) by Vercel Cron, GitHub Actions, or internal runner.
 */
export async function GET(req: NextRequest) {
  return handleCronPulse(req);
}

export async function POST(req: NextRequest) {
  return handleCronPulse(req);
}

async function handleCronPulse(req: NextRequest) {
  try {
    // 1. Optional Bearer Token Authorization
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.OPS_CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow local development or test inspection with query param ?key=
      const url = new URL(req.url);
      if (url.searchParams.get("key") !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
      }
    }

    // 2. Collect Realtime Swarm & Escrow Telemetry
    const { data: agentRows } = await supabaseAdmin
      .from("registered_agents")
      .select("id, agent_name, agent_id_code, framework, status, spending_limit, last_heartbeat_at, ping_latency_ms")
      .limit(50);

    const agents = agentRows || [];
    const now = Date.now();

    const staleNodes: Array<{ id: string; name: string; idleSeconds: number }> = [];
    const activeNodes: Array<{ id: string; name: string; latencyMs: number }> = [];

    agents.forEach((a) => {
      if (a.last_heartbeat_at) {
        const ageSec = Math.round((now - new Date(a.last_heartbeat_at).getTime()) / 1000);
        if (ageSec > 60 && (a.status || "").toUpperCase() === "ACTIVE") {
          staleNodes.push({ id: a.id, name: a.agent_name, idleSeconds: ageSec });
        } else if (ageSec <= 60) {
          activeNodes.push({ id: a.id, name: a.agent_name, latencyMs: a.ping_latency_ms || 24 });
        }
      }
    });

    // 3. Vault & Settlement Telemetry
    const { data: vaultRows } = await supabaseAdmin
      .from("vaults")
      .select("id, balance, balance_cents, currency, status")
      .limit(20);

    // 4. Generate Idempotency Key (e.g. hourly window hash to prevent duplicate spam)
    const hourBucket = new Date().toISOString().slice(0, 13);
    const idempotencyKey = `cron_pulse_${hourBucket}_${staleNodes.length > 0 ? "stale_" + staleNodes.length : "healthy"}`;

    const contextDescription = `Autonomous Swarm Health Pulse:
- Total Registered Agents: ${agents.length}
- Actively Streaming Nodes: ${activeNodes.length}
- Stale/Unresponsive Nodes: ${staleNodes.length} ${staleNodes.length > 0 ? `(${JSON.stringify(staleNodes)})` : ""}
- Custody Vaults Monitored: ${vaultRows?.length || 0}`;

    // 5. Trigger Gemini 24/7 Operations Engine
    const result = await runGeminiOperationsEngine({
      triggerType: "CRON_PULSE",
      idempotencyKey,
      rawPayload: {
        totalAgents: agents.length,
        activeNodes,
        staleNodes,
        vaultsCount: vaultRows?.length || 0,
        timestamp: new Date().toISOString(),
      },
      contextDescription,
    });

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      telemetry: {
        totalAgents: agents.length,
        activeCount: activeNodes.length,
        staleCount: staleNodes.length,
      },
      geminiOps: result,
    });
  } catch (err: any) {
    console.error("[CRON-OPS-ERROR]", err);
    return NextResponse.json(
      { error: "Cron execution failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

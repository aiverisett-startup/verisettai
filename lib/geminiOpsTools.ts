import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ==============================================================================
// 1. Tool Declaration Definitions for Gemini Function Calling
// ==============================================================================

export const sendCustomerEmailDeclaration = {
  name: "send_customer_email",
  description:
    "Dispatches platform developer/customer notification, onboarding assistance, or incident resolution email.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      to: {
        type: "string",
        description: "Recipient developer or customer email address",
      },
      subject: {
        type: "string",
        description: "Subject line for the operational email",
      },
      html_content: {
        type: "string",
        description: "HTML formatted body content with clear next steps and context",
      },
    },
    required: ["to", "subject", "html_content"],
  },
};

export const sendAdminAlertDeclaration = {
  name: "send_admin_alert",
  description:
    "Dispatches an urgent operational notification to the founder/admin phone via Telegram or webhook channel.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      severity: {
        type: "string",
        enum: ["info", "warning", "critical"],
        description: "Alert urgency level: 'info', 'warning', or 'critical'",
      },
      title: {
        type: "string",
        description: "Short, high-contrast headline for the incident or pulse",
      },
      details: {
        type: "string",
        description: "Diagnostic telemetry details, impacted nodes, and recommended action",
      },
    },
    required: ["severity", "title", "details"],
  },
};

export const queryAgentHealthDeclaration = {
  name: "query_agent_health",
  description:
    "Queries public.registered_agents in Supabase to inspect a node's registration state, spending limit, or heartbeat latency.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      agent_id: {
        type: "string",
        description: "UUID, agent_id_code (e.g. AGT-XXXXXXXX), or agent name to inspect",
      },
    },
    required: ["agent_id"],
  },
};

export const recordAuditLogDeclaration = {
  name: "record_audit_log",
  description:
    "Persists operational history, decision reasoning, and execution results into public.ops_audit_logs for compliance.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      trigger_type: {
        type: "string",
        description: "Trigger source (e.g. CRON_PULSE, INBOUND_INQUIRY, FAILED_HANDSHAKE, ESCROW_THRESHOLD)",
      },
      idempotency_key: {
        type: "string",
        description: "Unique string key ensuring idempotency and loop prevention",
      },
      agent_id: {
        type: "string",
        description: "Optional ID of the impacted agent node",
      },
      tool_called: {
        type: "string",
        description: "The name of the tool executed",
      },
      reasoning: {
        type: "string",
        description: "Explanation of why this action was decided by the Gemini Ops Engine",
      },
    },
    required: ["trigger_type", "idempotency_key", "tool_called", "reasoning"],
  },
};

export const geminiOpsToolDeclarations = [
  sendCustomerEmailDeclaration,
  sendAdminAlertDeclaration,
  queryAgentHealthDeclaration,
  recordAuditLogDeclaration,
];

// ==============================================================================
// 2. Tool Execution Handlers
// ==============================================================================

/**
 * Dispatches email to customer/developer via Resend API or dev relay fallback
 */
export async function executeSendCustomerEmail({
  to,
  subject,
  html_content,
}: {
  to: string;
  subject: string;
  html_content: string;
}): Promise<{ success: boolean; deliveredVia: string; messageId?: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Verisett Operations <ops@veri-sett.com>",
          to: [to],
          subject,
          html: html_content,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        return { success: true, deliveredVia: "Resend", messageId: resData.id };
      }
      return {
        success: false,
        deliveredVia: "Resend",
        error: resData.message || JSON.stringify(resData),
      };
    } catch (err: any) {
      return { success: false, deliveredVia: "Resend", error: err?.message || String(err) };
    }
  }

  // Headless development / fallback relay
  console.log(`[OPS-EMAIL-RELAY] Simulated dispatch to ${to}: "${subject}"`);
  return {
    success: true,
    deliveredVia: "Mock-Dev-Relay",
    messageId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

/**
 * Dispatches urgent notifications to the founder's phone/webhook via Telegram or webhook URL
 */
export async function executeSendAdminAlert({
  severity,
  title,
  details,
}: {
  severity: "info" | "warning" | "critical";
  title: string;
  details: string;
}): Promise<{ success: boolean; deliveredVia: string; alertId: string; error?: string }> {
  const alertId = `alt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.ADMIN_CHAT_ID;
  const webhookUrl = process.env.ADMIN_ALERT_WEBHOOK_URL;

  const severityEmoji = severity === "critical" ? "🚨" : severity === "warning" ? "⚠️" : "ℹ️";
  const formattedMessage = `${severityEmoji} *[VERISETT OPS - ${severity.toUpperCase()}]*\n*${title}*\n\n${details}\n\n_Alert ID: ${alertId} | ${new Date().toISOString()}_`;

  let delivered = false;
  let deliveryMethod = "Local-Console";

  // 1. Telegram Dispatch
  if (telegramBotToken && adminChatId) {
    try {
      const tgRes = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminChatId,
            text: formattedMessage,
            parse_mode: "Markdown",
          }),
        }
      );
      if (tgRes.ok) {
        delivered = true;
        deliveryMethod = "Telegram";
      }
    } catch (err) {
      console.warn("[OPS-ALERT] Telegram dispatch failed:", err);
    }
  }

  // 2. Webhook Dispatch (Discord, Slack, or generic HTTP endpoint)
  if (webhookUrl) {
    try {
      const whRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId,
          severity,
          title,
          details,
          timestamp: new Date().toISOString(),
          content: formattedMessage,
        }),
      });
      if (whRes.ok) {
        delivered = true;
        deliveryMethod = deliveryMethod === "Telegram" ? "Telegram+Webhook" : "Webhook";
      }
    } catch (err) {
      console.warn("[OPS-ALERT] Webhook dispatch failed:", err);
    }
  }

  if (!delivered) {
    console.log(`[OPS-ALERT-${severity.toUpperCase()}] ${title}: ${details}`);
  }

  return { success: true, deliveredVia: deliveryMethod, alertId };
}

/**
 * Queries public.registered_agents in Supabase to inspect a node's registration state, spending limit, or heartbeat latency
 */
export async function executeQueryAgentHealth({
  agent_id,
}: {
  agent_id: string;
}): Promise<{
  found: boolean;
  agent?: {
    id: string;
    agentName: string;
    agentIdCode?: string;
    framework: string;
    spendingLimit: number;
    status: string;
    lastHeartbeatAt: string | null;
    heartbeatAgeSeconds: number | null;
    isHealthy: boolean;
    pingLatencyMs: number | null;
    throughputTps: number | null;
    webhookUrl: string | null;
  };
  message?: string;
}> {
  try {
    // 1. Check registered_agents table
    const { data: regRows, error: regErr } = await supabaseAdmin
      .from("registered_agents")
      .select("*")
      .or(`id.eq.${agent_id},agent_id_code.eq.${agent_id},agent_name.eq.${agent_id}`)
      .limit(1);

    let row = regRows && regRows.length > 0 ? regRows[0] : null;

    // 2. Fallback check on agents table if not in registered_agents
    if (!row) {
      const { data: legacyRows } = await supabaseAdmin
        .from("agents")
        .select("*")
        .or(`id.eq.${agent_id},name.eq.${agent_id}`)
        .limit(1);

      if (legacyRows && legacyRows.length > 0) {
        const l = legacyRows[0];
        row = {
          id: l.id,
          agent_name: l.name,
          framework: l.framework,
          spending_limit: 0,
          status: l.status,
          last_heartbeat_at: l.last_heartbeat_at,
          ping_latency_ms: l.ping_latency_ms,
        };
      }
    }

    if (!row) {
      return { found: false, message: `Node '${agent_id}' was not found in registered_agents.` };
    }

    const lastHb = row.last_heartbeat_at;
    let heartbeatAgeSeconds: number | null = null;
    let isHealthy = false;

    if (lastHb) {
      const diffMs = Date.now() - new Date(lastHb).getTime();
      heartbeatAgeSeconds = Math.round(diffMs / 1000);
      isHealthy = (row.status || "").toUpperCase() !== "REVOKED" && heartbeatAgeSeconds <= 60;
    }

    return {
      found: true,
      agent: {
        id: row.id,
        agentName: row.agent_name,
        agentIdCode: row.agent_id_code,
        framework: row.framework || "FastMCP",
        spendingLimit: Number(row.spending_limit || 0),
        status: row.status || "Unlinked",
        lastHeartbeatAt: lastHb,
        heartbeatAgeSeconds,
        isHealthy,
        pingLatencyMs: row.ping_latency_ms || null,
        throughputTps: row.throughput_tps || null,
        webhookUrl: row.webhook_url || null,
      },
    };
  } catch (err: any) {
    return { found: false, message: `Health query failed: ${err?.message || String(err)}` };
  }
}

/**
 * Persists operational history, decision reasoning, and results into public.ops_audit_logs
 */
export async function executeRecordAuditLog({
  trigger_type,
  idempotency_key,
  agent_id,
  tool_called,
  tool_parameters = {},
  result = {},
  reasoning,
}: {
  trigger_type: string;
  idempotency_key: string;
  agent_id?: string;
  tool_called: string;
  tool_parameters?: Record<string, any>;
  result?: Record<string, any>;
  reasoning: string;
}): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("ops_audit_logs")
      .insert({
        trigger_type,
        idempotency_key,
        agent_id: agent_id || null,
        tool_called,
        tool_parameters,
        result,
        reasoning,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      console.warn("[OPS-AUDIT] Log persistence note:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data?.id };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Checks idempotency state to avoid duplicate alerts and loops within a time window
 */
export async function isIdempotencyKeyProcessed(idempotencyKey: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("ops_audit_logs")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .limit(1);

    return Boolean(data && data.length > 0);
  } catch {
    return false;
  }
}

// ==============================================================================
// 3. Main Autonomous Gemini Operations Orchestration Engine
// ==============================================================================

export interface GeminiOpsRunInput {
  triggerType: "CRON_PULSE" | "INBOUND_INQUIRY" | "FAILED_HANDSHAKE" | "ESCROW_THRESHOLD" | string;
  idempotencyKey: string;
  agentId?: string;
  customerEmail?: string;
  rawPayload: Record<string, any>;
  contextDescription: string;
}

export interface GeminiOpsExecutionResult {
  success: boolean;
  model: string;
  executedTools: Array<{
    tool: string;
    params: any;
    result: any;
  }>;
  explanation: string;
  skippedDueToIdempotency?: boolean;
  error?: string;
}

export async function runGeminiOperationsEngine(
  input: GeminiOpsRunInput
): Promise<GeminiOpsExecutionResult> {
  const {
    triggerType,
    idempotencyKey,
    agentId,
    customerEmail,
    rawPayload,
    contextDescription,
  } = input;

  // 1. Idempotency Check & Loop Prevention
  const alreadyProcessed = await isIdempotencyKeyProcessed(idempotencyKey);
  if (alreadyProcessed) {
    return {
      success: true,
      model: "idempotency-cache",
      executedTools: [],
      explanation: `Event '${idempotencyKey}' was previously processed and resolved. Suppressed duplicate operational action to prevent loops.`,
      skippedDueToIdempotency: true,
    };
  }

  // 2. Gemini API Key Authentication
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // If no GEMINI_API_KEY is configured in development, run deterministic rule engine
    console.warn(
      "[GEMINI-OPS] GEMINI_API_KEY is not set. Executing deterministic fallback ops rule."
    );
    const alertRes = await executeSendAdminAlert({
      severity: triggerType === "FAILED_HANDSHAKE" ? "warning" : "info",
      title: `[FALLBACK OPS] Trigger: ${triggerType}`,
      details: `Gemini API key missing. Event context: ${contextDescription}`,
    });

    await executeRecordAuditLog({
      trigger_type: triggerType,
      idempotency_key: idempotencyKey,
      agent_id: agentId,
      tool_called: "send_admin_alert",
      tool_parameters: { severity: "info", title: triggerType },
      result: alertRes,
      reasoning: "Executed fallback alert handler because GEMINI_API_KEY was not configured.",
    });

    return {
      success: true,
      model: "deterministic-fallback",
      executedTools: [{ tool: "send_admin_alert", params: {}, result: alertRes }],
      explanation: "Fallback rule handled event without LLM synthesis.",
    };
  }

  // 3. Initialize Official Google Gen AI SDK
  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_OPS_MODEL || "gemini-2.5-flash";

  const systemInstruction = `You are the Verisett Protocol 24/7 Autonomous Operations Copilot.
Your job is to safeguard autonomous agent swarms, verify multi-tenant escrow thresholds, inspect heartbeat latency, handle customer developer inquiries, and dispatch proactive alerts when nodes fail or anomalies occur.
You have access to 4 function tools:
1. 'send_customer_email': Dispatches guidance or resolutions to platform developers.
2. 'send_admin_alert': Alerts the founder on Telegram/webhook for outages, threshold breaches, or critical anomalies.
3. 'query_agent_health': Looks up a node's live registration, heartbeat age, and spending limits in Supabase.
4. 'record_audit_log': Saves the action and reasoning into public.ops_audit_logs.

Rules:
- When investigating a node or incident, query its health with query_agent_health first if an agent_id is provided.
- If a customer asks a question, dispatch a helpful reply with send_customer_email.
- If a critical failure or spending limit breach occurs, call send_admin_alert.
- Always record your final reasoning with record_audit_log using the provided idempotency_key.
- Be concise, deterministic, and safe.`;

  const promptContent = `Operational Trigger: ${triggerType}
Idempotency Key: ${idempotencyKey}
Agent ID: ${agentId || "None"}
Customer Email: ${customerEmail || "None"}
Context Summary: ${contextDescription}
Event Payload JSON: ${JSON.stringify(rawPayload, null, 2)}

Analyze this operational situation and take appropriate automated actions via tool calls.`;

  const executedTools: Array<{ tool: string; params: any; result: any }> = [];

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptContent,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: geminiOpsToolDeclarations }],
      },
    });

    const functionCalls = response.functionCalls || [];

    for (const call of functionCalls) {
      const toolName = call.name || "unknown_tool";
      const args = (call.args || {}) as any;

      let toolResult: any = null;

      if (toolName === "send_customer_email") {
        toolResult = await executeSendCustomerEmail({
          to: args.to || customerEmail || "",
          subject: args.subject || "Verisett Protocol Operational Notice",
          html_content: args.html_content || "<p>Operational notification</p>",
        });
      } else if (toolName === "send_admin_alert") {
        toolResult = await executeSendAdminAlert({
          severity: args.severity || "info",
          title: args.title || "Verisett Ops Alert",
          details: args.details || contextDescription,
        });
      } else if (toolName === "query_agent_health") {
        toolResult = await executeQueryAgentHealth({
          agent_id: args.agent_id || agentId || "",
        });
      } else if (toolName === "record_audit_log") {
        toolResult = await executeRecordAuditLog({
          trigger_type: args.trigger_type || triggerType,
          idempotency_key: args.idempotency_key || idempotencyKey,
          agent_id: args.agent_id || agentId,
          tool_called: args.tool_called || "gemini_ops",
          tool_parameters: args,
          result: { status: "recorded" },
          reasoning: args.reasoning || "Autonomous operation verified",
        });
      }

      executedTools.push({
        tool: toolName,
        params: args,
        result: toolResult,
      });
    }

    // Ensure at least one audit record is saved with this idempotency key
    if (!executedTools.some((t) => t.tool === "record_audit_log")) {
      await executeRecordAuditLog({
        trigger_type: triggerType,
        idempotency_key: idempotencyKey,
        agent_id: agentId,
        tool_called: executedTools.length > 0 ? executedTools[0].tool : "llm_evaluation",
        tool_parameters: { toolCount: executedTools.length },
        result: { responseText: response.text },
        reasoning: response.text || "Gemini operations evaluation completed.",
      });
    }

    return {
      success: true,
      model: modelName,
      executedTools,
      explanation: response.text || `Executed ${executedTools.length} automated tool actions.`,
    };
  } catch (err: any) {
    console.error("[GEMINI-OPS-ERROR]", err);
    return {
      success: false,
      model: modelName,
      executedTools,
      explanation: "Gemini autonomous engine failed to execute.",
      error: err?.message || String(err),
    };
  }
}

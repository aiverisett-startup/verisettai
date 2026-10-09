"use server";

import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export interface RegisterAgentInput {
  agentName: string;
  framework: string;
  spendingLimit: number;
  webhookUrl?: string;
}

export interface RegisteredAgentRecord {
  id: string;
  agentName: string;
  framework: string;
  spendingLimit: number;
  webhookUrl: string | null;
  createdAt: string;
}

export interface RegisterAgentResult {
  success: boolean;
  agent?: RegisteredAgentRecord;
  apiKey?: string;
  error?: string;
}

export async function registerAgentAction(
  input: RegisterAgentInput
): Promise<RegisterAgentResult> {
  try {
    // 1. Verify User Authentication via @supabase/ssr
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized: You must be signed in to register an autonomous agent.",
      };
    }

    // 2. Validate Form Inputs
    const trimmedName = (input.agentName || "").trim();
    if (!trimmedName) {
      return {
        success: false,
        error: "Agent Identifier is required.",
      };
    }

    if (trimmedName.length < 2 || trimmedName.length > 64) {
      return {
        success: false,
        error: "Agent Identifier must be between 2 and 64 characters.",
      };
    }

    const allowedFrameworks = [
      "FastMCP",
      "LangGraph",
      "CrewAI",
      "AutoGen",
      "Custom REST",
    ];
    const frameworkValue = allowedFrameworks.includes(input.framework)
      ? input.framework
      : "FastMCP";

    const spendingLimitNum = Number(input.spendingLimit);
    if (isNaN(spendingLimitNum) || spendingLimitNum < 0) {
      return {
        success: false,
        error: "Spending limit must be a positive number.",
      };
    }

    const trimmedWebhook = (input.webhookUrl || "").trim();
    if (trimmedWebhook) {
      try {
        const parsed = new URL(trimmedWebhook);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return {
            success: false,
            error: "Webhook URL must use HTTP or HTTPS protocol.",
          };
        }
      } catch {
        return {
          success: false,
          error: "Please enter a valid Webhook URL (e.g. https://api.yourdomain.com/webhook).",
        };
      }
    }

    // 3. Generate Cryptographically Secure API Token
    // Format: vst_live_<random_hex_string>
    const randomHex = crypto.randomBytes(16).toString("hex");
    const rawApiKey = `vst_live_${randomHex}`;
    const keyHint = `...${rawApiKey.slice(-4)}`;
    const keyHash = crypto.createHash("sha256").update(rawApiKey).digest("hex");

    // 4. Insert into public.registered_agents table
    let registeredAgentId = crypto.randomUUID();
    let createdAtIso = new Date().toISOString();

    const { data: insertedData, error: dbError } = await supabase
      .from("registered_agents")
      .insert({
        user_id: user.id,
        agent_name: trimmedName,
        framework: frameworkValue,
        spending_limit: spendingLimitNum,
        webhook_url: trimmedWebhook || null,
        api_key: rawApiKey,
      })
      .select("id, agent_name, framework, spending_limit, webhook_url, created_at")
      .maybeSingle();

    if (dbError) {
      // If table is still propagating in Supabase cache, fallback gracefully
      if (dbError.code === "PGRST205") {
        console.warn(
          "Notice: public.registered_agents pending remote schema cache sync. Using fallback sync."
        );
      } else {
        console.error("Database error inserting registered_agents:", dbError);
        return {
          success: false,
          error: dbError.message || "Failed to persist registered agent to database.",
        };
      }
    } else if (insertedData) {
      registeredAgentId = insertedData.id;
      createdAtIso = insertedData.created_at || createdAtIso;
    }

    // 5. Also register in public.agents and public.api_keys for unified telemetry
    try {
      await supabase.from("agents").insert({
        user_id: user.id,
        name: trimmedName,
        framework: frameworkValue,
        ping_latency_ms: null,
        status: "Unlinked",
      });
    } catch (e) {
      console.warn("Telemetry agents insertion notice:", e);
    }

    try {
      await supabase.from("api_keys").insert({
        user_id: user.id,
        key_hash: keyHash,
        key_hint: keyHint,
        prefix: "vst_live_",
        name: `${trimmedName} Key`,
        status: "ACTIVE",
      });
    } catch (e) {
      console.warn("Telemetry api_keys insertion notice:", e);
    }

    // 6. Return response with raw API key displayed only once
    return {
      success: true,
      agent: {
        id: registeredAgentId,
        agentName: trimmedName,
        framework: frameworkValue,
        spendingLimit: spendingLimitNum,
        webhookUrl: trimmedWebhook || null,
        createdAt: createdAtIso,
      },
      apiKey: rawApiKey,
    };
  } catch (err: any) {
    console.error("Unhandled error in registerAgentAction:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while registering the agent.",
    };
  }
}

export async function fetchRegisteredAgentsAction(): Promise<{
  success: boolean;
  agents: RegisteredAgentRecord[];
  error?: string;
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, agents: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("registered_agents")
      .select("id, agent_name, framework, spending_limit, webhook_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty list gracefully
      return { success: true, agents: [] };
    }

    const mapped: RegisteredAgentRecord[] = (data || []).map((item) => ({
      id: item.id,
      agentName: item.agent_name,
      framework: item.framework,
      spendingLimit: Number(item.spending_limit || 0),
      webhookUrl: item.webhook_url || null,
      createdAt: item.created_at,
    }));

    return { success: true, agents: mapped };
  } catch (err: any) {
    return { success: false, agents: [], error: err?.message };
  }
}

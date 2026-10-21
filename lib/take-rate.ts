import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ProtocolPlanTier = "starter" | "pro" | "institutional" | "sovereign";

export interface PlanTakeRate {
  tier: ProtocolPlanTier;
  planId: string;
  planName: string;
  rate: number; // Decimal rate e.g. 0.02, 0.015, 0.01, 0.0075
  ratePercentage: string; // "2.0%", "1.5%", "1.0%", "0.75%"
  feeBasisPoints: number; // 200, 150, 100, 75
  isLifetime: boolean;
}

export const TIER_CONFIGS: Record<ProtocolPlanTier, PlanTakeRate> = {
  starter: {
    tier: "starter",
    planId: "community",
    planName: "Starter Plan",
    rate: 0.02,
    ratePercentage: "2.0%",
    feeBasisPoints: 200,
    isLifetime: false,
  },
  pro: {
    tier: "pro",
    planId: "tier_1",
    planName: "Developer / Pro Plan",
    rate: 0.015,
    ratePercentage: "1.5%",
    feeBasisPoints: 150,
    isLifetime: false,
  },
  institutional: {
    tier: "institutional",
    planId: "tier_2",
    planName: "Institutional / Enterprise Plan",
    rate: 0.01,
    ratePercentage: "1.0%",
    feeBasisPoints: 100,
    isLifetime: false,
  },
  sovereign: {
    tier: "sovereign",
    planId: "tier_3",
    planName: "Sovereign Node Plan",
    rate: 0.0075,
    ratePercentage: "0.75%",
    feeBasisPoints: 75,
    isLifetime: true,
  },
};

/**
 * Normalizes any plan key or alias into standard PlanTakeRate configuration
 */
export function getTakeRateForPlan(rawPlan?: string | null): PlanTakeRate {
  if (!rawPlan) return TIER_CONFIGS.starter;

  const p = String(rawPlan).toLowerCase().trim();

  if (p === "tier_3" || p === "tier3" || p === "sovereign" || p === "lifetime" || p.includes("sovereign")) {
    return TIER_CONFIGS.sovereign;
  }
  if (p === "tier_2" || p === "tier2" || p === "institutional" || p === "enterprise" || p.includes("enterprise")) {
    return TIER_CONFIGS.institutional;
  }
  if (p === "tier_1" || p === "tier1" || p === "pro" || p === "builder" || p === "developer") {
    return TIER_CONFIGS.pro;
  }

  return TIER_CONFIGS.starter;
}

/**
 * Dynamically resolves the active protocol take-rate for a payer or user
 * Checks registrations, profiles, and registered_agents in Supabase.
 * Defaults to Starter (2.0%) if no paid allocation is found.
 */
export async function resolveTakeRateForPayer(
  identifier?: string | null
): Promise<PlanTakeRate> {
  if (!identifier) {
    return TIER_CONFIGS.starter;
  }

  const cleanId = String(identifier).trim();

  try {
    // 1. Check registrations table (keyed by email or agent_id)
    const { data: regRows } = await supabaseAdmin
      .from("registrations")
      .select("plan_id")
      .or(`email.eq.${cleanId},agent_id.eq.${cleanId}`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (regRows && regRows.length > 0 && regRows[0].plan_id) {
      return getTakeRateForPlan(regRows[0].plan_id);
    }

    // 2. Check profiles table (if identifier is a UUID or email)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);
    if (isUuid) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("plan_id")
        .eq("id", cleanId)
        .maybeSingle();

      if (profile && profile.plan_id) {
        return getTakeRateForPlan(profile.plan_id);
      }
    } else if (cleanId.includes("@")) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("plan_id")
        .eq("email", cleanId)
        .maybeSingle();

      if (profile && profile.plan_id) {
        return getTakeRateForPlan(profile.plan_id);
      }
    }

    // 3. Check registered_agents table
    const { data: agentRows } = await supabaseAdmin
      .from("registered_agents")
      .select("framework, spending_limit")
      .or(`id.eq.${cleanId},agent_id_code.eq.${cleanId}`)
      .limit(1);

    if (agentRows && agentRows.length > 0) {
      // If agent spending limit is institutional (> 50,000) or tagged sovereign
      const ag = agentRows[0];
      if (ag.spending_limit >= 100000) {
        return TIER_CONFIGS.sovereign;
      }
      if (ag.spending_limit >= 25000) {
        return TIER_CONFIGS.institutional;
      }
      if (ag.spending_limit >= 5000) {
        return TIER_CONFIGS.pro;
      }
    }
  } catch (err) {
    console.warn("[TakeRateResolver] Lookup notice:", err);
  }

  // Default fallback for Starter tier
  return TIER_CONFIGS.starter;
}

/**
 * Calculates balanced double-entry accounting split for a given gross amount and rate
 * Strictly balances: Gross Principal = Net Disbursed + Protocol Take-Rate Fee
 */
export function computeBalancedSettlementSplit(
  grossAmountCentsOrPaise: number,
  takeRate: PlanTakeRate
): {
  grossAmount: number;
  feeAmount: number;
  netDisbursed: number;
  takeRate: PlanTakeRate;
} {
  const gross = Math.max(1, Math.round(grossAmountCentsOrPaise));
  // Exact fee computation
  const feeAmount = Math.max(1, Math.round(gross * takeRate.rate));
  const netDisbursed = Math.max(0, gross - feeAmount);

  return {
    grossAmount: gross,
    feeAmount,
    netDisbursed,
    takeRate,
  };
}

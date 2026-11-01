import { getTierLevel } from "./pricingTiers";

async function getAdminClient() {
  if (typeof window !== "undefined") return null;
  const { supabaseAdmin } = await import("./supabaseAdmin");
  return supabaseAdmin;
}

export interface PlanConfig {
  id: "builder" | "enterprise" | string;
  displayName: string;
  basePrice: number;
  gstAmount: number;
  totalPrice: number;
  maxSubscribers: number | null;
  currentSubscribers: number;
  isPaused: boolean;
  isArchived: boolean;
  isSoldOut?: boolean;
  remainingSlots?: number | null;
}

// In-memory fallback / cache store attached to globalThis to survive serverless function reloads
const globalForPlans = globalThis as unknown as {
  _verisettPlanConfigs?: Map<string, PlanConfig>;
};

const DEFAULT_PLAN_CONFIGS: PlanConfig[] = [
  {
    id: "builder",
    displayName: "Builder Protocol",
    basePrice: 2500,
    gstAmount: 450,
    totalPrice: 2950,
    maxSubscribers: null, // Unlimited/Customizable
    currentSubscribers: 0,
    isPaused: false,
    isArchived: false,
  },
  {
    id: "enterprise",
    displayName: "Enterprise Protocol",
    basePrice: 30000,
    gstAmount: 5400,
    totalPrice: 35400,
    maxSubscribers: 200, // Strictly capped at 200 Enterprise nodes
    currentSubscribers: 0,
    isPaused: false,
    isArchived: false,
  },
];

function initPlanCache(): Map<string, PlanConfig> {
  const map = new Map<string, PlanConfig>();
  for (const plan of DEFAULT_PLAN_CONFIGS) {
    map.set(plan.id, { ...plan });
  }
  return map;
}

const planCache = globalForPlans._verisettPlanConfigs || initPlanCache();
if (!globalForPlans._verisettPlanConfigs) {
  globalForPlans._verisettPlanConfigs = planCache;
}

/**
 * Normalizes input plan IDs to canonical DB keys ('builder' | 'enterprise')
 */
export function normalizeTierKey(id: string): "builder" | "enterprise" {
  const lower = (id || "").toLowerCase().trim();
  if (lower.includes("enterprise") || lower.includes("tier_3") || lower.includes("sovereign") || lower.includes("scale")) {
    return "enterprise";
  }
  return "builder";
}

/**
 * Normalizes input plan IDs to canonical DB keys ('community', 'tier_1', 'tier_2', 'tier_3')
 */
export function normalizePlanId(id: string): "community" | "tier_1" | "tier_2" | "tier_3" {
  switch (id.toLowerCase().trim()) {
    case "tier_1":
    case "tier1":
    case "builder":
    case "developer":
    case "pro":
      return "tier_1";
    case "tier_2":
    case "tier2":
    case "growth":
    case "settlement":
    case "institutional":
      return "tier_2";
    case "tier_3":
    case "tier3":
    case "sovereign":
    case "lifetime":
    case "founder-pass":
    case "enterprise":
    case "scale":
      return "tier_3";
    case "community":
    case "starter":
    case "free":
    default:
      return "community";
  }
}

/**
 * Attaches derived capacity fields (isSoldOut, remainingSlots) to a PlanConfig
 */
export function enrichPlanConfig(plan: PlanConfig): PlanConfig {
  const isSoldOut = plan.maxSubscribers !== null && plan.currentSubscribers >= plan.maxSubscribers;
  const remainingSlots =
    plan.maxSubscribers !== null ? Math.max(0, plan.maxSubscribers - plan.currentSubscribers) : null;

  return {
    ...plan,
    isSoldOut,
    remainingSlots,
  };
}

/**
 * Fetch all plan configurations from database with cache fallback
 */
export async function getPlanConfigs(includeArchived = false): Promise<PlanConfig[]> {
  try {
    const admin = await getAdminClient();
    if (!admin) return Array.from(planCache.values()).map(enrichPlanConfig);
    const { data, error } = await admin
      .from("plan_configs")
      .select("*")
      .order("base_price", { ascending: true });

    if (!error && data && data.length > 0) {
      // Sync into memory cache
      for (const row of data) {
        const mapped: PlanConfig = {
          id: row.id,
          displayName: row.display_name,
          basePrice: Number(row.base_price),
          gstAmount: Number(row.gst_amount),
          totalPrice: Number(row.total_price),
          maxSubscribers: row.max_subscribers !== null ? Number(row.max_subscribers) : null,
          currentSubscribers: Number(row.current_subscribers || 0),
          isPaused: Boolean(row.is_paused),
          isArchived: Boolean(row.is_archived),
        };
        planCache.set(row.id, mapped);
      }
    }
  } catch (err: any) {
    console.warn("[PLAN_CONFIGS_SYNC_NOTE]:", err?.message || err);
  }

  const all = Array.from(planCache.values()).map(enrichPlanConfig);
  if (includeArchived) {
    return all;
  }
  return all.filter((p) => !p.isArchived);
}

/**
 * Fetch a specific plan config by ID
 */
export async function getPlanConfigById(id: string): Promise<PlanConfig | null> {
  const normalized = normalizeTierKey(id);
  const plans = await getPlanConfigs(true);
  return plans.find((p) => p.id === normalized) || null;
}

/**
 * Update plan configuration (persists to Supabase & cache)
 */
export async function updatePlanConfig(
  id: string,
  updates: Partial<PlanConfig>
): Promise<PlanConfig> {
  const normalized = normalizeTierKey(id);
  const existing = planCache.get(normalized) || {
    id: normalized,
    displayName: normalized === "enterprise" ? "Enterprise Protocol" : "Builder Protocol",
    basePrice: normalized === "enterprise" ? 30000 : 2500,
    gstAmount: normalized === "enterprise" ? 5400 : 450,
    totalPrice: normalized === "enterprise" ? 35400 : 2950,
    maxSubscribers: normalized === "enterprise" ? 200 : null,
    currentSubscribers: 0,
    isPaused: false,
    isArchived: false,
  };

  const updated: PlanConfig = {
    ...existing,
    ...updates,
    id: normalized, // immutable
  };

  planCache.set(normalized, updated);

  try {
    const admin = await getAdminClient();
    if (admin) {
      await admin
        .from("plan_configs")
      .upsert({
        id: normalized,
        display_name: updated.displayName,
        base_price: updated.basePrice,
        gst_amount: updated.gstAmount,
        total_price: updated.totalPrice,
        max_subscribers: updated.maxSubscribers,
        current_subscribers: updated.currentSubscribers,
        is_paused: updated.isPaused,
        is_archived: updated.isArchived,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.warn("[PLAN_CONFIG_UPDATE_DB_NOTE]:", err?.message || err);
  }

  return enrichPlanConfig(updated);
}

/**
 * Increments subscriber count and triggers 200-seat automatic sunset for Enterprise
 */
export async function incrementSubscribers(
  planId: string
): Promise<{ plan: PlanConfig; autoSunsetTriggered: boolean }> {
  const normalized = normalizeTierKey(planId);
  const current = (await getPlanConfigById(normalized)) || (await getPlanConfigs(true)).find((p) => p.id === normalized);

  const newSubscribers = (current?.currentSubscribers || 0) + 1;
  let autoSunsetTriggered = false;

  // Enterprise Auto-Sunset Rule:
  // If id === "enterprise" and currentSubscribers >= 200, automatically sunset and pause plan
  let updates: Partial<PlanConfig> = {
    currentSubscribers: newSubscribers,
  };

  if (normalized === "enterprise" && newSubscribers >= 200) {
    updates = {
      ...updates,
      isArchived: true,
      isPaused: true,
    };
    autoSunsetTriggered = true;
    console.log("[ENTERPRISE_CAP_REACHED]: 200 subscribers allocated. Auto-sunset triggered.");
  }

  const updatedPlan = await updatePlanConfig(normalized, updates);
  return { plan: updatedPlan, autoSunsetTriggered };
}

/**
 * Adjust subscriber slots manually (+1 / -1) from admin console
 */
export async function adjustSubscriberSlots(
  planId: string,
  delta: number
): Promise<PlanConfig> {
  const normalized = normalizeTierKey(planId);
  const current = await getPlanConfigById(normalized);
  const currentCount = current?.currentSubscribers || 0;
  const newCount = Math.max(0, currentCount + delta);

  return await updatePlanConfig(normalized, {
    currentSubscribers: newCount,
  });
}

/**
 * Emergency Global Pause Toggle
 */
export async function toggleGlobalPause(isPaused: boolean): Promise<PlanConfig[]> {
  const plans = await getPlanConfigs(true);
  const results: PlanConfig[] = [];
  for (const plan of plans) {
    const updated = await updatePlanConfig(plan.id, { isPaused });
    results.push(updated);
  }
  return results;
}

/**
 * Route-level guardrails for checkout & order generation
 */
export async function verifyPlanForPurchase(
  planId: string
): Promise<{ allowed: boolean; status: number; message: string; plan?: PlanConfig }> {
  const normalized = normalizeTierKey(planId);
  const plan = await getPlanConfigById(normalized);

  if (!plan || plan.isArchived) {
    return {
      allowed: false,
      status: 404,
      message: "Plan discontinued",
    };
  }

  if (plan.isPaused) {
    return {
      allowed: false,
      status: 403,
      message: "Plan temporarily paused for platform maintenance",
      plan,
    };
  }

  if (plan.isSoldOut) {
    return {
      allowed: false,
      status: 400,
      message: "Plan capacity reached / Sold out",
      plan,
    };
  }

  return {
    allowed: true,
    status: 200,
    message: "OK",
    plan,
  };
}

// Backwards-compatible exports for legacy references
export interface PlanRecord {
  id: "community" | "tier_1" | "tier_2" | "tier_3";
  name: string;
  price_inr: number;
  is_paid: boolean;
  max_capacity: number | null;
  claimed_count: number;
  take_rate_pct?: number;
  take_rate_label?: string;
  is_lifetime?: boolean;
  level?: number;
}

export const fallbackPlans: Record<string, PlanRecord> = {
  community: {
    id: "community",
    name: "Starter Plan",
    price_inr: 0,
    is_paid: false,
    max_capacity: null,
    claimed_count: 0,
    take_rate_pct: 2.0,
    take_rate_label: "2.0% Take-Rate",
    is_lifetime: false,
    level: 0,
  },
  tier_1: {
    id: "tier_1",
    name: "Developer / Pro Plan",
    price_inr: 2500,
    is_paid: true,
    max_capacity: 800,
    claimed_count: 0,
    take_rate_pct: 1.5,
    take_rate_label: "1.5% Take-Rate",
    is_lifetime: false,
    level: 1,
  },
  tier_2: {
    id: "tier_2",
    name: "Institutional / Enterprise Plan",
    price_inr: 7999,
    is_paid: true,
    max_capacity: 500,
    claimed_count: 0,
    take_rate_pct: 1.0,
    take_rate_label: "1.0% Take-Rate",
    is_lifetime: false,
    level: 2,
  },
  tier_3: {
    id: "tier_3",
    name: "Sovereign Node Plan",
    price_inr: 30000,
    is_paid: true,
    max_capacity: 200,
    claimed_count: 0,
    take_rate_pct: 0.75,
    take_rate_label: "0.75% Take-Rate (Lowest)",
    is_lifetime: true,
    level: 3,
  },
};

export function getPlanLevel(id: string): number {
  return getTierLevel(id);
}

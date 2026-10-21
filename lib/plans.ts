export interface PlanRecord {
  id: "community" | "tier_1" | "tier_2" | "tier_3";
  name: string;
  price_inr: number;
  is_paid: boolean;
  max_capacity: number | null;
  claimed_count: number;
  take_rate_pct?: number; // 2.0, 1.5, 1.0, 0.75
  take_rate_label?: string; // "2.0%", "1.5%", "1.0%", "0.75%"
  is_lifetime?: boolean;
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
  },
};

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
    case "institutional":
    case "enterprise":
      return "tier_2";
    case "tier_3":
    case "tier3":
    case "sovereign":
    case "lifetime":
    case "founder-pass":
      return "tier_3";
    case "community":
    case "starter":
    case "free":
    default:
      return "community";
  }
}

export interface PlanRecord {
  id: "community" | "tier_1" | "tier_2" | "tier_3";
  name: string;
  price_inr: number;
  is_paid: boolean;
  max_capacity: number | null;
  claimed_count: number;
}

export const fallbackPlans: Record<string, PlanRecord> = {
  community: {
    id: "community",
    name: "Community Fleet",
    price_inr: 0,
    is_paid: false,
    max_capacity: null,
    claimed_count: 0,
  },
  tier_1: {
    id: "tier_1",
    name: "Builder Node",
    price_inr: 2499,
    is_paid: true,
    max_capacity: 800,
    claimed_count: 0,
  },
  tier_2: {
    id: "tier_2",
    name: "Protocol Pro",
    price_inr: 7999,
    is_paid: true,
    max_capacity: 500,
    claimed_count: 0,
  },
  tier_3: {
    id: "tier_3",
    name: "Enterprise Settlement Node",
    price_inr: 29999,
    is_paid: true,
    max_capacity: 200,
    claimed_count: 0,
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
      return "tier_1";
    case "tier_2":
    case "tier2":
    case "pro":
      return "tier_2";
    case "tier_3":
    case "tier3":
    case "enterprise":
    case "founder-pass":
      return "tier_3";
    case "community":
    case "free":
    default:
      return "community";
  }
}

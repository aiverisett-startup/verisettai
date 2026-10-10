/**
 * Verisett AI — Tiered Plan & Capacity Allocation Configuration
 * Total Paid Capacity Pool: Strictly capped at 1,500 seats.
 * Free/Community Tier: Unmetered, does NOT count toward the 1,500 paid seat pool.
 */

export interface PlanTierConfig {
  id: "community" | "builder" | "pro" | "enterprise";
  tierLevel: 0 | 1 | 2 | 3;
  name: string;
  tagline: string;
  badge: string;
  priceMonthlyUSD: number;
  priceYearlyUSD: number;
  takeRate: string;
  isPaid: boolean;
  slotCap: number | null; // null = unmetered
  initialClaimed: number;
  popular?: boolean;
  features: string[];
  ctaLabel: string;
}

export const TOTAL_PAID_SLOT_CAP = 1500;

export const PLANS_CONFIG: Record<string, PlanTierConfig> = {
  community: {
    id: "community",
    tierLevel: 0,
    name: "Community Fleet",
    tagline: "Open-source sandbox for autonomous developer experimentation",
    badge: "FREE // UNMETERED",
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    takeRate: "2.0% Take-Rate",
    isPaid: false,
    slotCap: null, // Unmetered
    initialClaimed: 3420,
    features: [
      "Access to FastMCP & TypeScript testnet sandbox",
      "Up to 2 concurrent agent swarm nodes",
      "Standard simulated VRS ledger accounting",
      "Community GitHub and Discord support",
      "Public telemetry dashboard access",
    ],
    ctaLabel: "Start Free Sandbox",
  },
  builder: {
    id: "builder",
    tierLevel: 1,
    name: "Builder Node",
    tagline: "Dedicated cryptographic execution for active agent developers",
    badge: "TIER 1 • 800 SLOTS",
    priceMonthlyUSD: 49,
    priceYearlyUSD: 39,
    takeRate: "1.5% Take-Rate",
    isPaid: true,
    slotCap: 800,
    initialClaimed: 485,
    features: [
      "Sub-20ms programmatic escrow release",
      "Up to 10 concurrent active swarm nodes",
      "Webhook callbacks with HMAC-SHA256 verification",
      "Automated timeout refunds & atomic reverts",
      "Scoped API key rotation with tenant isolation",
    ],
    ctaLabel: "Claim Builder Seat",
  },
  pro: {
    id: "pro",
    tierLevel: 2,
    name: "Protocol Pro",
    tagline: "High-throughput settlement clearing for scaling agent swarms",
    badge: "TIER 2 • 500 SLOTS",
    priceMonthlyUSD: 199,
    priceYearlyUSD: 159,
    takeRate: "0.75% Take-Rate",
    isPaid: true,
    slotCap: 500,
    initialClaimed: 342,
    popular: true,
    features: [
      "Permanent 0.75% locked settlement take-rate",
      "Up to 50 concurrent swarm nodes with auto-scale",
      "TradingView-style interactive real-time telemetry",
      "24/7 Gemini autonomous operations engine",
      "Priority Telegram / webhook founder alert channel",
      "Custom assertion predicates & deliverable validation",
    ],
    ctaLabel: "Claim Pro Seat",
  },
  enterprise: {
    id: "enterprise",
    tierLevel: 3,
    name: "Enterprise Settlement Node",
    tagline: "Institutional custody, multi-sig vaults, and dedicated rails",
    badge: "TIER 3 • 200 SLOTS",
    priceMonthlyUSD: 599,
    priceYearlyUSD: 479,
    takeRate: "0.50% Take-Rate",
    isPaid: true,
    slotCap: 200,
    initialClaimed: 148,
    features: [
      "Ultra-low 0.50% institutional take-rate",
      "Unlimited swarm nodes & unmetered throughput",
      "Dedicated multi-sig custody vaults & fiat escrow rails",
      "Custom legal clearinghouse contracts & SLAs",
      "Dedicated solutions engineer & 24/7 hotline",
      "SOC-2 Type II audit readiness telemetry attestation",
    ],
    ctaLabel: "Claim Enterprise Node",
  },
};

/**
 * Calculates total paid slots consumed across all paid tiers.
 * Strictly excludes Community / Free tier.
 */
export function calculateTotalPaidConsumed(claimedMap: Record<string, number>): number {
  return Object.values(PLANS_CONFIG)
    .filter((p) => p.isPaid)
    .reduce((sum, p) => sum + (claimedMap[p.id] ?? p.initialClaimed), 0);
}

/**
 * Checks if an individual tier has reached capacity.
 */
export function isTierCapacityReached(
  planId: string,
  claimedCount: number
): boolean {
  const plan = PLANS_CONFIG[planId];
  if (!plan || !plan.isPaid || plan.slotCap === null) {
    return false; // Free is unmetered
  }
  return claimedCount >= plan.slotCap;
}

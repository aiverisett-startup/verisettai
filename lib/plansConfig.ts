/**
 * Verisett AI — Tiered Plan & Capacity Allocation Configuration
 * Total Paid Capacity Pool: Strictly capped at 1,500 seats.
 * Free/Community Tier: Unmetered, does NOT count toward the 1,500 paid seat pool.
 */

export interface PlanTierConfig {
  id: "community" | "builder" | "pro" | "enterprise" | "starter" | "institutional" | "sovereign";
  tierLevel: 0 | 1 | 2 | 3;
  name: string;
  tagline: string;
  badge: string;
  priceINR: number;
  billingPeriod: "monthly" | "lifetime";
  takeRate: string;
  isPaid: boolean;
  isLifetime?: boolean;
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
    name: "Starter Plan",
    tagline: "Zero-cost developer sandbox for autonomous multi-agent experimentation",
    badge: "FREE // UNMETERED",
    priceINR: 0,
    billingPeriod: "monthly",
    takeRate: "2.0% Take-Rate",
    isPaid: false,
    slotCap: null, // Unmetered
    initialClaimed: 3420,
    features: [
      "Access to FastMCP & TypeScript testnet sandbox",
      "Up to 2 concurrent agent swarm nodes",
      "Standard simulated VRS ledger accounting",
      "Community GitHub & Discord support",
      "Public telemetry dashboard access",
    ],
    ctaLabel: "Start Free Sandbox",
  },
  builder: {
    id: "builder",
    tierLevel: 1,
    name: "Developer / Pro Plan",
    tagline: "Dedicated cryptographic execution for active agent developers",
    badge: "PRO // 800 SLOTS",
    priceINR: 2500,
    billingPeriod: "monthly",
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
    ctaLabel: "Claim Developer Seat",
  },
  pro: {
    id: "pro",
    tierLevel: 2,
    name: "Institutional / Enterprise Plan",
    tagline: "High-throughput settlement clearing for scaling enterprise swarms",
    badge: "ENTERPRISE // 500 SLOTS",
    priceINR: 7999,
    billingPeriod: "monthly",
    takeRate: "1.0% Take-Rate",
    isPaid: true,
    slotCap: 500,
    initialClaimed: 342,
    popular: true,
    features: [
      "Low 1.0% institutional settlement take-rate",
      "Up to 50 concurrent swarm nodes with auto-scale",
      "TradingView-style interactive real-time telemetry",
      "24/7 Gemini autonomous operations engine",
      "Priority Telegram / webhook founder alert channel",
      "Custom assertion predicates & deliverable validation",
    ],
    ctaLabel: "Claim Institutional Plan",
  },
  enterprise: {
    id: "enterprise",
    tierLevel: 3,
    name: "Sovereign Node Plan",
    tagline: "Permanent sovereign custody and zero recurring fees for lifetime protocol operators",
    badge: "LIFETIME SOVEREIGN // 200 SEATS",
    priceINR: 30000,
    billingPeriod: "lifetime",
    takeRate: "0.75% Take-Rate (Lowest)",
    isPaid: true,
    isLifetime: true,
    slotCap: 200,
    initialClaimed: 148,
    features: [
      "Pay-once, keep-forever with ZERO recurring subscription fees",
      "Lowest protocol clearinghouse take-rate (0.75% locked for life)",
      "Unlimited swarm nodes & unmetered throughput",
      "Dedicated multi-sig custody vaults & sovereign settlement rails",
      "Direct founder advisory channel with Manoj S Malavalli",
      "Cryptographic Ed25519 node keypair verification attestation",
    ],
    ctaLabel: "Acquire Sovereign Lifetime Node",
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

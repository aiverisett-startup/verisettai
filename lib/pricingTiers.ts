/**
 * Verisett AI — Canonical Pricing Tiers & Ranking Configuration
 * 
 * Defines explicit numeric levels for tier progression:
 * - starter: level 0 (₹0, 2.0% fee)
 * - pro: level 1 (₹2,499, 1.5% fee)
 * - institution: level 2 (₹7,999, 1.0% fee)
 * - founder_lifetime: level 3 (₹29,999 / ₹30,000, 0.75% fee)
 */

export type PricingTierKey = "starter" | "pro" | "institution" | "founder_lifetime";

export interface PricingTierConfig {
  key: PricingTierKey;
  level: number;
  name: string;
  priceINR: number;
  feePercent: string;
  takeRatePct: number;
  isPaid: boolean;
  isLifetime?: boolean;
}

export const PRICING_TIERS: Record<PricingTierKey, PricingTierConfig> = {
  starter: {
    key: "starter",
    level: 0,
    name: "Starter Plan",
    priceINR: 0,
    feePercent: "2.0%",
    takeRatePct: 2.0,
    isPaid: false,
    isLifetime: false,
  },
  pro: {
    key: "pro",
    level: 1,
    name: "Developer / Pro Plan",
    priceINR: 2499,
    feePercent: "1.5%",
    takeRatePct: 1.5,
    isPaid: true,
    isLifetime: false,
  },
  institution: {
    key: "institution",
    level: 2,
    name: "Institutional / Enterprise Plan",
    priceINR: 7999,
    feePercent: "1.0%",
    takeRatePct: 1.0,
    isPaid: true,
    isLifetime: false,
  },
  founder_lifetime: {
    key: "founder_lifetime",
    level: 3,
    name: "Sovereign Node (Lifetime Access)",
    priceINR: 30000,
    feePercent: "0.75%",
    takeRatePct: 0.75,
    isPaid: true,
    isLifetime: true,
  },
};

/**
 * Resolves any plan tier identifier string or database key to an explicit numeric level (0..3)
 */
export function getTierLevel(tierString?: string | null): number {
  if (!tierString) return 0;
  const normalized = tierString.toLowerCase().replace(/[\s-_]/g, "");

  // Level 3: Sovereign / Founder Lifetime
  if (
    normalized.includes("founder") ||
    normalized.includes("sovereign") ||
    normalized.includes("lifetime") ||
    normalized === "tier3"
  ) {
    return 3;
  }

  // Level 2: Institutional / Enterprise
  if (
    normalized.includes("institution") ||
    normalized.includes("enterprise") ||
    normalized === "tier2"
  ) {
    return 2;
  }

  // Level 1: Pro / Developer / Builder
  if (
    normalized.includes("pro") ||
    normalized.includes("builder") ||
    normalized.includes("developer") ||
    normalized === "tier1"
  ) {
    return 1;
  }

  // Level 0: Starter / Community / Free
  return 0;
}

/**
 * Returns the tier metadata object by numeric level
 */
export function getTierInfoByLevel(level: number): PricingTierConfig {
  if (level >= 3) return PRICING_TIERS.founder_lifetime;
  if (level === 2) return PRICING_TIERS.institution;
  if (level === 1) return PRICING_TIERS.pro;
  return PRICING_TIERS.starter;
}

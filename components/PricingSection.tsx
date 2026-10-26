"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Zap, Users, ArrowRight, Sparkles, AlertOctagon } from "lucide-react";
import { RegisterModal } from "@/components/RegisterModal";
import { getPlans } from "@/app/actions/register";
import { PlanRecord, getPlanLevel } from "@/lib/plans";
import { getTierLevel, getTierInfoByLevel } from "@/lib/pricingTiers";
import { supabase } from "@/lib/supabase";

interface PricingSectionProps {
  initialPlans?: PlanRecord[];
}

const DEFAULT_PLANS: PlanRecord[] = [
  {
    id: "community",
    name: "Starter Plan",
    price_inr: 0,
    is_paid: false,
    max_capacity: null,
    claimed_count: 0,
    take_rate_pct: 2.0,
    take_rate_label: "2.0% Protocol Fee",
    is_lifetime: false,
    level: 0,
  },
  {
    id: "tier_1",
    name: "Developer / Pro Plan",
    price_inr: 2500,
    is_paid: true,
    max_capacity: 800,
    claimed_count: 0,
    take_rate_pct: 1.5,
    take_rate_label: "1.5% Protocol Fee",
    is_lifetime: false,
    level: 1,
  },
  {
    id: "tier_2",
    name: "Institutional / Enterprise Plan",
    price_inr: 7999,
    is_paid: true,
    max_capacity: 500,
    claimed_count: 0,
    take_rate_pct: 1.0,
    take_rate_label: "1.0% Protocol Fee",
    is_lifetime: false,
    level: 2,
  },
  {
    id: "tier_3",
    name: "Sovereign Node Plan",
    price_inr: 30000,
    is_paid: true,
    max_capacity: 200,
    claimed_count: 0,
    take_rate_pct: 0.75,
    take_rate_label: "0.75% Protocol Fee (Lowest)",
    is_lifetime: true,
    level: 3,
  },
];

const PLAN_DESCRIPTIONS: Record<string, { tagline: string; takeRate: string; isLifetime?: boolean; features: string[] }> = {
  community: {
    tagline: "Zero-cost developer sandbox for autonomous multi-agent experimentation",
    takeRate: "2.0% Protocol Fee",
    features: [
      "Access to FastMCP & TypeScript testnet sandbox",
      "Up to 2 concurrent agent swarm nodes",
      "Standard simulated VRS ledger accounting",
      "Community GitHub and Discord support",
      "Public telemetry dashboard access",
    ],
  },
  tier_1: {
    tagline: "Dedicated cryptographic execution for active agent developers",
    takeRate: "1.5% Protocol Fee",
    features: [
      "Sub-20ms programmatic escrow release",
      "Up to 10 concurrent active swarm nodes",
      "Webhook callbacks with HMAC-SHA256 verification",
      "Automated timeout refunds & atomic reverts",
      "Scoped API key rotation with tenant isolation",
    ],
  },
  tier_2: {
    tagline: "High-throughput settlement clearing for scaling enterprise swarms",
    takeRate: "1.0% Protocol Fee",
    features: [
      "Low 1.0% institutional settlement take-rate",
      "Up to 50 concurrent swarm nodes with auto-scale",
      "TradingView-style interactive real-time telemetry",
      "24/7 Gemini autonomous operations engine",
      "Priority Telegram / webhook founder alert channel",
      "Custom assertion predicates & deliverable validation",
    ],
  },
  tier_3: {
    tagline: "Permanent sovereign custody and zero recurring fees for lifetime protocol operators",
    takeRate: "0.75% Protocol Fee (Lowest)",
    isLifetime: true,
    features: [
      "Pay-once, keep-forever with ZERO recurring subscription fees",
      "Lowest protocol clearinghouse take-rate (0.75% locked for life)",
      "Unlimited swarm nodes & unmetered throughput",
      "Dedicated multi-sig custody vaults & sovereign settlement rails",
      "Direct founder advisory channel with Manoj S Malavalli",
      "Cryptographic Ed25519 node keypair verification attestation",
    ],
  },
};

export function PricingSection({ initialPlans }: PricingSectionProps) {
  const [plans, setPlans] = useState<PlanRecord[]>(initialPlans || DEFAULT_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<
    "community" | "tier_1" | "tier_2" | "tier_3"
  >("tier_2");
  const [capacityNotice, setCapacityNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Read URL notice on mount if redirected from checkout
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const notice = params.get("notice");
      const plan = params.get("plan");
      if (notice === "capacity_exhausted" || notice === "tier_full") {
        setCapacityNotice(
          plan
            ? `The requested tier (${plan.toUpperCase().replace("_", " ")}) has reached its maximum capacity. Please select an available node tier below.`
            : "The selected settlement tier has reached maximum capacity allocation."
        );
      }
    }
  }, []);

  // Load live plan stats from Supabase on mount or refresh
  useEffect(() => {
    async function loadLivePlans() {
      try {
        const live = await getPlans();
        if (live && live.length > 0) {
          setPlans(live);
        }
      } catch (err) {
        console.warn("[PRICING-UI] Could not fetch live plans:", err);
      }
    }

    if (!initialPlans) {
      loadLivePlans();
    }
  }, [initialPlans]);

  // Real-time subscription to plan changes in Supabase
  useEffect(() => {
    const channel = supabase
      .channel("public:plans")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plans" },
        (payload) => {
          if (payload.new && (payload.new as any).id) {
            const updated = payload.new as PlanRecord;
            setPlans((prev) =>
              prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute Total Paid Pool quota consumption (strictly ignores Community)
  const totalPaidClaimed = useMemo(() => {
    return plans
      .filter((p) => p.is_paid)
      .reduce((sum, p) => sum + (p.claimed_count || 0), 0);
  }, [plans]);

  const isTotalPaidExhausted = totalPaidClaimed >= 1500;
  const totalPaidPercentage = Math.min(100, Math.round((totalPaidClaimed / 1500) * 100));

  const [userPlanLevel, setUserPlanLevel] = useState<number>(0);
  const [currentUserTier, setCurrentUserTier] = useState<string | null>(null);

  // Authenticated user session & plan tier detection
  useEffect(() => {
    let isMounted = true;
    async function checkAuthAndTier() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) {
            setUserPlanLevel(0);
            setCurrentUserTier(null);
          }
          return;
        }

        const userId = session.user.id;
        let detectedTier = (session.user.user_metadata?.plan_tier as string) || "starter";

        const { data: profile } = await supabase
          .from("profiles")
          .select("plan_tier, founder_pass")
          .eq("id", userId)
          .maybeSingle();

        if (profile) {
          if (profile.founder_pass || profile.plan_tier === "FOUNDER_NODE" || profile.plan_tier === "tier_3") {
            detectedTier = "founder_lifetime";
          } else if (profile.plan_tier) {
            detectedTier = profile.plan_tier;
          }
        }

        const level = getTierLevel(detectedTier);
        if (isMounted) {
          setCurrentUserTier(detectedTier);
          setUserPlanLevel(level);
        }
      } catch (err) {
        console.warn("[PRICING-UI] Auth user tier check:", err);
      }
    }

    checkAuthAndTier();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuthAndTier();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const currentTierInfo = useMemo(() => getTierInfoByLevel(userPlanLevel), [userPlanLevel]);

  // Filter plans based on authenticated user active tier level:
  // If logged-out or starter (level 0), show all plans.
  // If paid tier (level > 0), only show plans with plan.level > currentUserPlan.level.
  const visiblePlans = useMemo(() => {
    if (userPlanLevel <= 0) {
      return plans;
    }
    return plans.filter((p) => {
      const planLvl = p.level ?? getPlanLevel(p.id);
      return planLvl > userPlanLevel;
    });
  }, [plans, userPlanLevel]);

  // Dynamic responsive CSS grid adjustment according to remaining card count
  const gridLayoutClass = useMemo(() => {
    switch (visiblePlans.length) {
      case 3:
        return "grid-cols-1 md:grid-cols-3 max-w-5xl";
      case 2:
        return "grid-cols-1 md:grid-cols-2 max-w-3xl";
      case 1:
        return "grid-cols-1 max-w-md mx-auto";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl";
    }
  }, [visiblePlans.length]);

  const handleOpenRegister = (planId: "community" | "tier_1" | "tier_2" | "tier_3") => {
    setSelectedPlanId(planId);
    setIsModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    startTransition(async () => {
      const live = await getPlans();
      if (live && live.length > 0) {
        setPlans(live);
      }
    });
  };

  return (
    <section
      id="pricing"
      className="py-24 border-t border-zinc-200 bg-[#FAFAFA] text-zinc-900 font-sans relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3.5 py-1 text-xs font-mono text-zinc-700 font-medium">
            <Zap className="w-3.5 h-3.5 text-zinc-800" />
            <span>TIERED CAPACITY ALLOCATION • 1,500 SEATS POOL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 font-sans">
            Deterministic Protocol Economics
          </h2>

          <p className="text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto font-sans">
            Strict capacity quotas. Total institutional clearing seats capped at 1,500 nodes to preserve sub-20ms programmatic clearing guarantees.
          </p>
        </div>

        {/* Dynamic Capacity Exhaustion Notice if redirected from checkout */}
        {capacityNotice && (
          <div className="max-w-4xl mx-auto p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-mono flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <span className="font-bold">Capacity Notice: </span>
              <span>{capacityNotice}</span>
            </div>
          </div>
        )}

        {/* Global Paid Capacity Tracker Banner */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-800 shrink-0" />
              <span className="font-semibold text-zinc-900 uppercase tracking-wider">
                Total Paid Seat Capacity Allocation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-950">
                {totalPaidClaimed.toLocaleString()} / 1,500 Claimed
              </span>
              <span className="text-zinc-500">
                ({Math.max(0, 1500 - totalPaidClaimed).toLocaleString()} slots remaining)
              </span>
            </div>
          </div>

          {/* Clean 2px Progress Bar */}
          <div className="w-full h-2 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isTotalPaidExhausted ? "bg-rose-600" : "bg-zinc-900"
              }`}
              style={{ width: `${totalPaidPercentage}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-zinc-700 dark:text-zinc-300 gap-1.5 font-medium">
            <span>Builder: 800 • Pro: 500 • Enterprise: 200</span>
            <span>Free / Community Tier: Unlimited (Unmetered)</span>
          </div>

          {isTotalPaidExhausted && (
            <div className="pt-2 flex items-center gap-2 text-rose-700 font-mono text-xs sm:text-sm">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span className="font-bold">
                [Registration Closed] All 1,500 institutional paid clearing seats are exhausted.
              </span>
            </div>
          )}
        </div>

        {/* Current Active Tier Upgrade Banner for Authenticated Paid Users (level 1 or 2) */}
        {userPlanLevel > 0 && userPlanLevel < 3 && (
          <div className="max-w-4xl mx-auto p-4 rounded-xl border border-blue-200 bg-blue-50/90 text-blue-950 text-xs sm:text-sm font-mono flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong className="font-semibold text-blue-900">Current Active Tier:</strong>{" "}
                {currentTierInfo.name} ({currentTierInfo.feePercent} fee) — Available Upgrades Below
              </span>
            </div>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 uppercase">
              Active Tier
            </span>
          </div>
        )}

        {/* Highest Tier Full-Width Confirmation Card (Level 3 / Sovereign Node) */}
        {userPlanLevel >= 3 ? (
          <div className="max-w-3xl mx-auto rounded-3xl border border-amber-400/80 bg-gradient-to-b from-amber-500/[0.06] via-white to-amber-500/[0.1] p-8 sm:p-12 shadow-[0_20px_50px_-12px_rgba(245,158,11,0.25)] text-center space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white text-xs font-mono font-bold tracking-wider uppercase shadow-md border border-amber-300/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              MAXIMUM PROTOCOL TIER UNLOCKED
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-sans tracking-tight">
                Sovereign Node (Lifetime Access)
              </h3>
              <p className="text-sm sm:text-base text-zinc-700 max-w-xl mx-auto leading-relaxed">
                You are on the highest tier: Sovereign Node (Lifetime Access). You enjoy the lowest protocol clearance fee of 0.75% with zero recurring fees.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <span>Open Settlement Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Dynamically Adjusted Responsive Grid for Available Upgrade Plans */
          <div className={`grid ${gridLayoutClass} gap-6 items-stretch w-full mx-auto pt-2`}>
            {visiblePlans.map((plan) => {
            const details = PLAN_DESCRIPTIONS[plan.id] || PLAN_DESCRIPTIONS.tier_1;
            const isPaid = plan.is_paid;
            const isTierCapReached = isPaid && plan.max_capacity !== null && plan.claimed_count >= plan.max_capacity;
            const isBlocked = isPaid && (isTotalPaidExhausted || isTierCapReached);

            const remaining = plan.max_capacity !== null ? Math.max(0, plan.max_capacity - plan.claimed_count) : null;
            const percentage = plan.max_capacity !== null ? Math.min(100, Math.round((plan.claimed_count / plan.max_capacity) * 100)) : null;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full border transition-all duration-300 backdrop-blur-xl relative group w-full ${
                  plan.id === "tier_3"
                    ? "border-amber-400/80 bg-gradient-to-b from-amber-500/[0.04] via-white to-amber-500/[0.08] ring-2 ring-amber-400 shadow-[0_20px_50px_-12px_rgba(245,158,11,0.25)] hover:border-amber-300 hover:shadow-[0_25px_60px_-12px_rgba(245,158,11,0.35)]"
                    : plan.id === "tier_1"
                    ? "border-[#2563EB] bg-white ring-2 ring-[#2563EB] shadow-[0_20px_50px_-12px_rgba(37,99,235,0.12)] hover:border-blue-500 hover:shadow-[0_25px_60px_-12px_rgba(37,99,235,0.22)]"
                    : plan.id === "tier_2"
                    ? "border-[#E2E8F0] bg-white hover:border-[#2563EB]/60 shadow-xs hover:shadow-md"
                    : "border-[#E2E8F0] bg-white hover:border-zinc-300 shadow-xs hover:shadow-sm"
                }`}
              >
                {/* Popular Badge for Developer / Pro Plan (Tier 1) */}
                {plan.id === "tier_1" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2563EB] text-white text-xs font-mono font-bold tracking-wider uppercase shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      MOST POPULAR
                    </span>
                  </div>
                )}


                {/* Sovereign Lifetime Badge for Tier 3 */}
                {plan.id === "tier_3" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white text-xs font-mono font-bold tracking-wider uppercase shadow-md border border-amber-300/40">
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      LIFETIME ACCESS • PAY ONCE
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Quadrant: Plan name, badge pill, protocol take-rate */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <span
                        className={`text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded border ${
                          plan.id === "tier_3"
                            ? "border-amber-300 bg-amber-50 text-amber-900"
                            : "border-zinc-200 bg-zinc-50 text-zinc-800"
                        }`}
                      >
                        {plan.id === "community"
                          ? "FREE // UNMETERED"
                          : plan.id === "tier_1"
                          ? "PRO // 800 SLOTS"
                          : plan.id === "tier_2"
                          ? "ENTERPRISE // 500 SLOTS"
                          : "SOVEREIGN // 200 SEATS"}
                      </span>

                      {/* Status Pill / Take-Rate */}
                      {isTierCapReached ? (
                        <span className="px-2.5 py-1 rounded border border-rose-300 bg-rose-50 text-rose-700 text-xs font-mono font-bold">
                          [Cap Reached]
                        </span>
                      ) : isTotalPaidExhausted && isPaid ? (
                        <span className="px-2.5 py-1 rounded border border-rose-300 bg-rose-50 text-rose-700 text-xs font-mono font-bold">
                          [Closed]
                        </span>
                      ) : (
                        <span
                          className={`text-xs sm:text-sm font-mono font-bold px-2 py-0.5 rounded border ${
                            plan.id === "tier_3"
                              ? "text-amber-900 bg-amber-100/70 border-amber-300"
                              : "text-emerald-700 bg-emerald-50 border-emerald-200"
                          }`}
                        >
                          {details.takeRate}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                        {details.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Middle Quadrant: Dynamic price callout & billing cadence */}
                  <div className="pt-3.5 border-t border-zinc-100 space-y-2">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-sans tracking-tight">
                        {isPaid ? `₹${plan.price_inr.toLocaleString()}` : "₹0"}
                      </span>
                      {isPaid && (
                        <span className="text-xs sm:text-sm font-mono text-zinc-600 font-medium">
                          {plan.id === "tier_3" ? "/ one-time" : "/ month"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-zinc-600">
                      {plan.id === "tier_3"
                        ? "One-time / Lifetime validity • Zero recurring fees"
                        : isPaid
                        ? "Fixed monthly node pass • Billed monthly"
                        : "Free / Unmetered developer sandbox"}
                    </p>

                    {/* Capacity Tracker */}
                    <div className="p-3 rounded-xl border border-zinc-200 bg-[#FAFAFA] space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                        <span className="text-zinc-600 font-medium">Quota Allocation:</span>
                        {isPaid && plan.max_capacity !== null ? (
                          <span className="font-bold text-zinc-950">
                            {plan.claimed_count} / {plan.max_capacity} claimed
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700">Free / Unmetered</span>
                        )}
                      </div>

                      {isPaid && percentage !== null && (
                        <>
                          <div className="w-full h-1.5 rounded-full bg-white border border-zinc-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isTierCapReached
                                  ? "bg-rose-500"
                                  : plan.id === "tier_3"
                                  ? "bg-amber-600"
                                  : "bg-zinc-900"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-right text-zinc-600 font-medium">
                            {isTierCapReached ? "0 slots remaining" : `${remaining} slots remaining`}
                          </div>
                        </>
                      )}

                      {!isPaid && (
                        <div className="text-[11px] text-zinc-600">
                          Ignored in the 1,500 total paid members pool.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feature Checklist Quadrant */}
                  <div className="pt-3.5 border-t border-zinc-100 space-y-2.5">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-700 flex items-center justify-between">
                      <span>Protocol Capabilities</span>
                      {plan.id === "tier_3" && (
                        <span className="text-[10px] text-amber-700 font-normal">
                          Direct Clearing Queue Priority
                        </span>
                      )}
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-800">
                      {details.features.map((feat, idx) => (

                        <li key={idx} className="flex items-start gap-2.5">
                          <div
                            className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                              plan.id === "tier_3"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-zinc-100 text-zinc-800 border-zinc-300"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                          </div>
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Anchor: Full-width CTA button aligned cleanly to bottom */}
                <div className="pt-6 mt-auto">
                  {isBlocked ? (
                    <button
                      type="button"
                      disabled
                      className="w-full min-h-[46px] py-2.5 px-4 rounded-[10px] text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-1.5 bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-60"
                    >
                      <span>
                        {isTierCapReached
                          ? "[Cap Reached]"
                          : isTotalPaidExhausted && isPaid
                          ? "[Registration Closed]"
                          : "Plan Unavailable"}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={`/checkout?plan=${plan.id}`}
                      className={`w-full min-h-[46px] py-2.5 px-4 rounded-[10px] text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        plan.id === "tier_3"
                          ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold shadow-sm"
                          : plan.id === "tier_1"
                          ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                          : "bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] hover:border-[#94A3B8] shadow-2xs"
                      }`}
                    >
                      <span>
                        {plan.id === "tier_3"
                          ? "Acquire Sovereign Node"
                          : plan.id === "community"
                          ? "Access Free Sandbox"
                          : `Claim ${plan.name}`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Registration Intake Modal */}
      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlanId={selectedPlanId}
        plans={plans}
        onSuccess={handleRegistrationSuccess}
      />
    </section>
  );
}

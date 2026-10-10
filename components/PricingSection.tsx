"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Zap, Users, ArrowRight, Sparkles, AlertOctagon } from "lucide-react";
import { RegisterModal } from "@/components/RegisterModal";
import { getPlans } from "@/app/actions/register";
import { PlanRecord } from "@/lib/plans";
import { supabase } from "@/lib/supabase";

interface PricingSectionProps {
  initialPlans?: PlanRecord[];
}

const DEFAULT_PLANS: PlanRecord[] = [
  {
    id: "community",
    name: "Community Fleet",
    price_inr: 0,
    is_paid: false,
    max_capacity: null,
    claimed_count: 0,
  },
  {
    id: "tier_1",
    name: "Builder Node",
    price_inr: 2499,
    is_paid: true,
    max_capacity: 800,
    claimed_count: 0,
  },
  {
    id: "tier_2",
    name: "Protocol Pro",
    price_inr: 7999,
    is_paid: true,
    max_capacity: 500,
    claimed_count: 0,
  },
  {
    id: "tier_3",
    name: "Enterprise Settlement Node",
    price_inr: 29999,
    is_paid: true,
    max_capacity: 200,
    claimed_count: 0,
  },
];

const PLAN_DESCRIPTIONS: Record<string, { tagline: string; takeRate: string; features: string[] }> = {
  community: {
    tagline: "Open-source sandbox for autonomous developer experimentation",
    takeRate: "2.0% Take-Rate",
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
    takeRate: "1.5% Take-Rate",
    features: [
      "Sub-20ms programmatic escrow release",
      "Up to 10 concurrent active swarm nodes",
      "Webhook callbacks with HMAC-SHA256 verification",
      "Automated timeout refunds & atomic reverts",
      "Scoped API key rotation with tenant isolation",
    ],
  },
  tier_2: {
    tagline: "High-throughput settlement clearing for scaling agent swarms",
    takeRate: "0.75% Take-Rate",
    features: [
      "Permanent 0.75% locked settlement take-rate",
      "Up to 50 concurrent swarm nodes with auto-scale",
      "TradingView-style interactive real-time telemetry",
      "24/7 Gemini autonomous operations engine",
      "Priority Telegram / webhook founder alert channel",
      "Custom assertion predicates & deliverable validation",
    ],
  },
  tier_3: {
    tagline: "Institutional custody, multi-sig vaults, and dedicated rails",
    takeRate: "0.50% Take-Rate",
    features: [
      "Ultra-low 0.50% institutional take-rate",
      "Unlimited swarm nodes & unmetered throughput",
      "Dedicated multi-sig custody vaults & fiat escrow rails",
      "Custom legal clearinghouse contracts & SLAs",
      "Dedicated solutions engineer & 24/7 hotline",
      "SOC-2 Type II audit readiness telemetry attestation",
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-zinc-500 gap-1">
            <span>Builder: 800 • Pro: 500 • Enterprise: 200</span>
            <span>Free / Community Tier: Unlimited (Unmetered)</span>
          </div>

          {isTotalPaidExhausted && (
            <div className="pt-2 flex items-center gap-2 text-rose-700 font-mono text-xs">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span className="font-bold">
                [Registration Closed] All 1,500 institutional paid clearing seats are exhausted.
              </span>
            </div>
          )}
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-2">
          {plans.map((plan) => {
            const details = PLAN_DESCRIPTIONS[plan.id] || PLAN_DESCRIPTIONS.tier_1;
            const isPaid = plan.is_paid;
            const isTierCapReached = isPaid && plan.max_capacity !== null && plan.claimed_count >= plan.max_capacity;
            const isBlocked = isPaid && (isTotalPaidExhausted || isTierCapReached);

            const remaining = plan.max_capacity !== null ? Math.max(0, plan.max_capacity - plan.claimed_count) : null;
            const percentage = plan.max_capacity !== null ? Math.min(100, Math.round((plan.claimed_count / plan.max_capacity) * 100)) : null;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between h-full border transition-all duration-200 relative ${
                  plan.id === "tier_2"
                    ? "border-zinc-900 bg-white ring-1 ring-zinc-900"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                {/* Popular Badge for Tier 2 */}
                {plan.id === "tier_2" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                      <Sparkles className="w-3 h-3 text-white" />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Tier Header & Status Badge */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded border border-zinc-200 bg-zinc-50 text-zinc-700">
                      {plan.id === "community"
                        ? "FREE // UNMETERED"
                        : plan.id === "tier_1"
                        ? "TIER 1 • 800 SLOTS"
                        : plan.id === "tier_2"
                        ? "TIER 2 • 500 SLOTS"
                        : "TIER 3 • 200 SLOTS"}
                    </span>

                    {/* Status Pill */}
                    {isTierCapReached ? (
                      <span className="px-2 py-0.5 rounded border border-rose-300 bg-rose-50 text-rose-700 text-[10px] font-mono font-bold">
                        [Cap Reached]
                      </span>
                    ) : isTotalPaidExhausted && isPaid ? (
                      <span className="px-2 py-0.5 rounded border border-rose-300 bg-rose-50 text-rose-700 text-[10px] font-mono font-bold">
                        [Registration Closed]
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {details.takeRate}
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-zinc-950">{plan.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {details.tagline}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="pt-3 border-t border-zinc-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-zinc-950 font-sans">
                        {isPaid ? `₹${plan.price_inr.toLocaleString()}` : "₹0"}
                      </span>
                      {isPaid && (
                        <span className="text-xs font-mono text-zinc-500">
                          / month
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 mt-1">
                      {isPaid ? "Fixed monthly node pass" : "Free / Unmetered developer sandbox"}
                    </p>
                  </div>

                  {/* Capacity Tracker */}
                  <div className="p-3 rounded-xl border border-zinc-200 bg-[#FAFAFA] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Quota Allocation:</span>
                      {isPaid && plan.max_capacity !== null ? (
                        <span className="font-semibold text-zinc-900">
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
                              isTierCapReached ? "bg-rose-500" : "bg-zinc-900"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-right text-zinc-500">
                          {isTierCapReached ? "0 slots remaining" : `${remaining} slots remaining`}
                        </div>
                      </>
                    )}

                    {!isPaid && (
                      <div className="text-[10px] text-zinc-500">
                        Ignored in the 1,500 total paid members pool.
                      </div>
                    )}
                  </div>

                  {/* Feature Bullets */}
                  <div className="pt-3 border-t border-zinc-100 space-y-2">
                    <div className="text-[11px] font-mono font-bold uppercase text-zinc-600">
                      Protocol Capabilities
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-700">
                      {details.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="h-4 w-4 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 mt-0.5 border border-zinc-200">
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                          </div>
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="pt-6 mt-auto">
                  {isBlocked ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wide flex items-center justify-center gap-1.5 bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-60"
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
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        plan.id === "tier_2"
                          ? "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 shadow-2xs"
                          : "bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <span>
                        {plan.id === "community"
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

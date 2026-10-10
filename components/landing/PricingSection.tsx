"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Check,
  Zap,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  PLANS_CONFIG,
  TOTAL_PAID_SLOT_CAP,
  calculateTotalPaidConsumed,
  isTierCapacityReached,
  PlanTierConfig,
} from "@/lib/plansConfig";
import { PlanRegistrationModal } from "@/components/landing/PlanRegistrationModal";
import { supabase } from "@/lib/supabase";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Dynamic slot consumption state
  const [claimedCounts, setClaimedCounts] = useState<Record<string, number>>(() => ({
    community: PLANS_CONFIG.community.initialClaimed,
    builder: PLANS_CONFIG.builder.initialClaimed,
    pro: PLANS_CONFIG.pro.initialClaimed,
    enterprise: PLANS_CONFIG.enterprise.initialClaimed,
  }));

  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectedPlan, setModalSelectedPlan] = useState<
    "community" | "builder" | "pro" | "enterprise"
  >("pro");

  // Load live claimed counters from Supabase if available
  useEffect(() => {
    async function fetchCounters() {
      try {
        const { data, error } = await supabase
          .from("plan_tier_counters")
          .select("plan_tier, claimed_slots");

        if (!error && data && data.length > 0) {
          const map: Record<string, number> = {};
          data.forEach((row) => {
            if (row.plan_tier && row.claimed_slots) {
              map[row.plan_tier] = row.claimed_slots;
            }
          });
          setClaimedCounts((prev) => ({ ...prev, ...map }));
        }
      } catch {
        // Fallback to initial seeds
      }
    }
    fetchCounters();
  }, []);

  // Total Paid Slots Consumed (strictly excludes community / free)
  const totalPaidConsumed = useMemo(() => {
    return calculateTotalPaidConsumed(claimedCounts);
  }, [claimedCounts]);

  const totalPaidPercentage = useMemo(() => {
    return Math.min(100, Math.round((totalPaidConsumed / TOTAL_PAID_SLOT_CAP) * 100));
  }, [totalPaidConsumed]);

  const handleOpenIntake = (planId: "community" | "builder" | "pro" | "enterprise") => {
    setModalSelectedPlan(planId);
    setIsModalOpen(true);
  };

  const handleRegistrationSuccess = (planId: string, newCount: number) => {
    setClaimedCounts((prev) => ({
      ...prev,
      [planId]: newCount,
    }));
  };

  return (
    <section
      id="pricing"
      className="py-24 border-t border-[#EAE3D2] bg-[#FAF8F5] relative overflow-hidden font-sans"
    >
      {/* Background Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-mono text-blue-700 font-semibold shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>TIERED CAPACITY ALLOCATION • 1,500 SEATS POOL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1C1A17]">
            Deterministic Protocol Economics
          </h2>

          <p className="text-base sm:text-lg text-[#6E675D] leading-relaxed">
            Strict capacity quotas. Total institutional clearing seats capped at 1,500 nodes to preserve sub-20ms clearing guarantees.
          </p>

          {/* Interactive Billing Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-full bg-white border border-[#EAE3D2] shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#FAF8F5] text-blue-600 font-bold shadow-2xs border border-[#EAE3D2]"
                    : "text-[#6E675D] hover:text-[#1C1A17]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === "yearly"
                    ? "bg-[#FAF8F5] text-blue-600 font-bold shadow-2xs border border-[#EAE3D2]"
                    : "text-[#6E675D] hover:text-[#1C1A17]"
                }`}
              >
                <span>Billed Yearly</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold tracking-tight">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Paid Capacity Tracker Banner */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-[#EAE3D2] bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-[#1C1A17] uppercase tracking-wider">
                Total Paid Seat Capacity Allocation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1C1A17]">
                {totalPaidConsumed.toLocaleString()} / {TOTAL_PAID_SLOT_CAP.toLocaleString()} Claimed
              </span>
              <span className="text-[#8C8275]">
                ({(TOTAL_PAID_SLOT_CAP - totalPaidConsumed).toLocaleString()} seats remaining)
              </span>
            </div>
          </div>

          {/* Clean 2.5px Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#FAF8F5] border border-[#EAE3D2] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${totalPaidPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8275]">
            <span>Builder (800) • Pro (500) • Enterprise (200)</span>
            <span>Free Community Tier: Unmetered (Excluded)</span>
          </div>
        </div>

        {/* 4-Column Plan Grid: Community, Builder, Pro, Enterprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-2">
          {Object.values(PLANS_CONFIG).map((plan) => {
            const claimed = claimedCounts[plan.id] ?? plan.initialClaimed;
            const isSoldOut = isTierCapacityReached(plan.id, claimed);
            const remaining = plan.slotCap !== null ? Math.max(0, plan.slotCap - claimed) : null;
            const percentage = plan.slotCap !== null ? Math.min(100, Math.round((claimed / plan.slotCap) * 100)) : null;

            const price = billingCycle === "monthly" ? plan.priceMonthlyUSD : plan.priceYearlyUSD;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-full border transition-all duration-300 relative ${
                  plan.popular
                    ? "border-2 border-blue-600 bg-white shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                    : "border-[#EAE3D2] bg-white shadow-2xs hover:shadow-sm hover:border-slate-300"
                }`}
              >
                {/* Popular Pill */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Tier Badge & Status Pill */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border ${
                        plan.popular
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-[#FAF8F5] text-[#6E675D] border-[#EAE3D2]"
                      }`}
                    >
                      {plan.badge}
                    </span>

                    {/* Sold Out / Status Pill */}
                    {isSoldOut ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold">
                        SOLD OUT
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {plan.takeRate}
                      </span>
                    )}
                  </div>

                  {/* Plan Name & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-[#1C1A17]">{plan.name}</h3>
                    <p className="text-xs text-[#6E675D] mt-1 leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="pt-3 border-t border-[#F0E9DC]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#1C1A17] font-sans">
                        ${price}
                      </span>
                      {plan.isPaid && (
                        <span className="text-xs font-mono text-[#8C8275]">
                          / month
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-[#8C8275] mt-1">
                      {plan.isPaid
                        ? billingCycle === "yearly"
                          ? `Billed annually ($${price * 12}/yr)`
                          : "Billed monthly"
                        : "Completely free testnet access"}
                    </p>
                  </div>

                  {/* Capacity Tracker */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8C8275]">Capacity:</span>
                      {plan.isPaid && plan.slotCap !== null ? (
                        <span className="font-bold text-[#1C1A17]">
                          {claimed} / {plan.slotCap} claimed
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700">Unmetered Free</span>
                      )}
                    </div>

                    {plan.isPaid && percentage !== null && (
                      <>
                        <div className="w-full h-1.5 rounded-full bg-white border border-[#EAE3D2] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSoldOut ? "bg-rose-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-right text-[#8C8275]">
                          {isSoldOut ? "0 slots remaining" : `${remaining} slots remaining`}
                        </div>
                      </>
                    )}

                    {!plan.isPaid && (
                      <div className="text-[10px] text-[#8C8275]">
                        Does not count against the 1,500 paid seat pool.
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="pt-3 border-t border-[#F0E9DC] space-y-2.5">
                    <div className="text-[11px] font-mono font-bold uppercase text-[#4A453E]">
                      Key Invariants &amp; Capabilities
                    </div>
                    <ul className="space-y-2 text-xs text-[#4A453E]">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                          </div>
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-6 mt-auto">
                  <button
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => handleOpenIntake(plan.id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold font-mono tracking-wide flex items-center justify-center gap-2 transition-all shadow-2xs text-center cursor-pointer ${
                      isSoldOut
                        ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-60"
                        : plan.popular
                        ? "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm"
                        : "bg-white hover:bg-[#FAF8F5] text-[#1C1A17] border border-[#EAE3D2] hover:border-blue-400"
                    }`}
                  >
                    <span>{isSoldOut ? "Capacity Reached" : plan.ctaLabel}</span>
                    {!isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightweight Registration Intake Modal */}
      <PlanRegistrationModal
        isOpen={isModalOpen}
        selectedPlanId={modalSelectedPlan}
        claimedCounts={claimedCounts}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </section>
  );
}

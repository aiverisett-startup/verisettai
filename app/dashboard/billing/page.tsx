"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  FileText,
  Lock,
  Sparkles,
  Building2,
  Mail,
  ChevronRight,
  Headphones,
} from "lucide-react";
import confetti from "canvas-confetti";
import { VerisettLogo } from "@/components/VerisettLogo";
import { supabase } from "@/lib/supabase";
import { openRazorpayCheckout } from "@/lib/razorpayClient";
import { AcceptedPaymentRailsStrip } from "@/components/PaymentRailLogos";

export interface PlanTier {
  id: "starter" | "growth" | "scale";
  name: string;
  tagline: string;
  price: number;
  apiOps: string;
  popular?: boolean;
  features: string[];
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter Refill",
    tagline: "Essential capacity for early development and testing.",
    price: 1000,
    apiOps: "100,000 Ops",
    features: [
      "100,000 API operations",
      "Standard rate limits (100 req/min)",
      "Developer dashboard analytics",
      "Standard email support",
    ],
  },
  {
    id: "growth",
    name: "Growth Tier",
    tagline: "High-volume infrastructure for production workloads.",
    price: 2500,
    apiOps: "300,000 Ops",
    popular: true,
    features: [
      "300,000 API operations",
      "High concurrency limits (500 req/min)",
      "Priority API gateway routing",
      "Standard SLA & webhook delivery",
    ],
  },
  {
    id: "scale",
    name: "Scale Tier",
    tagline: "Dedicated high-throughput capacity for enterprise applications.",
    price: 12000,
    apiOps: "2,000,000 Ops",
    features: [
      "2,000,000 API operations",
      "Uncapped concurrency & throughput",
      "Dedicated technical support",
      "Custom billing & tax invoicing",
    ],
  },
];

interface UserSubscription {
  tierId: string;
  name: string;
  basePrice: number;
  opsRemaining: number;
  opsTotal: number;
}

export default function BillingPage() {
  const [userEmail, setUserEmail] = useState<string>("developer@verisett.ai");

  // Current logged-in user subscription state (Default: Starter Refill ₹1,000)
  const [currentUserTier, setCurrentUserTier] = useState<UserSubscription>({
    tierId: "starter",
    name: "Starter Refill",
    basePrice: 1000,
    opsRemaining: 84250,
    opsTotal: 100000,
  });

  const [selectedTierId, setSelectedTierId] = useState<string>("growth");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedPayment, setVerifiedPayment] = useState<{
    payment_id: string;
    order_id: string;
    tier_name: string;
    amount: number;
  } | null>(null);

  // 1. Fetch user session and subscription tier from Supabase
  useEffect(() => {
    async function loadUserSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUserEmail(session.user.email || "developer@verisett.ai");

          let tierKey =
            (session.user.user_metadata?.plan_tier as string) ||
            (session.user.user_metadata?.plan as string) ||
            "";

          const { data: profile } = await supabase
            .from("profiles")
            .select("plan_tier, founder_pass")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profile) {
            if (
              profile.founder_pass ||
              profile.plan_tier === "FOUNDER_NODE" ||
              profile.plan_tier === "tier_3" ||
              profile.plan_tier === "scale"
            ) {
              tierKey = "scale";
            } else if (profile.plan_tier) {
              tierKey = profile.plan_tier;
            }
          }

          if (tierKey) {
            const normalized = tierKey.toLowerCase();
            if (
              normalized.includes("scale") ||
              normalized.includes("founder") ||
              normalized.includes("institution")
            ) {
              setCurrentUserTier({
                tierId: "scale",
                name: "Scale Tier",
                basePrice: 12000,
                opsRemaining: 1840000,
                opsTotal: 2000000,
              });
            } else if (
              normalized.includes("growth") ||
              normalized.includes("pro") ||
              normalized.includes("tier_1")
            ) {
              setCurrentUserTier({
                tierId: "growth",
                name: "Growth Tier",
                basePrice: 2500,
                opsRemaining: 245000,
                opsTotal: 300000,
              });
            } else if (normalized.includes("starter")) {
              setCurrentUserTier({
                tierId: "starter",
                name: "Starter Refill",
                basePrice: 1000,
                opsRemaining: 84250,
                opsTotal: 100000,
              });
            }
          }
        }
      } catch (err) {
        console.warn("[BILLING_SESSION_NOTICE]:", err);
      }
    }

    loadUserSession();
  }, []);

  // 2. Filter Upgrade-Only Plans: strictly price > currentUserTier.basePrice
  const availableUpgradePlans = useMemo(() => {
    return PLAN_TIERS.filter((tier) => tier.price > currentUserTier.basePrice);
  }, [currentUserTier.basePrice]);

  // 3. Resolve Active Selected Plan from visible upgrade tiers
  const activeSelectedPlan = useMemo(() => {
    if (availableUpgradePlans.length === 0) return null;
    const match = availableUpgradePlans.find((t) => t.id === selectedTierId);
    return match || availableUpgradePlans[0];
  }, [availableUpgradePlans, selectedTierId]);

  // 4. Exact Dynamic Financial Calculations
  const calculation = useMemo(() => {
    if (!activeSelectedPlan) {
      return {
        baseAmount: 0,
        gstAmount: 0,
        totalPayable: 0,
        totalPayablePaise: 0,
      };
    }
    const baseAmount = activeSelectedPlan.price;
    const gstAmount = Math.round(baseAmount * 0.18); // 18% Statutory GST
    const totalPayable = baseAmount + gstAmount;
    const totalPayablePaise = totalPayable * 100; // in paise for Razorpay
    return {
      baseAmount,
      gstAmount,
      totalPayable,
      totalPayablePaise,
    };
  }, [activeSelectedPlan]);

  // 5. Automated Razorpay Checkout Execution
  const handleProceedToPay = async () => {
    if (!activeSelectedPlan || calculation.totalPayablePaise <= 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await openRazorpayCheckout({
        amount: calculation.totalPayablePaise,
        name: "Verisett Platform",
        description: `${activeSelectedPlan.name} Upgrade (${activeSelectedPlan.apiOps})`,
        notes: {
          tier_id: activeSelectedPlan.id,
          tier_name: activeSelectedPlan.name,
          api_ops: activeSelectedPlan.apiOps,
          user_email: userEmail,
        },
        themeColor: "#2563eb",
        onSuccess: (result) => {
          setIsProcessing(false);
          setVerifiedPayment({
            payment_id: result.payment_id,
            order_id: result.order_id,
            tier_name: activeSelectedPlan.name,
            amount: calculation.totalPayable,
          });

          // Update active subscription to the upgraded tier
          setCurrentUserTier({
            tierId: activeSelectedPlan.id,
            name: activeSelectedPlan.name,
            basePrice: activeSelectedPlan.price,
            opsRemaining: parseInt(activeSelectedPlan.apiOps.replace(/[^0-9]/g, "")) || 300000,
            opsTotal: parseInt(activeSelectedPlan.apiOps.replace(/[^0-9]/g, "")) || 300000,
          });

          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // Non-fatal
          }
        },
        onFailure: (err) => {
          setIsProcessing(false);
          if (err.description && !err.description.toLowerCase().includes("cancel")) {
            setErrorMessage(err.description);
          }
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to initialize payment gateway. Please try again.");
    }
  };

  const usagePercent = useMemo(() => {
    if (currentUserTier.opsTotal <= 0) return "0.0";
    const used = currentUserTier.opsTotal - currentUserTier.opsRemaining;
    return Math.max(0, Math.min(100, (used / currentUserTier.opsTotal) * 100)).toFixed(1);
  }, [currentUserTier.opsRemaining, currentUserTier.opsTotal]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#2563eb] selection:text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        {/* HEADER BAR */}
        <header className="flex items-center justify-between pb-6 border-b border-[#27272a] flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <VerisettLogo size={32} />
            </Link>
            <div className="h-6 w-px bg-[#27272a] hidden sm:block" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Verisett Platform Billing
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage your API execution tier, add capacity, and view tax invoices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant Activation</span>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#18181b] hover:bg-zinc-800 transition"
            >
              Dashboard
            </Link>
          </div>
        </header>

        {/* CURRENT ACTIVE PLAN & QUOTA METER */}
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Active Subscription:
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[#2563eb]/20 text-[#3b82f6] border border-[#2563eb]/30 font-bold text-xs font-mono">
                  {currentUserTier.name} (₹{currentUserTier.basePrice.toLocaleString()}/mo)
                </span>
              </div>
              <div className="text-sm font-semibold text-white">
                API Execution Quota:{" "}
                <span className="font-mono text-emerald-400">
                  {currentUserTier.opsRemaining.toLocaleString()} /{" "}
                  {currentUserTier.opsTotal.toLocaleString()} Ops used ({usagePercent}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Simulate Tier:</span>
              <select
                value={currentUserTier.tierId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "free") {
                    setCurrentUserTier({
                      tierId: "free",
                      name: "Free Community",
                      basePrice: 0,
                      opsRemaining: 5000,
                      opsTotal: 10000,
                    });
                  } else if (val === "starter") {
                    setCurrentUserTier({
                      tierId: "starter",
                      name: "Starter Refill",
                      basePrice: 1000,
                      opsRemaining: 84250,
                      opsTotal: 100000,
                    });
                  } else if (val === "growth") {
                    setCurrentUserTier({
                      tierId: "growth",
                      name: "Growth Tier",
                      basePrice: 2500,
                      opsRemaining: 245000,
                      opsTotal: 300000,
                    });
                  } else if (val === "scale") {
                    setCurrentUserTier({
                      tierId: "scale",
                      name: "Scale Tier",
                      basePrice: 12000,
                      opsRemaining: 1840000,
                      opsTotal: 2000000,
                    });
                  }
                  setVerifiedPayment(null);
                  setErrorMessage(null);
                }}
                className="bg-[#09090b] border border-[#27272a] text-zinc-300 text-xs font-mono rounded px-2.5 py-1 focus:outline-none focus:border-[#2563eb]"
              >
                <option value="free">Free Community (₹0)</option>
                <option value="starter">Starter Refill (₹1,000)</option>
                <option value="growth">Growth Tier (₹2,500)</option>
                <option value="scale">Scale Tier (₹12,000)</option>
              </select>
            </div>
          </div>

          {/* Clean Progress bar */}
          <div className="w-full bg-zinc-900 rounded-full h-2 border border-[#27272a] overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#2563eb] to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* 2-COLUMN BALANCED DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =================================================== */}
          {/* LEFT COLUMN: UPGRADE PLANS ONLY (DOWNGRADES PURGED) */}
          {/* =================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Upgrade Plans Header */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-zinc-300 uppercase tracking-wider">
                Available Upgrades
              </span>
              <span className="text-zinc-500 font-mono">
                {availableUpgradePlans.length > 0
                  ? `${availableUpgradePlans.length} Tier${availableUpgradePlans.length > 1 ? "s" : ""} Available`
                  : "Highest Tier Active"}
              </span>
            </div>

            {/* Case 1: User is already on the top tier -> Render Enterprise Custom Card */}
            {availableUpgradePlans.length === 0 ? (
              <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 space-y-5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#2563eb]/20 text-[#3b82f6] border border-[#2563eb]/30">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Enterprise Custom Tier
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      You are currently on our highest standard plan ({currentUserTier.name}).
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-300 font-mono">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Uncapped custom operations (10M+ Ops/month)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated VPC peering &amp; private subnets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>99.99% Enterprise SLA guarantee with dedicated TAM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Annual purchase orders &amp; custom invoice terms</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="mailto:enterprise@verisett.ai?subject=Enterprise%20Tier%20Inquiry"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-mono font-semibold text-xs transition cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact Enterprise Solutions</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Case 2: Available Upgrade Plans Grid (Strictly higher tiers) */
              <div className="space-y-3">
                {availableUpgradePlans.map((tier) => {
                  const isSelected = activeSelectedPlan?.id === tier.id;
                  const gst = Math.round(tier.price * 0.18);
                  const total = tier.price + gst;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        setSelectedTierId(tier.id);
                        setErrorMessage(null);
                        setVerifiedPayment(null);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-[#1f1f2e] border-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.22)]"
                          : "bg-[#18181b] border-[#27272a] hover:border-zinc-700 hover:bg-[#1f1f23]"
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2563eb] text-white shadow-xs">
                          Recommended
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {tier.name}
                            </span>
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                              {tier.apiOps}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {tier.tagline}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold text-white font-mono">
                            ₹{tier.price.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            + 18% GST (₹{gst.toLocaleString()})
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400 text-[11px]">
                          Total Payable: <strong className="text-white">₹{total.toLocaleString()}</strong>
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? "text-[#2563eb]" : "text-zinc-600"
                          }`}
                        >
                          {isSelected ? "● Selected Upgrade" : "○ Select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Itemized Tax Invoice Breakdown (Only shown if upgrade tiers exist) */}
            {activeSelectedPlan && (
              <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272a] text-xs font-mono">
                  <span className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#2563eb]" />
                    Itemized Tax Invoice
                  </span>
                  <span className="text-zinc-500">SAC: 998313</span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-400">
                      Base Allocation ({activeSelectedPlan.name} — {activeSelectedPlan.apiOps})
                    </span>
                    <span className="font-semibold text-white">
                      ₹{calculation.baseAmount.toLocaleString()}.00
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span>CGST (9.0%)</span>
                    <span>₹{Math.round(calculation.gstAmount / 2).toLocaleString()}.00</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span>SGST / IGST (9.0%)</span>
                    <span>₹{(calculation.gstAmount - Math.round(calculation.gstAmount / 2)).toLocaleString()}.00</span>
                  </div>

                  <div className="border-t border-[#27272a] pt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold text-white uppercase tracking-wider block">
                        Total Payable
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Inclusive of 18% Goods &amp; Services Tax
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-[#3b82f6] font-mono">
                        ₹{calculation.totalPayable.toLocaleString()}.00
                      </span>
                      <span className="block text-[10px] text-zinc-500 font-mono">
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-[#27272a] text-[11px] font-mono text-zinc-400 flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    B2B Input Tax Credit Eligible
                  </span>
                  <span className="text-zinc-500">Instant PDF Receipt Generated</span>
                </div>
              </div>
            )}

          </div>

          {/* =================================================== */}
          {/* RIGHT COLUMN: CLEAN CHECKOUT SUMMARY & PROCEED BTN */}
          {/* =================================================== */}
          <div className="lg:col-span-5 space-y-6">

            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 space-y-6 shadow-xl relative">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#27272a]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                    Direct Gateway Ingress
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Checkout Summary
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Terminal Ready
                </div>
              </div>

              {/* Payment Confirmed State */}
              {verifiedPayment ? (
                <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white font-mono">
                      ✓ Payment Confirmed!
                    </h4>
                    <p className="text-xs text-emerald-400 font-mono">
                      Transaction ID: {verifiedPayment.payment_id}. Your API quota has been credited.
                    </p>
                  </div>

                  <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs font-mono space-y-1.5 text-left">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">TRANSACTION ID:</span>
                      <span className="font-bold text-emerald-400 break-all">{verifiedPayment.payment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">TIER CREDITED:</span>
                      <span className="font-bold text-white">{verifiedPayment.tier_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">AMOUNT PAID:</span>
                      <span className="font-bold text-[#3b82f6]">₹{verifiedPayment.amount.toLocaleString()}.00</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Return to Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setVerifiedPayment(null)}
                      className="w-full py-2 px-4 rounded-lg border border-[#27272a] bg-[#18181b] text-zinc-400 hover:text-white text-xs font-mono transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : activeSelectedPlan ? (
                /* Dynamic Checkout Summary Card */
                <div className="space-y-5">
                  
                  {/* Summary Breakdown Box */}
                  <div className="p-4 rounded-xl border border-[#27272a] bg-[#09090b] space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Target Upgrade:</span>
                      <span className="font-bold text-white">{activeSelectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Capacity Added:</span>
                      <span className="font-bold text-emerald-400">{activeSelectedPlan.apiOps}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Dynamic Base Price:</span>
                      <span>₹{calculation.baseAmount.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>18% Statutory GST:</span>
                      <span>₹{calculation.gstAmount.toLocaleString()}.00</span>
                    </div>
                    <div className="pt-2 border-t border-[#27272a] flex justify-between items-baseline">
                      <span className="text-zinc-300 uppercase font-semibold">Total Payable:</span>
                      <span className="text-2xl font-extrabold text-[#3b82f6]">
                        ₹{calculation.totalPayable.toLocaleString()}.00
                      </span>
                    </div>
                  </div>

                  {/* Clean Authentic Accepted Payment Rails Strip with Official Vector SVGs */}
                  <AcceptedPaymentRailsStrip />

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Primary 1-Click Button: Proceed to Checkout */}
                  <button
                    type="button"
                    onClick={handleProceedToPay}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-mono font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_14px_rgba(37,99,235,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Launching Razorpay Checkout...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Security Footer */}
                  <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      256-bit Encrypted
                    </span>
                    <span>Verified Razorpay Rail</span>
                  </div>

                </div>
              ) : (
                /* Top Tier Active State in Right Column */
                <div className="p-5 rounded-xl border border-zinc-800 bg-[#09090b] text-center space-y-3 font-mono text-xs">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="font-bold text-white text-sm">
                    Maximum Standard Capacity Active
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Your account is running on the Scale Tier with 2,000,000 Ops. For custom dedicated infrastructure or multi-agent cluster expansions, reach out to enterprise sales.
                  </p>
                  <a
                    href="mailto:enterprise@verisett.ai?subject=Enterprise%20Cluster%20Inquiry"
                    className="inline-flex items-center gap-1.5 text-xs text-[#3b82f6] hover:underline pt-2 font-semibold"
                  >
                    <span>enterprise@verisett.ai</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

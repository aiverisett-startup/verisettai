"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
  Sparkles,
  Building2,
  Mail,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { VerisettLogo } from "@/components/VerisettLogo";
import { supabase } from "@/lib/supabase";
import { openRazorpayCheckout } from "@/lib/razorpayClient";
import { AcceptedPaymentRailsStrip } from "@/components/PaymentRailLogos";

export interface PlanTier {
  id: "builder" | "growth" | "enterprise";
  name: string;
  badge?: string;
  tagline: string;
  price: number;
  apiOps: string;
  features: string[];
}

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "builder",
    name: "Builder Tier",
    tagline: "Essential execution capacity for modern autonomous agents.",
    price: 2499,
    apiOps: "250,000 Ops",
    features: [
      "Uncapped monthly API execution volume",
      "Guaranteed lowest compute latency",
      "Direct webhook event streaming",
      "Standard developer support",
    ],
  },
  {
    id: "growth",
    name: "Growth Tier",
    badge: "Most Popular",
    tagline: "High-throughput production infrastructure with dedicated routing.",
    price: 7999,
    apiOps: "1,500,000 Ops",
    features: [
      "Uncapped monthly API execution volume",
      "Guaranteed lowest compute latency",
      "Direct webhook event streaming",
      "Priority SLA & account manager",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Scale",
    tagline: "Full-scale dedicated cluster with enterprise SLA and direct rails.",
    price: 29999,
    apiOps: "Uncapped Ops",
    features: [
      "Uncapped monthly API execution volume",
      "Guaranteed lowest compute latency",
      "Direct webhook event streaming",
      "Dedicated VPC infrastructure",
      "24/7 Enterprise SLA & Support",
    ],
  },
];

const SPECIFICATION_DELIVERABLES = [
  "Uncapped monthly API execution volume",
  "Guaranteed lowest compute latency",
  "Direct webhook event streaming",
  "Dedicated VPC infrastructure",
  "24/7 Enterprise SLA & Support",
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

  // Current logged-in user subscription state (Default: Free Community ₹0)
  const [currentUserTier, setCurrentUserTier] = useState<UserSubscription>({
    tierId: "free",
    name: "Free Community",
    basePrice: 0,
    opsRemaining: 8500,
    opsTotal: 10000,
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
              profile.plan_tier === "enterprise" ||
              profile.plan_tier === "scale"
            ) {
              tierKey = "enterprise";
            } else if (profile.plan_tier) {
              tierKey = profile.plan_tier;
            }
          }

          if (tierKey) {
            const normalized = tierKey.toLowerCase();
            if (
              normalized.includes("scale") ||
              normalized.includes("founder") ||
              normalized.includes("enterprise") ||
              normalized.includes("tier_3")
            ) {
              setCurrentUserTier({
                tierId: "enterprise",
                name: "Enterprise Scale",
                basePrice: 29999,
                opsRemaining: 5000000,
                opsTotal: 5000000,
              });
            } else if (
              normalized.includes("growth") ||
              normalized.includes("institution") ||
              normalized.includes("tier_2")
            ) {
              setCurrentUserTier({
                tierId: "growth",
                name: "Growth Tier",
                basePrice: 7999,
                opsRemaining: 1245000,
                opsTotal: 1500000,
              });
            } else if (
              normalized.includes("builder") ||
              normalized.includes("pro") ||
              normalized.includes("tier_1")
            ) {
              setCurrentUserTier({
                tierId: "builder",
                name: "Builder Tier",
                basePrice: 2499,
                opsRemaining: 195000,
                opsTotal: 250000,
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
        currency: "INR",
        name: "Verisett Platform",
        description: `${activeSelectedPlan.name} Subscription`,
        prefill: {
          email: userEmail,
        },
        notes: {
          tier_id: activeSelectedPlan.id,
          tier_name: activeSelectedPlan.name,
          plan_name: activeSelectedPlan.name,
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
            opsRemaining: 1500000,
            opsTotal: 1500000,
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <VerisettLogo size={24} />
              <span className="text-sm font-bold text-slate-900 tracking-tight hidden sm:inline-block">
                Verisett Platform
              </span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Billing Terminal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>256-Bit Encrypted Checkout</span>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        {/* Title & Quota Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Subscription:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs font-mono">
                  {currentUserTier.name} (₹{currentUserTier.basePrice.toLocaleString()}/mo)
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-800">
                API Execution Quota:{" "}
                <span className="font-mono text-emerald-600">
                  {currentUserTier.opsRemaining.toLocaleString()} /{" "}
                  {currentUserTier.opsTotal.toLocaleString()} Ops used ({usagePercent}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 uppercase">Simulate Tier:</span>
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
                  } else if (val === "builder") {
                    setCurrentUserTier({
                      tierId: "builder",
                      name: "Builder Tier",
                      basePrice: 2499,
                      opsRemaining: 195000,
                      opsTotal: 250000,
                    });
                  } else if (val === "growth") {
                    setCurrentUserTier({
                      tierId: "growth",
                      name: "Growth Tier",
                      basePrice: 7999,
                      opsRemaining: 1245000,
                      opsTotal: 1500000,
                    });
                  } else if (val === "enterprise") {
                    setCurrentUserTier({
                      tierId: "enterprise",
                      name: "Enterprise Scale",
                      basePrice: 29999,
                      opsRemaining: 5000000,
                      opsTotal: 5000000,
                    });
                  }
                  setVerifiedPayment(null);
                  setErrorMessage(null);
                }}
                className="bg-white border border-slate-200 text-slate-700 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-600 shadow-xs"
              >
                <option value="free">Free Community (₹0)</option>
                <option value="builder">Builder Tier (₹2,499)</option>
                <option value="growth">Growth Tier (₹7,999)</option>
                <option value="enterprise">Enterprise Scale (₹29,999)</option>
              </select>
            </div>
          </div>

          {/* Clean Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
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
            
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Available Upgrades</span>
              <span className="text-blue-600 normal-case font-medium">
                {availableUpgradePlans.length > 0
                  ? `${availableUpgradePlans.length} Tier${availableUpgradePlans.length > 1 ? "s" : ""} Available`
                  : "Highest Tier Active"}
              </span>
            </div>

            {/* Case 1: User is already on top tier */}
            {availableUpgradePlans.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Enterprise Custom Solutions
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      You are currently on our highest standard plan ({currentUserTier.name}).
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Uncapped custom operations (10M+ Ops/month)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated VPC peering &amp; private subnets</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>99.99% Enterprise SLA guarantee with dedicated TAM</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Annual purchase orders &amp; custom invoice terms</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="mailto:enterprise@verisett.ai?subject=Enterprise%20Tier%20Inquiry"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact Enterprise Solutions</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Case 2: Available Upgrade Plans Grid (3-tier Light Mode Style) */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-600/20"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs"
                      }`}
                    >
                      {tier.badge && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                          {tier.badge}
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="text-sm font-bold text-slate-900 break-words leading-tight">
                          {tier.name}
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                          ₹{tier.price.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500 ml-1">/ mo</span>
                        </div>
                        <div className="text-xs font-mono text-slate-600">
                          Total with 18% GST:{" "}
                          <span className="font-semibold text-slate-900">
                            ₹{total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            isSelected ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? "bg-blue-600" : "bg-slate-300"
                            }`}
                          />
                          {isSelected ? "Selected" : "Select Tier"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Plan Specifications Card (Clean White Surface, Slate Checkmarks, Authentic SaaS deliverables) */}
            {activeSelectedPlan && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Plan Specifications ({activeSelectedPlan.name})
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Full Production Access
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-700">
                  {SPECIFICATION_DELIVERABLES.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="p-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-800">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: CLEAN WHITE ELEVATED CHECKOUT CARD (40%)    */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-lg relative">
              
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Direct Payment Terminal
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Checkout Summary
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </div>
              </div>

              {/* Payment Confirmed State */}
              {verifiedPayment ? (
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">
                      Payment Confirmed!
                    </h4>
                    <p className="text-xs text-slate-600">
                      Your subscription capacity has been upgraded instantly.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs font-mono space-y-2 text-left shadow-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">PAYMENT ID:</span>
                      <span className="font-bold text-emerald-600 break-all">{verifiedPayment.payment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SELECTED TIER:</span>
                      <span className="font-bold text-slate-900">{verifiedPayment.tier_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">AMOUNT PAID:</span>
                      <span className="font-bold text-blue-600">₹{verifiedPayment.amount.toLocaleString()}.00</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Enter Developer Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setVerifiedPayment(null)}
                      className="w-full py-2 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-medium transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : activeSelectedPlan ? (
                /* 1-Click Checkout Ingress */
                <div className="space-y-5">
                  
                  {/* Cost Itemization Breakdown Box */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">Target Tier:</span>
                      <span className="font-bold text-slate-900">{activeSelectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">Base Allocation:</span>
                      <span className="font-mono font-medium text-slate-900">
                        ₹{calculation.baseAmount.toLocaleString()}.00
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">18% Statutory GST:</span>
                      <span className="font-mono font-medium text-slate-900">
                        ₹{calculation.gstAmount.toLocaleString()}.00
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                          Total Payable:
                        </span>
                        <span className="text-[11px] text-slate-500">
                          (Inclusive of 18% GST)
                        </span>
                      </div>
                      <span className="text-2xl font-extrabold text-blue-600 font-mono tracking-tight">
                        ₹{calculation.totalPayable.toLocaleString()}.00
                      </span>
                    </div>
                  </div>

                  {/* Clean Authentic Accepted Payment Rails Strip (Light Mode Pill Badges) */}
                  <AcceptedPaymentRailsStrip variant="light" />

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Primary 1-Click Button: Proceed to Checkout */}
                  <button
                    type="button"
                    onClick={handleProceedToPay}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Opening Razorpay Gateway...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Trust Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      256-bit SSL Encrypted
                    </span>
                    <span>Verified Razorpay Rail</span>
                  </div>

                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  Select a tier on the left to proceed with checkout.
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

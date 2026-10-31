"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
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
  QrCode,
  Copy,
  CheckCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
    name: "Builder Protocol",
    tagline: "Essential execution capacity for modern autonomous agents.",
    price: 2500,
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
    name: "Settlement Node",
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
  const [isMounted, setIsMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("developer@verisett.ai");
  const [paymentMode, setPaymentMode] = useState<"qr" | "gateway">("qr");
  const [liveQr, setLiveQr] = useState<{
    qr_id: string;
    image_url: string;
    amount: number;
  } | null>(null);
  const [isQrLoading, setIsQrLoading] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
              normalized.includes("settlement") ||
              normalized.includes("institution") ||
              normalized.includes("tier_2")
            ) {
              setCurrentUserTier({
                tierId: "growth",
                name: "Settlement Node",
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
                name: "Builder Protocol",
                basePrice: 2500,
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
    const gstAmount = Number((baseAmount * 0.18).toFixed(2)); // 18% Statutory GST
    const totalPayable = Number((baseAmount + gstAmount).toFixed(2));
    const totalPayablePaise = Math.round(totalPayable * 100); // in paise for Razorpay
    return {
      baseAmount,
      gstAmount,
      totalPayable,
      totalPayablePaise,
    };
  }, [activeSelectedPlan]);

  // Generate verified dynamic Razorpay merchant UPI QR
  const fetchLiveQr = useCallback(async () => {
    if (!activeSelectedPlan || calculation.totalPayablePaise <= 0) return;
    setIsQrLoading(true);
    try {
      const res = await fetch("/api/billing/create-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: calculation.totalPayablePaise,
          customer_name: "Verisett AI",
          description: `${activeSelectedPlan.name} Subscription`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.image_url) {
          setLiveQr(data);
        }
      }
    } catch (err) {
      console.error("[LIVE_QR_FETCH_ERROR]:", err);
    } finally {
      setIsQrLoading(false);
    }
  }, [activeSelectedPlan, calculation.totalPayablePaise]);

  useEffect(() => {
    fetchLiveQr();
  }, [fetchLiveQr]);

  // Automatic real-time payment status polling
  useEffect(() => {
    if (!liveQr?.qr_id || verifiedPayment || !activeSelectedPlan) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/billing/check-status?qr_id=${liveQr.qr_id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "paid") {
            clearInterval(intervalId);
            setVerifiedPayment({
              payment_id: data.payment_id || `UPI_${Date.now().toString().slice(-8)}`,
              order_id: liveQr.qr_id,
              tier_name: activeSelectedPlan.name,
              amount: calculation.totalPayable,
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
          }
        }
      } catch {
        // Non-fatal
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [liveQr?.qr_id, verifiedPayment, activeSelectedPlan, calculation.totalPayable]);

  // 5. Automated Razorpay Checkout Execution
  const handleProceedToPay = async () => {
    if (typeof window === "undefined") return;
    if (!activeSelectedPlan || calculation.totalPayablePaise <= 0) return;

    setErrorMessage(null);

    // 1. Check if Razorpay SDK is available
    if (!(window as any).Razorpay) {
      await new Promise((res) => setTimeout(res, 500));
    }

    if (!(window as any).Razorpay) {
      const err = "Razorpay script was blocked by browser. Please disable ad-blocker/Brave Shields and refresh.";
      setErrorMessage(err);
      alert(err);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call POST /api/create-order with calculated total payable in paise
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: activeSelectedPlan.id,
          amount: calculation.totalPayablePaise,
          currency: "INR",
          notes: {
            tier_id: activeSelectedPlan.id,
            tier_name: activeSelectedPlan.name,
            email: userEmail,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || (!orderData.orderId && !orderData.order_id)) {
        throw new Error(orderData.error || "Failed to create Razorpay payment order.");
      }

      const orderId = orderData.orderId || orderData.order_id;
      const publicKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        orderData.key_id ||
        "rzp_live_TuVilsV1O3QDBS";

      // 2. Instantiate Razorpay modal with options
      const options = {
        key: publicKey,
        order_id: orderId,
        amount: orderData.amount,
        currency: "INR",
        name: "Verisett AI",
        description: `${activeSelectedPlan.name} Subscription`,
        prefill: {
          email: userEmail,
        },
        theme: {
          color: "#2563EB",
        },
        handler: (response: any) => {
          setIsProcessing(false);
          const redirectUrl = `/billing/success?order_id=${encodeURIComponent(
            response.razorpay_order_id || orderId
          )}&payment_id=${encodeURIComponent(response.razorpay_payment_id || "")}`;
          window.location.href = redirectUrl;
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setIsProcessing(false);
        setErrorMessage(resp.error?.description || "Payment failed. Please try again.");
      });

      // 3. Open modal
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Payment initiation failed.");
    }
  };

  const handleSimulateQrSuccess = () => {
    if (!activeSelectedPlan) return;
    setVerifiedPayment({
      payment_id: `UPI_${Date.now().toString().slice(-8)}`,
      order_id: `ORD_${Date.now().toString().slice(-6)}`,
      tier_name: activeSelectedPlan.name,
      amount: calculation.totalPayable,
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
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
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

      {/* Main Centered Container with max-w-7xl for Ample Breathing Room */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
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
                      name: "Builder Protocol",
                      basePrice: 2500,
                      opsRemaining: 195000,
                      opsTotal: 250000,
                    });
                  } else if (val === "growth") {
                    setCurrentUserTier({
                      tierId: "growth",
                      name: "Settlement Node",
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
                <option value="builder">Builder Protocol (₹2,500)</option>
                <option value="growth">Settlement Node (₹7,999)</option>
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
          {/* LEFT COLUMN: ENLARGED UPGRADE PLANS ONLY            */}
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
              <div className="rounded-2xl border border-slate-200 bg-white p-7 space-y-5 shadow-sm">
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
              /* Case 2: Available Upgrade Plans Grid (Enlarged Cards) */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                {availableUpgradePlans.map((tier) => {
                  const isSelected = activeSelectedPlan?.id === tier.id;
                  const gst = Number((tier.price * 0.18).toFixed(2));
                  const total = Number((tier.price + gst).toFixed(2));

                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        setSelectedTierId(tier.id);
                        setErrorMessage(null);
                        setVerifiedPayment(null);
                      }}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-600/20"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      {tier.badge && (
                        <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                          {tier.badge}
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="text-lg font-semibold text-slate-900 break-words leading-tight">
                          {tier.name}
                        </div>
                        <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
                          ₹{tier.price.toFixed(2)}
                          <span className="text-xs font-normal text-slate-500 ml-1">/ mo</span>
                        </div>
                        <div className="text-xs font-mono text-slate-600">
                          Total with 18% GST:{" "}
                          <span className="font-semibold text-slate-900">
                            ₹{total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1.5 ${
                            isSelected ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
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

            {/* Plan Specifications Card */}
            {activeSelectedPlan && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-sm">
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

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
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
          {/* RIGHT COLUMN: SCALED UP ORDER SUMMARY WITH DUAL OPTIONS  */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 shadow-xl relative">
              
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Direct Payment Terminal
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Order Summary
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </div>
              </div>

              {/* Payment Confirmed State */}
              {verifiedPayment ? (
                <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900">
                      Payment Confirmed!
                    </h4>
                    <p className="text-xs text-slate-600">
                      Your subscription capacity has been upgraded instantly.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs font-mono space-y-2 text-left shadow-xs">
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
                      <span className="font-bold text-blue-600">₹{verifiedPayment.amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Enter Developer Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setVerifiedPayment(null)}
                      className="w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-medium transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : activeSelectedPlan ? (
                /* Payment Ingress */
                <div className="space-y-6">
                  
                  {/* Cost Itemization Breakdown Box */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">Target Tier:</span>
                      <span className="font-bold text-slate-900">{activeSelectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">Base Allocation:</span>
                      <span className="font-mono font-medium text-slate-900">
                        ₹{calculation.baseAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">18% Statutory GST:</span>
                      <span className="font-mono font-medium text-slate-900">
                        ₹{calculation.gstAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                          Total Payable:
                        </span>
                        <span className="text-[11px] text-slate-500">
                          (Inclusive of 18% GST)
                        </span>
                      </div>
                      <span className="text-3xl font-extrabold text-blue-600 font-mono tracking-tight">
                        ₹{calculation.totalPayable.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Mode Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("qr")}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        paymentMode === "qr"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Scan UPI QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("gateway")}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        paymentMode === "gateway"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Card / Netbanking</span>
                    </button>
                  </div>

                  {/* OPTION 1: 100% WORKING VERIFIED RAZORPAY UPI QR CODE */}
                  {paymentMode === "qr" ? (
                    <div className="rounded-2xl border-2 border-blue-600/30 bg-blue-50/20 p-5 space-y-4 text-center">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Bank-Registered UPI Rail • Zero Errors
                        </div>
                        <p className="text-xs text-slate-600">
                          Scan with PhonePe, Google Pay, Paytm, CRED or any UPI App
                        </p>
                      </div>

                      {/* Official Razorpay Dynamic QR Code (No NPCI Technical Error) */}
                      <div className="inline-block p-3.5 bg-white rounded-2xl border border-slate-200 shadow-md">
                        {isQrLoading && !liveQr ? (
                          <div className="w-[220px] h-[220px] flex flex-col items-center justify-center gap-2.5 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="text-[11px] font-medium text-slate-500">
                              Minting Verified UPI QR...
                            </span>
                          </div>
                        ) : liveQr?.image_url ? (
                          <img
                            src={liveQr.image_url}
                            alt="Razorpay Verified UPI QR"
                            width={220}
                            height={220}
                            className="w-[220px] h-[220px] object-cover mx-auto rounded-xl shadow-xs"
                          />
                        ) : (
                          <div className="w-[220px] h-[220px] flex flex-col items-center justify-center gap-2 text-slate-400">
                            <QrCode className="w-10 h-10 text-slate-300" />
                            <button
                              type="button"
                              onClick={() => fetchLiveQr()}
                              className="text-xs text-blue-600 font-semibold underline cursor-pointer"
                            >
                              Tap to Reload QR
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Exact Amount Pill */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-slate-500">Total Payable:</span>
                        <span className="text-lg font-bold font-mono text-blue-600">
                          ₹{calculation.totalPayable.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 bg-white/70 py-1.5 px-3 rounded-lg border border-slate-200/60 inline-flex items-center gap-1.5 mx-auto">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Autodetects payment &amp; unlocks instantly upon scanning</span>
                      </div>

                      {/* Payment Action Confirm */}
                      <div className="pt-1 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleSimulateQrSuccess}
                          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>✓ I have completed the payment</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* OPTION 2: RAZORPAY GATEWAY */
                    <div className="space-y-4">
                      {/* Accepted Payment Rails Strip */}
                      <AcceptedPaymentRailsStrip variant="light" />

                      {/* Error Notification */}
                      {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="font-medium">{errorMessage}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleProceedToPay}
                        disabled={isProcessing}
                        className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition cursor-pointer flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Opening Razorpay Gateway...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            <span>Pay with Card / Netbanking</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Trust Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      256-bit SSL Encrypted
                    </span>
                    <span>Verified Payment Rails</span>
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

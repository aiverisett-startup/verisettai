"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  CreditCard,
  Check,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { VerisettLogo } from "@/components/VerisettLogo";
import { getPlans } from "@/app/actions/register";
import {
  PlanRecord,
  fallbackPlans,
  normalizePlanId,
} from "@/lib/plans";
import { supabase } from "@/lib/supabase";
import { openRazorpayCheckout } from "@/lib/razorpayClient";
import { AcceptedPaymentRailsStrip } from "@/components/PaymentRailLogos";

const PLAN_FEATURES: Record<string, string[]> = {
  community: [
    "Testnet clearinghouse environment",
    "Up to 10,000 monthly API operations",
    "Standard rate limits (50 req/min)",
    "Community Discord developer support",
  ],
  tier_1: [
    "250,000 Monthly API operations",
    "High concurrency limits (500 req/min)",
    "Priority API gateway routing",
    "Dedicated webhook event delivery",
    "Standard SLA & developer support",
  ],
  tier_2: [
    "1,500,000 Monthly API operations",
    "Sub-50ms execution SLA guarantee",
    "Multi-signature vault settlement",
    "Priority technical account manager",
    "24/7 dedicated engineering support",
  ],
  tier_3: [
    "Uncapped API clearinghouse volume",
    "Permanent locked lowest fee rate",
    "Direct commercial bank payout rails",
    "Dedicated private VPC infrastructure",
    "Lifetime sovereign license pass",
  ],
};

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlanParam = searchParams.get("plan") || "tier_2";

  // Plan State
  const [plans, setPlans] = useState<PlanRecord[]>(Object.values(fallbackPlans));
  const [selectedPlanId, setSelectedPlanId] = useState<"community" | "tier_1" | "tier_2" | "tier_3">(
    normalizePlanId(rawPlanParam)
  );

  const [userEmail, setUserEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedPayment, setVerifiedPayment] = useState<{
    payment_id: string;
    order_id: string;
    plan_name: string;
    amount: number;
  } | null>(null);

  // Update selected plan if URL param changes
  useEffect(() => {
    if (rawPlanParam) {
      setSelectedPlanId(normalizePlanId(rawPlanParam));
    }
  }, [rawPlanParam]);

  // Load plans & check current session for prefill email
  useEffect(() => {
    async function loadData() {
      try {
        const livePlans = await getPlans();
        if (livePlans && livePlans.length > 0) {
          setPlans(livePlans);
        }
      } catch (err) {
        console.warn("Could not fetch live plans:", err);
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
      } catch {
        // Non-fatal
      }
    }
    loadData();
  }, []);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || fallbackPlans[selectedPlanId] || fallbackPlans.tier_2;
  }, [plans, selectedPlanId]);

  // Tax Invoice Calculations
  const invoiceCalculation = useMemo(() => {
    const baseAmount = selectedPlan.price_inr;
    const gstAmount = Math.round(baseAmount * 0.18);
    const totalPayable = baseAmount + gstAmount;
    const totalPayablePaise = totalPayable * 100;

    return {
      baseAmount,
      gstAmount,
      totalPayable,
      totalPayablePaise,
    };
  }, [selectedPlan]);

  // 1-Click Streamlined Razorpay Checkout (Zero Form Blockers)
  const handleProceedToCheckout = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      await openRazorpayCheckout({
        amount: invoiceCalculation.totalPayablePaise,
        currency: "INR",
        name: "Verisett Platform",
        description: `${selectedPlan.name} Subscription`,
        prefill: {
          email: userEmail || "developer@verisett.ai",
        },
        notes: {
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
        },
        themeColor: "#2563eb",
        onSuccess: (result) => {
          setIsProcessing(false);
          setVerifiedPayment({
            payment_id: result.payment_id,
            order_id: result.order_id,
            plan_name: selectedPlan.name,
            amount: invoiceCalculation.totalPayable,
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

  const currentFeatures = PLAN_FEATURES[selectedPlan.id] || PLAN_FEATURES.tier_2;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#2563eb] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg border border-[#27272a] bg-[#18181b] hover:bg-zinc-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pricing</span>
            </Link>
            <div className="h-4 w-px bg-[#27272a] hidden sm:block" />
            <Link href="/" className="flex items-center gap-2">
              <VerisettLogo size={24} />
              <span className="text-xs font-bold text-white tracking-tight hidden sm:inline-block">
                Verisett Platform
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>256-Bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Checkout &amp; Capacity Activation
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Instant 1-click gateway checkout with zero intermediate registration forms.
          </p>
        </div>

        {/* 2-Column Balanced Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: PLAN QUOTA, FEATURES & TAX INVOICE (60%)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Plan Selector Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-zinc-300 uppercase tracking-wider">
                  Select Subscription Tier
                </span>
                <span className="text-zinc-500 font-mono">
                  {selectedPlan.is_lifetime ? "Lifetime Pass" : "Monthly Recurring"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plans.filter((p) => p.is_paid).map((p) => {
                  const isSelected = p.id === selectedPlanId;
                  const gst = Math.round(p.price_inr * 0.18);
                  const total = p.price_inr + gst;

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPlanId(p.id as any);
                        setErrorMessage(null);
                        setVerifiedPayment(null);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#1f1f2e] border-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.22)]"
                          : "bg-[#18181b] border-[#27272a] hover:border-zinc-700 hover:bg-[#1f1f23]"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="text-xs font-mono text-zinc-400 font-semibold truncate">
                          {p.name.replace(" Plan", "")}
                        </div>
                        <div className="text-lg font-extrabold text-white font-mono">
                          ₹{p.price_inr.toLocaleString()}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">
                          Total: ₹{total.toLocaleString()}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-mono">
                        <span
                          className={`text-[11px] font-bold ${
                            isSelected ? "text-[#2563eb]" : "text-zinc-600"
                          }`}
                        >
                          {isSelected ? "● Selected" : "○ Select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Quota & Features Summary Card */}
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#27272a] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#2563eb]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                    Plan Specifications ({selectedPlan.name})
                  </span>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                  {selectedPlan.take_rate_label || "1.0% Rate"}
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-300 font-mono">
                {currentFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clean Itemized Tax Invoice */}
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-5 space-y-4 shadow-sm">
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
                    Base Allocation ({selectedPlan.name})
                  </span>
                  <span className="font-semibold text-white">
                    ₹{invoiceCalculation.baseAmount.toLocaleString()}.00
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Statutory CGST (9.0%)</span>
                  <span>₹{Math.round(invoiceCalculation.gstAmount / 2).toLocaleString()}.00</span>
                </div>

                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Statutory SGST / IGST (9.0%)</span>
                  <span>₹{(invoiceCalculation.gstAmount - Math.round(invoiceCalculation.gstAmount / 2)).toLocaleString()}.00</span>
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
                      ₹{invoiceCalculation.totalPayable.toLocaleString()}.00
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-mono">
                      INR (Strictly Fixed)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-[#27272a] text-[11px] font-mono text-zinc-400 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  B2B Input Tax Credit Eligible
                </span>
                <span className="text-zinc-500">Tax Invoice PDF Generated Automatically</span>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: 1-CLICK CHECKOUT CARD & OFFICIAL LOGOS     */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-6">

            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 space-y-6 shadow-xl relative">
              
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#27272a]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                    Instant Gateway Checkout
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
                      Transaction ID: {verifiedPayment.payment_id}. Your capacity is provisioned.
                    </p>
                  </div>

                  <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs font-mono space-y-1.5 text-left">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">TRANSACTION ID:</span>
                      <span className="font-bold text-emerald-400 break-all">{verifiedPayment.payment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">PLAN:</span>
                      <span className="font-bold text-white">{verifiedPayment.plan_name}</span>
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
                      <span>Enter Developer Dashboard</span>
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
              ) : (
                /* 1-Click Checkout Ingress */
                <div className="space-y-5">
                  
                  {/* Summary Breakdown Box */}
                  <div className="p-4 rounded-xl border border-[#27272a] bg-[#09090b] space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Target Tier:</span>
                      <span className="font-bold text-white">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Base Allocation:</span>
                      <span>₹{invoiceCalculation.baseAmount.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>18% Statutory GST:</span>
                      <span>₹{invoiceCalculation.gstAmount.toLocaleString()}.00</span>
                    </div>
                    <div className="pt-2 border-t border-[#27272a] flex justify-between items-baseline">
                      <span className="text-zinc-300 uppercase font-semibold">Total Payable:</span>
                      <span className="text-2xl font-extrabold text-[#3b82f6]">
                        ₹{invoiceCalculation.totalPayable.toLocaleString()}.00
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
                    onClick={handleProceedToCheckout}
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
              )}

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

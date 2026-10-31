"use client";

import React, { useState, useMemo } from "react";
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
  Layers,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { VerisettLogo } from "@/components/VerisettLogo";
import { openRazorpayCheckout } from "@/lib/razorpayClient";

interface PlanTier {
  id: "starter" | "growth" | "scale";
  name: string;
  tagline: string;
  basePrice: number;
  gstAmount: number;
  totalAmount: number;
  apiOps: string;
  popular?: boolean;
  features: string[];
}

const TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter Refill",
    tagline: "Essential capacity for early development and testing.",
    basePrice: 1000,
    gstAmount: 180,
    totalAmount: 1180,
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
    basePrice: 2500,
    gstAmount: 450,
    totalAmount: 2950,
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
    basePrice: 12000,
    gstAmount: 2160,
    totalAmount: 14160,
    apiOps: "2,000,000 Ops",
    features: [
      "2,000,000 API operations",
      "Uncapped concurrency & throughput",
      "Dedicated technical support",
      "Custom billing & tax invoicing",
    ],
  },
];

export default function BillingPage() {
  const [selectedTierId, setSelectedTierId] = useState<"starter" | "growth" | "scale">("growth");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedPayment, setVerifiedPayment] = useState<{
    payment_id: string;
    order_id: string;
    tier_name: string;
    amount: number;
  } | null>(null);

  // Selected plan calculation
  const selectedTier = useMemo(() => {
    return TIERS.find((t) => t.id === selectedTierId) || TIERS[1];
  }, [selectedTierId]);

  // Automated Razorpay Checkout Trigger
  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const totalPaise = Math.round(selectedTier.totalAmount * 100);

    try {
      await openRazorpayCheckout({
        amount: totalPaise,
        name: "Verisett Platform",
        description: `${selectedTier.name} (${selectedTier.apiOps})`,
        notes: {
          tier_id: selectedTier.id,
          tier_name: selectedTier.name,
          api_ops: selectedTier.apiOps,
        },
        themeColor: "#2563eb",
        onSuccess: (result) => {
          setIsProcessing(false);
          setVerifiedPayment({
            payment_id: result.payment_id,
            order_id: result.order_id,
            tier_name: selectedTier.name,
            amount: selectedTier.totalAmount,
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

        {/* QUOTA METER CARD */}
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                API Execution Quota
              </span>
              <div className="text-sm font-semibold text-white mt-0.5">
                API Execution Quota: <span className="font-mono text-emerald-400">84,250 / 100,000 Ops used (84.2%)</span>
              </div>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Billing Cycle: <strong className="text-zinc-200">Continuous Rolling Balance</strong>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-900 rounded-full h-2 border border-[#27272a] overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#2563eb] to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: "84.2%" }}
            />
          </div>
        </div>

        {/* 2-COLUMN BALANCED DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =================================================== */}
          {/* LEFT COLUMN: PLAN & QUOTA SELECTION + TAX INVOICE   */}
          {/* =================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Interactive Tier Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-zinc-300 uppercase tracking-wider">
                  Select Execution Tier
                </span>
                <span className="text-zinc-500">Includes 18% GST</span>
              </div>

              <div className="space-y-3">
                {TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
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
                          Default
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
                            ₹{tier.basePrice.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            + 18% GST (₹{tier.gstAmount})
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400 text-[11px]">
                          Total Payable: <strong className="text-white">₹{tier.totalAmount.toLocaleString()}</strong>
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? "text-[#2563eb]" : "text-zinc-600"
                          }`}
                        >
                          {isSelected ? "● Selected" : "○ Select Tier"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Itemized Tax Invoice */}
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
                    Base Allocation ({selectedTier.name} — {selectedTier.apiOps})
                  </span>
                  <span className="font-semibold text-white">
                    ₹{selectedTier.basePrice.toLocaleString()}.00
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>CGST (9.0%)</span>
                  <span>₹{(selectedTier.gstAmount / 2).toLocaleString()}.00</span>
                </div>

                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>SGST / IGST (9.0%)</span>
                  <span>₹{(selectedTier.gstAmount / 2).toLocaleString()}.00</span>
                </div>

                <div className="border-t border-[#27272a] pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider block">
                      Total Payable
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Inclusive of all statutory taxes
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#3b82f6] font-mono">
                      ₹{selectedTier.totalAmount.toLocaleString()}.00
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
                  B2B Input Tax Credit Compliant
                </span>
                <span className="text-zinc-500">Tax Invoice PDF generated on clearing</span>
              </div>
            </div>

          </div>

          {/* =================================================== */}
          {/* RIGHT COLUMN: 100% AUTOMATED RAZORPAY CHECKOUT CARD */}
          {/* =================================================== */}
          <div className="lg:col-span-5 space-y-6">

            <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6 space-y-6 shadow-xl relative">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#27272a]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                    Automated Checkout
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Checkout Summary
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gateway Ready
                </div>
              </div>

              {verifiedPayment ? (
                /* Payment Confirmed State */
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
                      Add More Capacity
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Form & Trigger */
                <div className="space-y-5">
                  
                  {/* Summary Breakdown Box */}
                  <div className="p-4 rounded-xl border border-[#27272a] bg-[#09090b] space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Selected Tier:</span>
                      <span className="font-bold text-white">{selectedTier.name}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Capacity Added:</span>
                      <span className="font-bold text-emerald-400">{selectedTier.apiOps}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Net Amount:</span>
                      <span>₹{selectedTier.basePrice.toLocaleString()}.00</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-[11px]">
                      <span>GST (18%):</span>
                      <span>₹{selectedTier.gstAmount.toLocaleString()}.00</span>
                    </div>
                    <div className="pt-2 border-t border-[#27272a] flex justify-between items-baseline">
                      <span className="text-zinc-300 uppercase font-semibold">Total Payable:</span>
                      <span className="text-2xl font-extrabold text-[#3b82f6]">
                        ₹{selectedTier.totalAmount.toLocaleString()}.00
                      </span>
                    </div>
                  </div>

                  {/* Payment Rails Accepted Badges */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                      Accepted Payment Rails
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-300">
                      <div className="p-2 rounded bg-[#09090b] border border-[#27272a] flex items-center gap-1.5">
                        <span>⚡ UPI &amp; Dynamic QR</span>
                      </div>
                      <div className="p-2 rounded bg-[#09090b] border border-[#27272a] flex items-center gap-1.5">
                        <span>💳 Credit &amp; Debit Cards</span>
                      </div>
                      <div className="p-2 rounded bg-[#09090b] border border-[#27272a] flex items-center gap-1.5">
                        <span>🏦 50+ NetBanking</span>
                      </div>
                      <div className="p-2 rounded bg-[#09090b] border border-[#27272a] flex items-center gap-1.5">
                        <span>🔒 Corporate EMI</span>
                      </div>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Primary Automated Pay Button */}
                  <button
                    type="button"
                    onClick={handleRazorpayPayment}
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
                        <span>Pay with Razorpay (UPI, QR, Cards)</span>
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

      </div>
    </div>
  );
}

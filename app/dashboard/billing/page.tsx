"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Loader2,
  FileText,
  Building2,
  ArrowUpRight,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

const PLANS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter Plan",
    tagline: "Essential API allocation for early development and testing.",
    basePrice: 1000,
    gstAmount: 180,
    totalAmount: 1180,
    apiOps: "100,000 API Ops",
    features: [
      "100,000 Monthly API Operations",
      "Standard Rate Limits (100 req/min)",
      "Developer Discord & Community Support",
      "Real-time Usage Analytics Dashboard",
    ],
  },
  {
    id: "growth",
    name: "Growth Plan",
    tagline: "Production-grade infrastructure for scaling agent swarms.",
    basePrice: 2500,
    gstAmount: 450,
    totalAmount: 2950,
    apiOps: "300,000 API Ops",
    popular: true,
    features: [
      "300,000 Monthly API Operations",
      "High Concurrency Limits (500 req/min)",
      "Priority Webhook & API Gateway Ingress",
      "Standard SLA & Dedicated Email Support",
    ],
  },
  {
    id: "scale",
    name: "Scale Plan",
    tagline: "Dedicated high-throughput capacity for enterprise workloads.",
    basePrice: 12000,
    gstAmount: 2160,
    totalAmount: 14160,
    apiOps: "2,000,000 API Ops",
    features: [
      "2,000,000 Monthly API Operations",
      "Uncapped Throughput & Zero Throttling",
      "Dedicated Technical Account Engineer",
      "99.9% Uptime SLA & Custom PO Invoicing",
    ],
  },
];

export default function BillingPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<"starter" | "growth" | "scale">("growth");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [confirmedUtr, setConfirmedUtr] = useState<string>("");
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [isProcessingModal, setIsProcessingModal] = useState<boolean>(false);

  // Selected plan calculation
  const selectedPlan = useMemo(() => {
    return PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
  }, [selectedPlanId]);

  // Pure Code NPCI UPI Link generation with fixed amount
  const upiLink = useMemo(() => {
    const totalFormatted = selectedPlan.totalAmount.toFixed(2);
    const note = encodeURIComponent(`Verisett ${selectedPlan.name}`);
    return `upi://pay?pa=ai.verisett@okhdfcbank&pn=Verisett%20AI&am=${totalFormatted}&cu=INR&tn=${note}`;
  }, [selectedPlan]);

  // Handle manual UTR submission
  const handleConfirmUtr = (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);

    const cleanUtr = utrNumber.trim().replace(/\s+/g, "");
    if (!cleanUtr || cleanUtr.length < 8) {
      setUtrError("Please enter a valid 12-digit UPI transaction reference (UTR) number.");
      return;
    }

    setIsConfirmed(true);
    setConfirmedUtr(cleanUtr);
    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Non-fatal
    }
  };

  // Handle standard Razorpay modal checkout
  const handleRazorpayModal = async () => {
    setIsProcessingModal(true);
    setUtrError(null);

    try {
      await openRazorpayCheckout({
        amount: Math.round(selectedPlan.totalAmount * 100), // in paise
        name: "Verisett AI",
        description: `${selectedPlan.name} (incl. 18% GST)`,
        notes: {
          plan_id: selectedPlan.id,
          plan_name: selectedPlan.name,
        },
        onSuccess: (result) => {
          setIsConfirmed(true);
          setConfirmedUtr(result.payment_id);
          setIsProcessingModal(false);
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
          setUtrError(err.description || "Checkout was canceled or failed.");
          setIsProcessingModal(false);
        },
        onDismiss: () => {
          setIsProcessingModal(false);
        },
      });
    } catch (err: any) {
      setUtrError(err?.message || "Failed to initialize payment modal.");
      setIsProcessingModal(false);
    }
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText("ai.verisett@okhdfcbank");
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-[#2563eb] selection:text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        {/* TOP BAR / HEADER */}
        <header className="flex items-center justify-between pb-6 border-b border-[#27272a] flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <VerisettLogo size={32} />
            </Link>
            <div className="h-6 w-px bg-[#27272a] hidden sm:block" />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Subscription &amp; Billing</span>
              </h1>
              <p className="text-xs text-zinc-400">
                Manage API usage quotas, enterprise subscriptions, and payment receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified UPI Rail</span>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#121215] hover:bg-zinc-800 transition"
            >
              Dashboard
            </Link>
          </div>
        </header>

        {/* CURRENT QUOTA BANNER */}
        <div className="rounded-xl border border-[#27272a] bg-[#121215] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Active API Usage Quota
            </span>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Current Allocation: <strong>Growth Tier</strong></span>
              <span className="text-emerald-400 font-mono text-xs">(300,000 Ops / Month)</span>
            </div>
            <p className="text-xs text-zinc-400">
              Quota refreshes automatically upon invoice settlement. Unused operations roll over up to 90 days.
            </p>
          </div>

          <div className="sm:text-right shrink-0 font-mono text-xs">
            <span className="text-zinc-500 block text-[10px] uppercase">Billing Cycle</span>
            <span className="text-zinc-200 font-bold">Monthly Renewable</span>
          </div>
        </div>

        {/* 2-COLUMN BALANCED DASHBOARD (60% / 40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================== */}
          {/* LEFT COLUMN (60%): PLAN PICKER & INVOICE   */}
          {/* ========================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Plan Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-zinc-300 uppercase tracking-wider">
                  Select Subscription Tier
                </span>
                <span className="text-zinc-500">Instant Activation</span>
              </div>

              <div className="space-y-3">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setIsConfirmed(false);
                        setUtrError(null);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-[#18181f] border-[#2563eb] shadow-[0_0_24px_rgba(37,99,235,0.18)]"
                          : "bg-[#121215] border-[#27272a] hover:border-zinc-700 hover:bg-[#16161a]"
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2563eb] text-white shadow-xs">
                          Popular
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {plan.name}
                            </span>
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                              {plan.apiOps}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {plan.tagline}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold text-white font-mono">
                            ₹{plan.basePrice.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            + 18% GST (₹{plan.gstAmount})
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400 text-[11px]">
                          Total Payable: <strong className="text-white">₹{plan.totalAmount.toLocaleString()}.00</strong>
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

            {/* 2. Tax Invoice Breakdown */}
            <div className="rounded-xl border border-[#27272a] bg-[#121215] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#27272a] text-xs font-mono">
                <span className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#2563eb]" />
                  Tax Invoice Itemization
                </span>
                <span className="text-zinc-500">SAC: 998313</span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="text-zinc-400">
                    Base Allocation ({selectedPlan.name} — {selectedPlan.apiOps})
                  </span>
                  <span className="font-semibold text-white">
                    ₹{selectedPlan.basePrice.toLocaleString()}.00
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>CGST (9.0%)</span>
                  <span>₹{(selectedPlan.gstAmount / 2).toLocaleString()}.00</span>
                </div>

                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>SGST / IGST (9.0%)</span>
                  <span>₹{(selectedPlan.gstAmount / 2).toLocaleString()}.00</span>
                </div>

                <div className="border-t border-[#27272a] pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider block">
                      Total Payable
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Statutory Tax Invoice issued upon confirmation
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#3b82f6] font-mono">
                      ₹{selectedPlan.totalAmount.toLocaleString()}.00
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-mono">
                      INR (Strictly Fixed)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/80 border border-[#27272a] text-[11px] font-mono text-zinc-400 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  B2B Input Tax Credit Eligible
                </span>
                <span className="text-zinc-500">HDFC Corporate Settlement Rail</span>
              </div>
            </div>

          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN (40%): CASHFREE/STRIPE TERMINAL*/}
          {/* ========================================== */}
          <div className="lg:col-span-5 space-y-6">

            <div className="rounded-xl border border-[#27272a] bg-[#121215] p-6 space-y-5 shadow-xl relative">
              
              <div className="flex items-start justify-between pb-4 border-b border-[#27272a]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                    Direct Payment Terminal
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Scan &amp; Pay via UPI
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Fixed Amount Locked
                </div>
              </div>

              {isConfirmed ? (
                /* Confirmed Success State */
                <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white font-mono">
                      PAYMENT RECORDED
                    </h4>
                    <p className="text-xs text-emerald-400 font-mono">
                      Reference captured. API quota updated immediately.
                    </p>
                  </div>

                  <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs font-mono space-y-1.5 text-left">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">REFERENCE / UTR:</span>
                      <span className="font-bold text-emerald-400 break-all">{confirmedUtr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">TIER:</span>
                      <span className="font-bold text-white">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">AMOUNT:</span>
                      <span className="font-bold text-[#3b82f6]">₹{selectedPlan.totalAmount.toLocaleString()}.00</span>
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
                      onClick={() => {
                        setIsConfirmed(false);
                        setUtrNumber("");
                      }}
                      className="w-full py-2 px-4 rounded-lg border border-[#27272a] bg-[#121215] text-zinc-400 hover:text-white text-xs font-mono transition cursor-pointer"
                    >
                      Record Another Payment
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* PURE CODE FIXED-AMOUNT UPI QR CARD */}
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    
                    {/* White QR Code Card (Rendered Purely in Client-Side SVG) */}
                    <div className="p-4 bg-white rounded-xl shadow-2xl border border-zinc-200 inline-block">
                      <QRCodeSVG
                        value={upiLink}
                        size={190}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Exact Locked Amount Label */}
                    <div className="space-y-0.5 pt-1">
                      <div className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                        Locked Amount
                      </div>
                      <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                        ₹{selectedPlan.totalAmount.toLocaleString()}.00
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {selectedPlan.name} • Non-Editable Fixed Link
                      </div>
                    </div>

                    {/* Scan Note */}
                    <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-zinc-300 w-full space-y-1">
                      <div className="font-semibold text-white flex items-center justify-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>Scan with GPay, PhonePe, Paytm, or BHIM</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Amount is automatically locked. No manual amount entry needed.
                      </p>
                    </div>

                    {/* VPA Copy Pill */}
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400 w-full pt-1">
                      <span className="text-[11px] text-zinc-500">VPA:</span>
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-[#27272a] text-zinc-300 hover:text-white transition cursor-pointer text-[11px]"
                      >
                        <span>ai.verisett@okhdfcbank</span>
                        {copiedVpa ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-zinc-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* UTR VERIFICATION CONFIRMATION FORM */}
                  <form onSubmit={handleConfirmUtr} className="space-y-3 pt-2 border-t border-[#27272a]">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-400 mb-1.5 font-medium">
                        Enter 12-Digit UPI Reference (UTR) Number
                      </label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => {
                          setUtrNumber(e.target.value);
                          setUtrError(null);
                        }}
                        placeholder="e.g. 430129849201"
                        maxLength={22}
                        className="w-full bg-[#09090b] border border-[#27272a] focus:border-[#2563eb] text-white px-3.5 py-2.5 rounded-lg text-xs font-mono placeholder:text-zinc-600 focus:outline-none transition-all"
                      />
                    </div>

                    {utrError && (
                      <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{utrError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Payment</span>
                    </button>
                  </form>

                  {/* SECONDARY ACTION: PAY VIA RAZORPAY MODAL */}
                  <div className="pt-2 border-t border-[#27272a] space-y-2">
                    <button
                      type="button"
                      onClick={handleRazorpayModal}
                      disabled={isProcessingModal}
                      className="w-full py-2.5 px-4 rounded-lg border border-[#27272a] bg-[#09090b] hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessingModal ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
                          <span>Opening Razorpay Modal...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Pay via Razorpay Modal (Cards / NetBanking)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Footer Security Badges */}
                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      NPCI Protocol Conforming
                    </span>
                    <span>256-bit AES Encrypted</span>
                  </div>
                </>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

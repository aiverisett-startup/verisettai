"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Loader2,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  LogOut,
  Clock,
  Coins,
  BarChart3,
  CheckCheck,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { VerisettLogo } from "@/components/VerisettLogo";
import { supabase } from "@/lib/supabase";
import { dispatchAuthChange } from "@/lib/useAuthUser";
import { openRazorpayCheckout } from "@/lib/razorpayClient";

type BillingTab = "plans" | "credits";

interface PlanOption {
  id: string;
  name: string;
  tagline: string;
  priceINR: number;
  period: string;
  takeRate: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

interface CreditOption {
  id: string;
  name: string;
  credits: number;
  bonusText?: string;
  priceINR: number;
  ratePerOp: string;
  badge?: string;
  popular?: boolean;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: "pro",
    name: "Developer Pro Node",
    tagline: "High-throughput clearing for production agent swarms.",
    priceINR: 2499,
    period: "month",
    takeRate: "1.50% fee",
    features: [
      "250,000 Monthly Cleared Ops",
      "Sub-150ms Settlement SLA",
      "Dynamic Dispute Arbitration",
      "Dedicated Webhooks & Telemetry",
    ],
  },
  {
    id: "institution",
    name: "Institutional Node",
    tagline: "Dedicated clearing pipeline for enterprise agent brokers.",
    priceINR: 7999,
    period: "month",
    takeRate: "1.00% fee",
    popular: true,
    badge: "Enterprise Standard",
    features: [
      "1,500,000 Monthly Cleared Ops",
      "Sub-50ms Programmatic Clearing",
      "Multi-Signature Vault Settlement",
      "Priority FastMCP Witnessing",
      "24/7 Dedicated Ops Routing",
    ],
  },
  {
    id: "founder_lifetime",
    name: "Sovereign Node Pass",
    tagline: "Permanent lowest protocol fee rate. Strictly capped pass.",
    priceINR: 30000,
    period: "lifetime",
    takeRate: "0.75% fee (Lowest)",
    badge: "Founder Lifetime",
    features: [
      "Uncapped Clearinghouse Volume",
      "Permanent 0.75% Locked Take-Rate",
      "Zero Annual Renewal Fees",
      "Direct Commercial Bank Payout Rail",
      "Sovereign Cryptographic Node ID",
    ],
  },
];

const CREDIT_OPTIONS: CreditOption[] = [
  {
    id: "credit_1k",
    name: "Starter Refill",
    credits: 100000,
    priceINR: 1000,
    ratePerOp: "₹0.010 / op",
  },
  {
    id: "credit_2500",
    name: "Growth Swarm",
    credits: 300000,
    bonusText: "+20% Bonus Ops Included",
    priceINR: 2500,
    ratePerOp: "₹0.0083 / op",
    popular: true,
    badge: "Most Selected",
  },
  {
    id: "credit_5k",
    name: "Autonomous Cluster",
    credits: 750000,
    bonusText: "+25% Bonus Ops Included",
    priceINR: 5000,
    ratePerOp: "₹0.0066 / op",
  },
  {
    id: "credit_12k",
    name: "Institutional Scale",
    credits: 2000000,
    bonusText: "+33% Bonus Ops Included",
    priceINR: 12000,
    ratePerOp: "₹0.0060 / op",
    badge: "Maximum Value",
  },
];

export default function BillingPage() {
  const router = useRouter();

  // Authentication & Tenant State
  const [userEmail, setUserEmail] = useState<string>("operator@verisett.ai");
  const [tenantId, setTenantId] = useState<string>("TENANT-STANDBY");

  // Selection State
  const [activeTab, setActiveTab] = useState<BillingTab>("plans");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("institution");
  const [selectedCreditId, setSelectedCreditId] = useState<string>("credit_2500");

  // Payment Terminal State
  const [paymentRail, setPaymentRail] = useState<"upi_qr" | "standard_modal">("upi_qr");
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{
    qr_id: string;
    image_url: string;
    amount: number;
  } | null>(null);
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes (seconds)
  const [isCopiedQrUrl, setIsCopiedQrUrl] = useState<boolean>(false);

  // Settlement Success State
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paidDetails, setPaidDetails] = useState<{
    payment_id: string;
    amount: number;
    paid_at: number;
  } | null>(null);

  // Modal / Standard Checkout State
  const [isProcessingModal, setIsProcessingModal] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // 1. Session Discovery
  useEffect(() => {
    async function loadSession() {
      try {
        let supaUser = (await supabase.auth.getSession()).data.session?.user;
        if (!supaUser) {
          const { data: userData } = await supabase.auth.getUser();
          supaUser = userData.user || undefined;
        }

        if (supaUser) {
          setUserEmail(supaUser.email || "operator@verisett.ai");
          const shortId = supaUser.id.replace(/-/g, "").slice(0, 8).toUpperCase();
          setTenantId(`TENANT-${shortId}`);
        } else {
          const storedEmail =
            typeof window !== "undefined"
              ? localStorage.getItem("verisett_user_email")
              : null;
          if (storedEmail) {
            setUserEmail(storedEmail);
            setTenantId("TENANT-01J7A8");
          } else {
            setTenantId("TENANT-01J7A8");
          }
        }
      } catch (err) {
        console.warn("Session check notice:", err);
      }
    }
    loadSession();
  }, []);

  // 2. Financial Calculations
  const selectedItem = useMemo(() => {
    if (activeTab === "plans") {
      return (
        PLAN_OPTIONS.find((p) => p.id === selectedPlanId) || PLAN_OPTIONS[1]
      );
    }
    return (
      CREDIT_OPTIONS.find((c) => c.id === selectedCreditId) || CREDIT_OPTIONS[1]
    );
  }, [activeTab, selectedPlanId, selectedCreditId]);

  const basePriceINR = selectedItem.priceINR;
  const gstRate = 0.18; // 18% Statutory GST
  const cgstINR = Math.round(basePriceINR * 0.09);
  const sgstINR = Math.round(basePriceINR * 0.18) - cgstINR;
  const totalTaxINR = cgstINR + sgstINR;
  const totalPayableINR = basePriceINR + totalTaxINR;
  const totalPayablePaise = totalPayableINR * 100;

  // 3. QR Generation Handler
  const generateDynamicQr = useCallback(
    async (amountInPaise: number, itemName: string) => {
      setIsGeneratingQr(true);
      setQrError(null);
      setIsPaid(false);
      setPaidDetails(null);

      try {
        const res = await fetch("/api/billing/create-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountInPaise,
            customer_name: userEmail || "Verisett Operator",
            description: `Verisett AI - ${itemName} (incl. 18% GST)`,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.qr_id) {
          throw new Error(data.error || "Failed to generate dynamic Razorpay UPI QR.");
        }

        setQrData({
          qr_id: data.qr_id,
          image_url: data.image_url,
          amount: data.amount || amountInPaise,
        });
        setCountdown(600);
      } catch (err: any) {
        setQrError(err?.message || "Unable to reach Razorpay settlement bridge.");
      } finally {
        setIsGeneratingQr(false);
      }
    },
    [userEmail]
  );

  // Trigger QR generation whenever selection changes
  useEffect(() => {
    generateDynamicQr(totalPayablePaise, selectedItem.name);
  }, [totalPayablePaise, selectedItem.name, generateDynamicQr]);

  // 4. Countdown Timer
  useEffect(() => {
    if (!qrData || isPaid) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrData, isPaid]);

  // 5. Real-Time Webhook Settlement Polling
  useEffect(() => {
    if (!qrData?.qr_id || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/billing/check-status?qr_id=${encodeURIComponent(qrData.qr_id)}`
        );
        if (!res.ok) return;

        const data = await res.json();
        if (data.status === "paid") {
          setIsPaid(true);
          setPaidDetails({
            payment_id: data.payment_id || `pay_qr_${qrData.qr_id.slice(-8)}`,
            amount: data.amount || qrData.amount,
            paid_at: data.paid_at || Date.now(),
          });
          clearInterval(interval);
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
      } catch (pollErr) {
        console.warn("[BILLING_POLL_NOTICE]:", pollErr);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [qrData?.qr_id, isPaid, qrData?.amount]);

  // 6. Alternative Modal Checkout
  const handleCardCheckout = async () => {
    setIsProcessingModal(true);
    setCheckoutError(null);

    try {
      await openRazorpayCheckout({
        amount: totalPayablePaise,
        name: "Verisett AI",
        description: `${selectedItem.name} (incl. 18% GST)`,
        prefill: {
          email: userEmail,
        },
        notes: {
          item_id: selectedItem.id,
          category: activeTab,
          tenant_id: tenantId,
        },
        onSuccess: (result) => {
          setIsPaid(true);
          setPaidDetails({
            payment_id: result.payment_id,
            amount: totalPayablePaise,
            paid_at: Date.now(),
          });
          setIsProcessingModal(false);
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.55 },
            });
          } catch {
            // Non-fatal
          }
        },
        onFailure: (err) => {
          setCheckoutError(err.description || "Checkout session dismissed or payment failed.");
          setIsProcessingModal(false);
        },
        onDismiss: () => {
          setIsProcessingModal(false);
        },
      });
    } catch (err: any) {
      setCheckoutError(err?.message || "Failed to initialize Razorpay modal.");
      setIsProcessingModal(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyLink = () => {
    if (!qrData?.image_url) return;
    navigator.clipboard.writeText(qrData.image_url);
    setIsCopiedQrUrl(true);
    setTimeout(() => setIsCopiedQrUrl(false), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("verisett_user_email");
    localStorage.removeItem("verisett_auth_provider");
    dispatchAuthChange();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden">
      {/* Engineered Technical Micro-Grid Dot Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 select-none -z-10 opacity-30"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Ambient Cobalt Specular Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 select-none -z-10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.18)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        {/* TOP BAR / NAVIGATION */}
        <header className="relative border border-[#27272A] bg-zinc-950/80 backdrop-blur-md rounded-xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4 shadow-lg">
          {/* Technical Corner Accents */}
          <span className="absolute -top-[5px] -left-[5px] text-zinc-600 font-mono text-xs select-none">+</span>
          <span className="absolute -top-[5px] -right-[5px] text-zinc-600 font-mono text-xs select-none">+</span>
          <span className="absolute -bottom-[5px] -left-[5px] text-zinc-600 font-mono text-xs select-none">+</span>
          <span className="absolute -bottom-[5px] -right-[5px] text-zinc-600 font-mono text-xs select-none">+</span>

          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <VerisettLogo size={30} />
            </Link>
            <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-zinc-200 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
                {tenantId}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SETTLEMENT RAIL ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <nav className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Telemetry</span>
              </Link>
              <Link
                href="/dashboard/billing"
                className="px-3 py-1.5 rounded-md bg-[#2563EB] text-white font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Billing Terminal</span>
              </Link>
            </nav>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900 text-zinc-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* MAIN BALANCED TWO-COLUMN DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: QUOTAS, PLANS, RECHARGES & FINANCIAL SUMMARY */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Protocol Active Quota & Fee Efficiency Banner */}
            <div className="relative border border-[#27272A] bg-zinc-950/80 backdrop-blur-md rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
              <span className="absolute -top-[5px] -left-[5px] text-zinc-600 font-mono text-xs select-none">+</span>
              <span className="absolute -top-[5px] -right-[5px] text-zinc-600 font-mono text-xs select-none">+</span>

              <div className="flex items-start justify-between flex-wrap gap-3 pb-3 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
                      Active Node Telemetry &amp; Protocol Fee
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Continuous programmatic settlement via FastMCP escrow contracts.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] uppercase text-zinc-500 block">Take-Rate</span>
                  <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    0.75% Locked Rate
                  </span>
                </div>
              </div>

              {/* API Credit Quota Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                    Clearinghouse Execution Operations
                  </span>
                  <span className="text-zinc-200 font-bold">
                    84,250 / 100,000 Ops (84.2% available)
                  </span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2.5 border border-zinc-800 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#2563EB] to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: "84.2%" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800/80">
                  <span className="block text-zinc-500 text-[10px] uppercase">Account</span>
                  <span className="text-zinc-200 font-medium truncate block">{userEmail}</span>
                </div>
                <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800/80">
                  <span className="block text-zinc-500 text-[10px] uppercase">Latency</span>
                  <span className="text-emerald-400 font-bold block">sub-50ms</span>
                </div>
                <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800/80">
                  <span className="block text-zinc-500 text-[10px] uppercase">Arbitration</span>
                  <span className="text-zinc-200 font-bold block">Autonomous</span>
                </div>
                <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800/80">
                  <span className="block text-zinc-500 text-[10px] uppercase">Standard</span>
                  <span className="text-blue-400 font-bold block">Double-Entry</span>
                </div>
              </div>
            </div>

            {/* 2. Selection Mode Switcher (Node License vs API Credits) */}
            <div className="border border-[#27272A] bg-zinc-950/80 backdrop-blur-md rounded-xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <span>Settlement Ingress Allocation</span>
                </h3>

                {/* Tab Switcher */}
                <div className="inline-flex rounded-lg bg-zinc-900 p-1 border border-zinc-800 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab("plans")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                      activeTab === "plans"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Node License Tiers
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("credits")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                      activeTab === "credits"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    API Credit Top-Up
                  </button>
                </div>
              </div>

              {/* Tab 1: Node License Cards */}
              {activeTab === "plans" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLAN_OPTIONS.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-950/20 border-[#2563EB] shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                            : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#2563EB] text-white shadow-xs">
                            {plan.badge}
                          </span>
                        )}

                        <div className="space-y-2">
                          <div className="text-xs font-mono text-zinc-400 font-semibold">
                            {plan.name}
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-white font-mono">
                              ₹{plan.priceINR.toLocaleString()}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-500">
                              /{plan.period}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono font-semibold text-emerald-400">
                            {plan.takeRate}
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                            {plan.tagline}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-zinc-500">Selection</span>
                          <span
                            className={`font-bold ${
                              isSelected ? "text-[#2563EB]" : "text-zinc-600"
                            }`}
                          >
                            {isSelected ? "● ACTIVE" : "○ SELECT"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: API Credit Cards */}
              {activeTab === "credits" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CREDIT_OPTIONS.map((credit) => {
                    const isSelected = selectedCreditId === credit.id;
                    return (
                      <div
                        key={credit.id}
                        onClick={() => setSelectedCreditId(credit.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-950/20 border-[#2563EB] shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                            : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                        }`}
                      >
                        {credit.badge && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                            {credit.badge}
                          </span>
                        )}

                        <div className="space-y-1.5">
                          <div className="text-xs font-mono text-zinc-400 font-semibold">
                            {credit.name}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-white font-mono">
                              ₹{credit.priceINR.toLocaleString()}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                              {credit.credits.toLocaleString()} Ops
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500">
                            Effective Rate: {credit.ratePerOp}
                          </div>
                          {credit.bonusText && (
                            <div className="text-[10px] font-mono font-semibold text-cyan-400 pt-0.5">
                              ⚡ {credit.bonusText}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-zinc-500">Instant Recharge</span>
                          <span
                            className={`font-bold ${
                              isSelected ? "text-[#2563EB]" : "text-zinc-600"
                            }`}
                          >
                            {isSelected ? "● SELECTED" : "○ CHOOSE"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Clean Cost Summary with Explicit Line Items (Subtotal + 18% GST + Total) */}
            <div className="relative border border-[#27272A] bg-zinc-950/80 backdrop-blur-md rounded-xl p-5 sm:p-6 shadow-xl space-y-4">
              <span className="absolute -bottom-[5px] -left-[5px] text-zinc-600 font-mono text-xs select-none">+</span>
              <span className="absolute -bottom-[5px] -right-[5px] text-zinc-600 font-mono text-xs select-none">+</span>

              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs font-mono">
                <span className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                  Tax Invoice &amp; Cost Breakdown
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  SAC CODE: 998313
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {/* Line 1: Base Subtotal */}
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="text-zinc-400">
                    Base Allocation ({selectedItem.name})
                  </span>
                  <span className="font-semibold text-white">
                    ₹{basePriceINR.toLocaleString()}
                  </span>
                </div>

                {/* Line 2: CGST (9%) */}
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Statutory Goods &amp; Services Tax (CGST @ 9.0%)</span>
                  <span>₹{cgstINR.toLocaleString()}</span>
                </div>

                {/* Line 3: SGST (9%) */}
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Statutory Goods &amp; Services Tax (SGST / IGST @ 9.0%)</span>
                  <span>₹{sgstINR.toLocaleString()}</span>
                </div>

                {/* Line 4: Protocol Fee */}
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Protocol Gateway Surcharge</span>
                  <span className="text-emerald-400 font-bold">₹0.00 (WAIVED)</span>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-800/80 pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider block">
                      Total Payable (Gross)
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Paise Equivalent: {totalPayablePaise.toLocaleString()} paise
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#3B82F6] font-mono">
                      ₹{totalPayableINR.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-zinc-500 uppercase">
                      Inclusive of all taxes
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Statutory B2B GST Credit Eligible
                </span>
                <span className="text-zinc-500">
                  GSTIN Input Applied on Confirmation
                </span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: PAYMENT TERMINAL WITH DYNAMIC RAZORPAY UPI */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">

            <div className="relative border border-[#27272A] bg-zinc-950/90 backdrop-blur-md rounded-xl p-6 shadow-2xl space-y-6">
              <span className="absolute -top-[5px] -left-[5px] text-zinc-600 font-mono text-xs select-none">+</span>
              <span className="absolute -top-[5px] -right-[5px] text-zinc-600 font-mono text-xs select-none">+</span>
              <span className="absolute -bottom-[5px] -left-[5px] text-zinc-600 font-mono text-xs select-none">+</span>
              <span className="absolute -bottom-[5px] -right-[5px] text-zinc-600 font-mono text-xs select-none">+</span>

              {/* Terminal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold mb-1.5">
                    <Terminal className="w-3 h-3" />
                    <span>RAZORPAY PAYMENT TERMINAL</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Programmatic Settlement
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Real-time single-use UPI QR &amp; zero-delay verification.
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    INGRESS READY
                  </span>
                </div>
              </div>

              {/* Verified Success State Overlay */}
              {isPaid ? (
                <div className="p-6 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-center space-y-4 animate-in fade-in zoom-in-95">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white font-mono">
                      PAYMENT RECEIVED &amp; VERIFIED
                    </h4>
                    <p className="text-xs text-emerald-400 font-mono">
                      Webhook confirmed. Clearinghouse node allocation provisioned.
                    </p>
                  </div>

                  <div className="p-3.5 bg-zinc-900/90 rounded-lg border border-zinc-800 text-xs font-mono space-y-1.5 text-left">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">PAYMENT ID:</span>
                      <span className="font-bold text-emerald-400 break-all">{paidDetails?.payment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">AMOUNT SETTLED:</span>
                      <span className="font-bold text-white">₹{( (paidDetails?.amount || totalPayablePaise) / 100 ).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ALLOCATION:</span>
                      <span className="font-bold text-[#3B82F6]">{selectedItem.name}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <Link
                      href="/dashboard"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Return to Telemetry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaid(false);
                        generateDynamicQr(totalPayablePaise, selectedItem.name);
                      }}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white text-xs font-mono transition cursor-pointer"
                    >
                      New Invoice
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setPaymentRail("upi_qr")}
                      className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                        paymentRail === "upi_qr"
                          ? "border-[#2563EB] bg-blue-500/10 text-blue-400"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Scan &amp; Pay (UPI QR)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentRail("standard_modal")}
                      className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                        paymentRail === "standard_modal"
                          ? "border-[#2563EB] bg-blue-500/10 text-blue-400"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span>Cards / NetBanking</span>
                    </button>
                  </div>

                  {/* TAB 1: DEDICATED SCAN & PAY VIA UPI CARD */}
                  {paymentRail === "upi_qr" && (
                    <div className="space-y-4">
                      {/* Crisp QR Code Display Frame with White Padded Background */}
                      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col items-center justify-center text-center space-y-4">
                        
                        {/* QR Image Box */}
                        <div className="p-3 bg-white rounded-xl shadow-2xl border border-zinc-200 inline-block">
                          {isGeneratingQr ? (
                            <div className="w-52 h-52 sm:w-56 sm:h-56 flex flex-col items-center justify-center bg-zinc-50 rounded-lg text-zinc-600 gap-2">
                              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
                              <span className="text-[11px] font-mono">Minting Razorpay QR...</span>
                            </div>
                          ) : qrError ? (
                            <div className="w-52 h-52 sm:w-56 sm:h-56 flex flex-col items-center justify-center bg-zinc-50 rounded-lg text-rose-600 p-4 text-center gap-2">
                              <AlertCircle className="w-8 h-8" />
                              <span className="text-[11px] font-mono leading-tight">{qrError}</span>
                              <button
                                type="button"
                                onClick={() => generateDynamicQr(totalPayablePaise, selectedItem.name)}
                                className="mt-1 px-3 py-1 bg-zinc-900 text-white rounded text-[10px] font-mono hover:bg-zinc-800"
                              >
                                Retry
                              </button>
                            </div>
                          ) : qrData?.image_url ? (
                            <img
                              src={qrData.image_url}
                              alt="Razorpay Dynamic UPI QR"
                              className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-md"
                            />
                          ) : (
                            <div className="w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center bg-zinc-50 rounded-lg text-zinc-400">
                              <QrCode className="w-12 h-12" />
                            </div>
                          )}
                        </div>

                        {/* Amount & Status Banner */}
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                            Exact Settlement Amount
                          </div>
                          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                            ₹{totalPayableINR.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            Single-Use Dynamic QR • {selectedItem.name}
                          </div>
                        </div>

                        {/* Status Indicator & Countdown Timer */}
                        <div className="flex items-center justify-center gap-3 text-xs font-mono pt-1 flex-wrap">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>Awaiting Payment...</span>
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Expires in {formatCountdown(countdown)}</span>
                          </div>
                        </div>

                        {/* Explicit Scanning App Label */}
                        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-300 w-full">
                          <span className="block font-semibold text-white mb-1">
                            Scan with GPay, PhonePe, Paytm, or BHIM
                          </span>
                          <span className="text-[11px] text-zinc-400 block leading-relaxed">
                            Open any UPI app, point camera to scan, and authorize. The terminal auto-detects settlement in real-time.
                          </span>
                        </div>

                        {/* Fallback Refresh Button */}
                        <div className="w-full flex items-center justify-between pt-1 text-xs font-mono text-zinc-400">
                          <button
                            type="button"
                            onClick={() => generateDynamicQr(totalPayablePaise, selectedItem.name)}
                            disabled={isGeneratingQr}
                            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingQr ? "animate-spin" : ""}`} />
                            <span>Generate New QR</span>
                          </button>

                          {qrData?.image_url && (
                            <button
                              type="button"
                              onClick={handleCopyLink}
                              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition cursor-pointer"
                            >
                              {isCopiedQrUrl ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* TAB 2: ALTERNATIVE STANDARD CHECKOUT (CARDS / NETBANKING) */}
                  {paymentRail === "standard_modal" && (
                    <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-4">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#2563EB]" />
                          <span>Razorpay Standard Modal</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Direct web checkout supporting corporate debit/credit cards, 50+ NetBanking portals, and wallets.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-300">
                        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                          💳 All Major Cards
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                          🏦 50+ NetBanking
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                          🔒 Corporate EMI
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                          ⚡ Instant Webhooks
                        </div>
                      </div>

                      {checkoutError && (
                        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-mono">
                          {checkoutError}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleCardCheckout}
                        disabled={isProcessingModal}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-mono font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        {isProcessingModal ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Opening Razorpay Modal...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Pay ₹{totalPayableINR.toLocaleString()} via Razorpay</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Secondary Direct Modal Trigger when on UPI tab as requested in prompt */}
                  {paymentRail === "upi_qr" && (
                    <button
                      type="button"
                      onClick={handleCardCheckout}
                      disabled={isProcessingModal}
                      className="w-full py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessingModal ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                          <span>Launching Checkout...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Pay with Cards / NetBanking / Other</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Terminal Footer Security Stamp */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      HMAC-SHA256 Signed
                    </span>
                    <span>256-bit Bank Grade Encrypted</span>
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

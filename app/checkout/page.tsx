"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import {
  ShieldCheck,
  Lock,
  Building2,
  Mail,
  User,
  MapPin,
  FileText,
  Copy,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Cpu,
  BadgeCheck,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { getPlans, registerAction } from "@/app/actions/register";
import {
  PlanRecord,
  fallbackPlans,
  normalizePlanId,
} from "@/lib/plans";
import { supabase } from "@/lib/supabase";

const PROTOCOL_PURPOSES = [
  "Autonomous Escrow Clearing",
  "Multi-Agent Arbitrage",
  "Milestone Task Verification",
  "Dedicated Node Infrastructure",
];

const UPI_DESIGNATED_ID = "verisett@icici";
const UPI_MERCHANT_NAME = "Verisett AI Settlement";

function generateClientAgentId(): string {
  const chars = "0123456789ABCDEF";
  let seg1 = "";
  let seg2 = "";
  for (let i = 0; i < 4; i++) {
    seg1 += chars[Math.floor(Math.random() * chars.length)];
    seg2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `VSET-AGT-${seg1}-${seg2}`;
}

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlanParam = searchParams.get("plan") || "tier_2";

  // Plan State
  const [plans, setPlans] = useState<PlanRecord[]>(Object.values(fallbackPlans));
  const [selectedPlanId, setSelectedPlanId] = useState<"community" | "tier_1" | "tier_2" | "tier_3">(
    normalizePlanId(rawPlanParam)
  );

  // Form State
  const [agentId, setAgentId] = useState<string>("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [countryState, setCountryState] = useState("India — Karnataka");
  const [gstin, setGstin] = useState("");
  const [protocolPurpose, setProtocolPurpose] = useState(PROTOCOL_PURPOSES[0]);
  const [paymentUtr, setPaymentUtr] = useState("");

  // Processing & Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    registration_id?: string;
    agent_id?: string;
    plan_id?: string;
    payment_status?: string;
  } | null>(null);

  // QR Code Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Mint Auto-Generated Agent ID once on mount
  useEffect(() => {
    setAgentId(generateClientAgentId());
  }, []);

  // Update selected plan if URL param changes
  useEffect(() => {
    if (rawPlanParam) {
      setSelectedPlanId(normalizePlanId(rawPlanParam));
    }
  }, [rawPlanParam]);

  // Load plans & check current session
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
          setEmail((prev) => prev || session.user.email || "");
          const nameMeta = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          if (nameMeta) {
            setOperatorName((prev) => prev || nameMeta);
          }
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

  const totalPaidClaimed = useMemo(() => {
    return plans
      .filter((p) => p.is_paid)
      .reduce((sum, p) => sum + (p.claimed_count || 0), 0);
  }, [plans]);

  const isTotalPaidExhausted = totalPaidClaimed >= 1500;
  const isTierFull =
    selectedPlan.is_paid &&
    selectedPlan.max_capacity !== null &&
    selectedPlan.claimed_count >= selectedPlan.max_capacity;

  // Fallback check: if tier is full, redirect back to /pricing with capacity notice
  useEffect(() => {
    if (isTierFull || (selectedPlan.is_paid && isTotalPaidExhausted)) {
      const timer = setTimeout(() => {
        router.push(`/pricing?notice=capacity_exhausted&plan=${selectedPlanId}`);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isTierFull, isTotalPaidExhausted, selectedPlan.is_paid, selectedPlanId, router]);

  // Generate Authentic UPI Payment URI & QR Code
  useEffect(() => {
    if (!agentId) return;

    if (!selectedPlan.is_paid) {
      setQrDataUrl("");
      return;
    }

    const upiUri = `upi://pay?pa=${encodeURIComponent(UPI_DESIGNATED_ID)}&pn=${encodeURIComponent(
      UPI_MERCHANT_NAME
    )}&am=${selectedPlan.price_inr}&cu=INR&tn=${encodeURIComponent(agentId)}`;

    QRCode.toDataURL(upiUri, {
      width: 360,
      margin: 1,
      color: {
        dark: "#09090b",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating UPI QR code:", err));
  }, [selectedPlan, agentId]);

  const handleCopyAgentId = () => {
    if (!agentId) return;
    navigator.clipboard.writeText(agentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_DESIGNATED_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isTierFull || (selectedPlan.is_paid && isTotalPaidExhausted)) {
      setErrorMessage("Selected plan has reached maximum capacity limits. Please select another tier.");
      return;
    }

    if (!orgName.trim() || orgName.trim().length < 2) {
      setErrorMessage("Please enter a valid Legal Entity or Developer Organization Name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage("Please provide a valid corporate work email address.");
      return;
    }

    if (selectedPlan.is_paid && paymentUtr.trim()) {
      const utrClean = paymentUtr.trim().replace(/\s+/g, "");
      if (utrClean.length < 8) {
        setErrorMessage("Please enter a valid 12-digit UPI Transaction Reference (UTR) Number.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await registerAction(null, {
        orgName: orgName.trim(),
        email: email.trim().toLowerCase(),
        agentId: agentId,
        planId: selectedPlanId,
        operatorName: operatorName.trim(),
        countryState: countryState.trim(),
        gstin: gstin.trim(),
        protocolPurpose: protocolPurpose,
        paymentUtr: paymentUtr.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || "Unable to complete registration. Please check your details.");
      } else {
        setSuccessData({
          registration_id: res.data?.registration_id,
          agent_id: res.data?.agent_id || agentId,
          plan_id: res.data?.plan_id || selectedPlanId,
          payment_status: res.data?.payment_status,
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during node provisioning.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-600 hover:text-zinc-950 transition-colors py-1 px-2.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-zinc-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pricing</span>
            </Link>
            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
            <Link href="/" className="flex items-center gap-2">
              <VerisettLogo size={22} />
              <span className="font-bold text-sm tracking-tight text-zinc-950">
                Verisett AI
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 hidden md:inline-block">
                Node Checkout
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>256-Bit Encrypted Gateway</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Two-Column Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Breadcrumb & Section Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-white text-xs font-mono font-medium text-zinc-700 shadow-2xs mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>HOSTINGER-STYLE DEDICATED PROVISIONING &amp; BILLING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Node Activation &amp; Clearinghouse Checkout
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Provision your deterministic settlement node, bind cryptographic keys, and complete instant UPI verification.
          </p>
        </div>

        {/* Capacity Warning Banner if blocked */}
        {(isTierFull || (selectedPlan.is_paid && isTotalPaidExhausted)) && (
          <div className="mb-8 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 flex items-start gap-3 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <div className="font-bold">Capacity Allocation Limit Reached</div>
              <p className="mt-0.5 text-rose-700">
                {isTotalPaidExhausted
                  ? "The global cap of 1,500 paid settlement clearinghouse seats has been completely reached."
                  : `All ${selectedPlan.max_capacity} slots for ${selectedPlan.name} are claimed.`}{" "}
                Please select another available tier or contact enterprise allocations.
              </p>
            </div>
          </div>
        )}

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Registration & Agent Provisioning (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Box 1: Auto-Generated Agent ID (Locked) */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      Step 1: Minted Agent Node Identifier
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold uppercase">
                    Auto-Provisioned
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Cryptographic Node Agent ID (Read-Only)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-zinc-500 dark:text-zinc-400 pointer-events-none flex items-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={agentId}
                      className="w-full min-h-[48px] text-base font-mono font-bold tracking-wider pl-11 pr-28 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-950 dark:text-zinc-50 select-all cursor-not-allowed focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleCopyAgentId}
                      className="absolute right-2 min-h-[36px] px-3 py-1.5 rounded-md bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-300 dark:border-zinc-600 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      title="Copy Agent ID"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed">
                    Unique hardware-attested node handle. Automatically minted to prevent tampering.
                  </p>
                </div>
              </div>

              {/* Box 2: Organization & Operator Information */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      Step 2: Organization &amp; Operator Details
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                    Hostinger Protocol Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Org Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Legal Entity / Developer Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-zinc-500 dark:text-zinc-400 pointer-events-none flex items-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. Apex Autonomous Labs Pvt Ltd"
                        className="w-full min-h-[48px] text-base pl-11 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 leading-normal"
                      />
                    </div>
                  </div>

                  {/* Corporate Work Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Corporate Work Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-zinc-500 dark:text-zinc-400 pointer-events-none flex items-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="operator@company.com"
                        className="w-full min-h-[48px] text-base pl-11 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 leading-normal"
                      />
                    </div>
                  </div>

                  {/* Operator Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Operator Full Name
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-zinc-500 dark:text-zinc-400 pointer-events-none flex items-center">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        placeholder="e.g. Manoj S.M."
                        className="w-full min-h-[48px] text-base pl-11 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 leading-normal"
                      />
                    </div>
                  </div>

                  {/* Billing Region / Country & State */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Billing Region / Country &amp; State
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-zinc-500 dark:text-zinc-400 pointer-events-none flex items-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={countryState}
                        onChange={(e) => setCountryState(e.target.value)}
                        placeholder="e.g. India — Karnataka"
                        className="w-full min-h-[48px] text-base pl-11 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 leading-normal"
                      />
                    </div>
                  </div>

                  {/* Optional GSTIN */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                      GSTIN / Tax ID <span className="text-zinc-500 dark:text-zinc-400 font-normal normal-case">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-zinc-500 dark:text-zinc-400 pointer-events-none flex items-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        placeholder="29AAAAA0000A1Z5"
                        maxLength={15}
                        className="w-full min-h-[48px] text-base pl-11 pr-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 uppercase leading-normal"
                      />
                    </div>
                  </div>

                  {/* Settlement Protocol Purpose */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Settlement Protocol Purpose
                    </label>
                    <select
                      value={protocolPurpose}
                      onChange={(e) => setProtocolPurpose(e.target.value)}
                      className="w-full min-h-[48px] text-base px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all cursor-pointer leading-normal"
                    >
                      {PROTOCOL_PURPOSES.map((purpose) => (
                        <option key={purpose} value={purpose}>
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-mono flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span className="whitespace-normal leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Desktop Notice */}
              <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic FastMCP clearinghouse registration under Verisett Protocol v1.4.</span>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Order Summary & Side-by-Side UPI Scanner (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Box 3: Plan Selector & Summary */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-7 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Order Summary
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {totalPaidClaimed} / 1,500 Paid Claimed
                </span>
              </div>

              {/* Quick Plan Switcher Pills */}
              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-semibold mb-2.5">
                  Select Clearing Tier
                </label>
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  {plans.map((p) => {
                    const active = p.id === selectedPlanId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600 text-blue-950 dark:text-blue-100 font-bold"
                            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="whitespace-normal break-words leading-snug font-semibold text-xs sm:text-sm">
                            {p.name.replace(" Node", "").replace(" Settlement", "")}
                          </span>
                          {active && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                        <div className="text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-300 font-bold mt-1.5">
                          {p.price_inr === 0 ? "₹0" : `₹${p.price_inr.toLocaleString()}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Plan Details & Pricing Breakdown */}
              <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/60 space-y-3">
                <div className="flex items-center justify-between text-sm sm:text-base">
                  <span className="font-semibold text-zinc-950 dark:text-zinc-50">{selectedPlan.name}</span>
                  <span className="font-mono font-bold text-zinc-950 dark:text-white">
                    ₹{selectedPlan.price_inr.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  <span>Capacity Allocation</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedPlan.max_capacity ? `${selectedPlan.max_capacity} Seats Pool` : "Unmetered Sandbox"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  <span>Settlement Fee</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">1.5% Programmatic Escrow</span>
                </div>

                {/* Tier 3 Special Perk Banner */}
                {selectedPlanId === "tier_3" && (
                  <div className="mt-2.5 pt-2.5 border-t border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-xs font-mono text-cyan-900 dark:text-cyan-200 bg-cyan-50 dark:bg-cyan-950/50 p-2.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="font-semibold leading-normal">
                      Digital Pass Card &amp; Verified Badge Included
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 flex items-baseline justify-between">
                  <span className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-100">Total Amount Due</span>
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-blue-600 font-sans">
                    ₹{selectedPlan.price_inr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Dynamic UPI Payment Scanner Section (Only for Paid Plans) */}
              {selectedPlan.is_paid ? (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    <span className="flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      Dynamic UPI Payment Scanner
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Instant Verification</span>
                  </div>

                  {/* QR Image Box */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col items-center justify-center text-center shadow-xs">
                    {qrDataUrl ? (
                      <div className="relative p-3 bg-white rounded-xl border border-zinc-300 shadow-sm inline-block">
                        <img
                          src={qrDataUrl}
                          alt="Verisett UPI QR Code"
                          className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 mx-auto">
                        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                      </div>
                    )}

                    {/* Designated UPI ID with Copy Button */}
                    <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-sm font-mono">
                      <span className="text-zinc-700 dark:text-zinc-300 font-semibold">UPI ID:</span>
                      <span className="font-bold text-zinc-950 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm">
                        {UPI_DESIGNATED_ID}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                            <span>Copy UPI</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-2.5 font-mono leading-normal text-center">
                      Scan using any UPI App (Google Pay, PhonePe, Paytm, CRED)
                    </p>
                  </div>

                  {/* 12-Digit UTR Transaction Input */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                      12-Digit UPI Reference Number (UTR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentUtr}
                      onChange={(e) => setPaymentUtr(e.target.value.replace(/[^0-9A-Za-z]/g, ""))}
                      placeholder="e.g. 428910284729"
                      maxLength={16}
                      className="w-full min-h-[48px] text-base px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-mono font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 leading-normal"
                    />
                    <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 mt-1.5 leading-normal">
                      Enter the 12-digit UTR shown in your banking or UPI app after payment.
                    </p>
                  </div>
                </div>
              ) : (
                /* Free Community Box */
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 text-emerald-950 text-xs sm:text-sm space-y-1 font-mono">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Free Community Sandbox ($0.00)</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-sans leading-normal">
                    No payment required. Unmetered sandbox node will be provisioned immediately.
                  </p>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="button"
                disabled={isSubmitting || isTierFull || (selectedPlan.is_paid && isTotalPaidExhausted)}
                onClick={handleSubmit}
                className="min-h-[52px] text-base font-semibold tracking-wide bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg w-full flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Minting Node &amp; Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedPlan.is_paid ? "Verify Payment & Mint Node" : "Provision Community Node"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-400 pt-1 flex-wrap">
                <span>Instant Provisioning</span>
                <span>•</span>
                <span>Sub-20ms SLA</span>
                <span>•</span>
                <span>Non-Custodial</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* SUCCESS MODAL DIALOG */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 text-zinc-900 dark:text-zinc-50 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-950 dark:text-white">
                Settlement Node Minted
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-normal">
                Your Verisett clearinghouse node has been provisioned and registered on the protocol.
              </p>
            </div>

            {/* Certificate Box */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 p-5 space-y-3 text-xs sm:text-sm font-mono">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">MINTED AGENT ID:</span>
                <span className="font-bold text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-700">
                  {successData.agent_id}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">PLAN TIER:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                  {successData.plan_id}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">PAYMENT STATUS:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  {successData.payment_status || "verified"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">ORGANIZATION:</span>
                <span className="text-zinc-950 dark:text-zinc-50 font-bold break-words text-right">
                  {orgName}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex-1 min-h-[48px] px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm text-center flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Enter Agent Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="min-h-[48px] px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-colors"
              >
                Return to Home
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

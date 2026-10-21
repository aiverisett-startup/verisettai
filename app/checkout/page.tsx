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

  const [operatorName, setOperatorName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [pincode, setPincode] = useState("560001");
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

  // Capacity check
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
        dark: "#0F172A",
        light: "#FFFFFF",
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
      const fullLocation = [city.trim(), countryState.trim(), pincode.trim()].filter(Boolean).join(", ");
      const res = await registerAction(null, {
        orgName: orgName.trim(),
        email: email.trim().toLowerCase(),
        agentId: agentId,
        planId: selectedPlanId,
        operatorName: operatorName.trim(),
        countryState: fullLocation || countryState.trim(),
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-white relative">
      {/* Soft Ambient Radial Blue Gradients behind main container for glass depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden select-none -z-10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.07)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.04)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors py-1.5 px-3 rounded-[8px] border border-[#CBD5E1] hover:border-[#94A3B8] bg-white shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pricing</span>
            </Link>
            <div className="h-4 w-px bg-[#CBD5E1] hidden sm:block" />
            <Link href="/" className="flex items-center gap-2">
              <VerisettLogo size={22} />
              <span className="text-[11px] font-mono text-[#64748B] uppercase px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] hidden md:inline-block">
                Protocol Billing
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>256-Bit Encrypted Gateway</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Breadcrumb & Section Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E2E8F0] bg-white text-xs font-mono font-semibold text-[#475569] shadow-xs mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>SECURE CLEARINGHOUSE CHECKOUT &amp; NODE PROVISIONING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-[#0F172A]">
            Protocol Billing &amp; Node Activation
          </h1>
          <p className="text-sm text-[#475569] mt-1.5 leading-[1.6]">
            Configure your organization credentials, provision your cryptographic settlement node, and activate instant clearinghouse rails.
          </p>
        </div>

        {/* Capacity Warning Banner if blocked */}
        {(isTierFull || (selectedPlan.is_paid && isTotalPaidExhausted)) && (
          <div className="mb-8 p-4 rounded-[12px] border border-rose-300 bg-rose-50 text-rose-800 flex items-start gap-3 text-xs font-mono">
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
          
          {/* LEFT COLUMN: Bespoke Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Card 1: Minted Agent ID */}
              <div className="rounded-[16px] bg-[rgba(255,255,255,0.75)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border border-[rgba(255,255,255,0.9)] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#2563EB]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                      Step 1: Cryptographic Node Identifier
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 font-semibold uppercase">
                    Auto-Minted
                  </span>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                    Node Agent Identifier (Read-Only)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={agentId}
                      className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-mono font-bold tracking-wider pl-10 pr-28 py-[11px] rounded-[10px] select-all cursor-not-allowed focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyAgentId}
                      className="absolute right-2 px-3 py-1.5 rounded-[8px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-mono font-semibold text-[#0F172A] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      title="Copy Agent ID"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[12px] font-mono text-[#64748B] mt-2 leading-relaxed">
                    Deterministic cryptographic handle assigned to your node instance.
                  </p>
                </div>
              </div>

              {/* Card 2: Bespoke Structured Form Grid */}
              <div className="rounded-[16px] bg-[rgba(255,255,255,0.75)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border border-[rgba(255,255,255,0.9)] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#2563EB]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                      Step 2: Organization &amp; Billing Coordinates
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#64748B] font-medium">
                    Level 9 Security Attestation
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Full-Width Row: Corporate Work Email */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                      Corporate Work Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="operator@company.com"
                        className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-medium pl-10 pr-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>

                  {/* 2-Column Grid: Operator Full Name & Organization Legal Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                        Operator Full Name
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={operatorName}
                          onChange={(e) => setOperatorName(e.target.value)}
                          placeholder="e.g. Manoj S.M."
                          className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-medium pl-10 pr-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                        Legal Entity / Org Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="Apex Autonomous Labs"
                          className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-medium pl-10 pr-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full-Width Row: Primary Billing Address */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                      Primary Billing Street Address
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="104 Tech Park Boulevard, Suite 500"
                        className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-medium pl-10 pr-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>

                  {/* 2-Column Grid: City & Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                        City / Municipality
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Bengaluru"
                        className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-medium px-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                        Postal / Pincode
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="560001"
                        className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-mono font-medium px-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>

                  {/* 2-Column Grid: GSTIN/Tax ID & State/Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                        GSTIN / Tax ID <span className="text-[#94A3B8] font-normal normal-case">(Optional)</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          placeholder="29AAAAA0000A1Z5"
                          maxLength={15}
                          className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-mono pl-10 pr-[14px] py-[11px] rounded-[10px] uppercase focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                        Region &amp; Country
                      </label>
                      <input
                        type="text"
                        value={countryState}
                        onChange={(e) => setCountryState(e.target.value)}
                        placeholder="India — Karnataka"
                        className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-medium px-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>

                  {/* Full-Width Row: Settlement Protocol Purpose */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                      Settlement Protocol Purpose
                    </label>
                    <select
                      value={protocolPurpose}
                      onChange={(e) => setProtocolPurpose(e.target.value)}
                      className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-medium px-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all cursor-pointer"
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
                <div className="p-4 rounded-[12px] border border-rose-300 bg-rose-50 text-rose-800 text-xs font-mono flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span className="whitespace-normal leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Protocol Footnote */}
              <div className="text-xs font-mono text-[#475569] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic FastMCP clearinghouse registration under Verisett Protocol v1.4.</span>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Order Summary & Side-by-Side UPI Scanner (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Box 3: Plan Selector & Summary */}
            <div className="rounded-[16px] bg-[rgba(255,255,255,0.75)] backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border border-[rgba(255,255,255,0.9)] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)] p-6 sm:p-7 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#2563EB]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                    Order Summary
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#475569]">
                  {totalPaidClaimed} / 1,500 Paid Claimed
                </span>
              </div>

              {/* Plan Switcher Pills */}
              <div>
                <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
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
                        className={`p-3 rounded-[12px] border text-left transition-all cursor-pointer ${
                          active
                            ? "border-[#2563EB] bg-blue-50/70 ring-1 ring-[#2563EB] text-[#1D4ED8] font-bold"
                            : "border-[#CBD5E1] hover:border-[#94A3B8] bg-white text-[#334155]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="whitespace-normal break-words leading-snug font-semibold text-xs sm:text-sm">
                            {p.name.replace(" Node", "").replace(" Settlement", "")}
                          </span>
                          {active && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                        </div>
                        <div className="text-xs sm:text-sm font-mono text-[#0F172A] font-bold mt-1.5">
                          {p.price_inr === 0 ? "₹0" : `₹${p.price_inr.toLocaleString()}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Plan Details & Pricing Breakdown */}
              <div className="p-4 sm:p-5 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] space-y-3">
                <div className="flex items-center justify-between text-sm sm:text-base">
                  <span className="font-semibold text-[#0F172A]">{selectedPlan.name}</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    ₹{selectedPlan.price_inr.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#475569]">
                  <span>Capacity Allocation</span>
                  <span className="font-semibold text-[#0F172A]">
                    {selectedPlan.max_capacity ? `${selectedPlan.max_capacity} Seats Pool` : "Unmetered Environment"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#475569]">
                  <span>Settlement Fee</span>
                  <span className="text-emerald-700 font-semibold font-mono">
                    {selectedPlanId === "community"
                      ? "2.0% Protocol Fee"
                      : selectedPlanId === "tier_1"
                      ? "1.5% Protocol Fee"
                      : selectedPlanId === "tier_2"
                      ? "1.0% Protocol Fee"
                      : "0.75% Sovereign Fee (Lowest)"}
                  </span>
                </div>

                {selectedPlanId === "tier_3" && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#E2E8F0] flex items-center gap-2 text-xs font-mono text-amber-900 bg-amber-50/80 p-2.5 rounded-[8px] border border-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold leading-normal">
                      Sovereign Lifetime Access • Pay Once, Keep Forever (Zero Recurring Fees)
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#E2E8F0] flex items-baseline justify-between">
                  <span className="text-sm sm:text-base font-bold text-[#0F172A]">Total Amount Due</span>
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2563EB] font-sans">
                    ₹{selectedPlan.price_inr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Dynamic UPI Payment Scanner Section (Only for Paid Plans) */}
              {selectedPlan.is_paid ? (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                    <span className="flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#2563EB]" />
                      Dynamic UPI Payment Scanner
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">Instant Verification</span>
                  </div>

                  {/* QR Image Box */}
                  <div className="p-5 sm:p-6 rounded-[12px] border border-[#CBD5E1] bg-white flex flex-col items-center justify-center text-center shadow-xs">
                    {qrDataUrl ? (
                      <div className="relative p-3 bg-white rounded-[10px] border border-[#E2E8F0] shadow-sm inline-block">
                        <img
                          src={qrDataUrl}
                          alt="Verisett UPI QR Code"
                          className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-[#F8FAFC] rounded-[10px] border border-dashed border-[#CBD5E1] mx-auto">
                        <Loader2 className="w-8 h-8 text-[#94A3B8] animate-spin" />
                      </div>
                    )}

                    {/* Designated UPI ID with Copy Button */}
                    <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-sm font-mono">
                      <span className="text-[#475569] font-semibold">UPI ID:</span>
                      <span className="font-bold text-[#0F172A] bg-[#F1F5F9] px-3 py-1.5 rounded-[8px] border border-[#CBD5E1] text-sm">
                        {UPI_DESIGNATED_ID}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="px-3 py-1.5 rounded-[8px] border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#64748B]" />
                            <span>Copy UPI</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#64748B] mt-2.5 font-mono leading-normal text-center">
                      Scan using Google Pay, PhonePe, Paytm, CRED or any BHIM UPI App
                    </p>
                  </div>

                  {/* 12-Digit UTR Transaction Input */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#475569] mb-[6px] uppercase tracking-wider">
                      12-Digit UPI Reference Number (UTR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentUtr}
                      onChange={(e) => setPaymentUtr(e.target.value.replace(/[^0-9A-Za-z]/g, ""))}
                      placeholder="e.g. 428910284729"
                      maxLength={16}
                      className="w-full bg-[rgba(255,255,255,0.85)] border border-[#CBD5E1] text-[#0F172A] text-[14px] font-mono font-bold px-[14px] py-[11px] rounded-[10px] focus:bg-white focus:border-[#2563EB] focus:ring-[3px] focus:ring-[#2563EB]/12 focus:outline-none transition-all placeholder:text-[#94A3B8]"
                    />
                    <p className="text-[12px] font-mono text-[#64748B] mt-1.5 leading-normal">
                      Enter the 12-digit transaction ID / UTR shown in your banking app after payment.
                    </p>
                  </div>
                </div>
              ) : (
                /* Free Community Box */
                <div className="p-4 rounded-[12px] border border-emerald-300 bg-emerald-50/80 text-emerald-950 text-xs sm:text-sm space-y-1 font-mono">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Free Community Environment ($0.00)</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-sans leading-normal">
                    No payment required. Testnet node will be provisioned immediately.
                  </p>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="button"
                disabled={isSubmitting || isTierFull || (selectedPlan.is_paid && isTotalPaidExhausted)}
                onClick={handleSubmit}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-[24px] py-[12px] rounded-[10px] font-semibold text-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_14px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs font-mono text-[#64748B] pt-1 flex-wrap">
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

      {/* SUCCESS MODAL DIALOG - Light Glassmorphism */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[16px] bg-white border border-[#E2E8F0] p-6 sm:p-8 text-[#0F172A] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] space-y-6 animate-in zoom-in-95 duration-150">
            
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <BadgeCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#0F172A]">
                Settlement Node Minted
              </h3>
              <p className="text-sm text-[#475569] leading-normal">
                Your Verisett clearinghouse node has been provisioned and registered on the protocol.
              </p>
            </div>

            {/* Certificate Box */}
            <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-3 text-xs sm:text-sm font-mono">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[#64748B] font-semibold">MINTED AGENT ID:</span>
                <span className="font-bold text-[#0F172A] bg-white px-2.5 py-1 rounded-[6px] border border-[#CBD5E1]">
                  {successData.agent_id}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[#64748B] font-semibold">PLAN TIER:</span>
                <span className="font-bold text-[#2563EB] uppercase">
                  {successData.plan_id}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[#64748B] font-semibold">PAYMENT STATUS:</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {successData.payment_status || "verified"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[#64748B] font-semibold">ORGANIZATION:</span>
                <span className="text-[#0F172A] font-bold break-words text-right">
                  {orgName}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:flex-1 py-3 px-4 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
              >
                <span>Enter Agent Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="w-full sm:w-auto py-3 px-5 rounded-[10px] border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] font-semibold text-sm transition-colors cursor-pointer"
              >
                Close
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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

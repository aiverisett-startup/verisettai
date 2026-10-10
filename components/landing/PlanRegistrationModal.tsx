"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Bot,
  Mail,
  Building,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PLANS_CONFIG, PlanTierConfig } from "@/lib/plansConfig";
import { registerPlanAction } from "@/app/actions/registerPlanAction";

export interface PlanRegistrationModalProps {
  isOpen: boolean;
  selectedPlanId: "community" | "builder" | "pro" | "enterprise";
  claimedCounts: Record<string, number>;
  onClose: () => void;
  onSuccess: (planId: string, newCount: number) => void;
}

export function PlanRegistrationModal({
  isOpen,
  selectedPlanId,
  claimedCounts,
  onClose,
  onSuccess,
}: PlanRegistrationModalProps) {
  const [activePlanId, setActivePlanId] = useState<"community" | "builder" | "pro" | "enterprise">(selectedPlanId);
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [agentHandle, setAgentHandle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Confirmation State
  const [confirmedData, setConfirmedData] = useState<{
    reservationCode: string;
    seatNumber?: number;
    planName: string;
    isPaid: boolean;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync active plan with prop if changed
  React.useEffect(() => {
    setActivePlanId(selectedPlanId);
  }, [selectedPlanId]);

  if (!isOpen) return null;

  const currentPlan: PlanTierConfig = PLANS_CONFIG[activePlanId] || PLANS_CONFIG.pro;
  const currentClaimed = claimedCounts[activePlanId] ?? currentPlan.initialClaimed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!orgName.trim()) {
      setErrorMessage("Please enter your Organization or Developer Name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid work email containing '@'.");
      return;
    }

    if (!agentHandle.trim()) {
      setErrorMessage("Please specify your Agent ID or node handle.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerPlanAction({
        orgName,
        email,
        agentHandle,
        planId: activePlanId,
        currentClaimed,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Slot reservation could not be completed.");
      } else {
        setConfirmedData({
          reservationCode: res.reservationCode || "RES-VERISETT",
          seatNumber: res.seatNumber,
          planName: currentPlan.name,
          isPaid: currentPlan.isPaid,
        });

        if (res.newClaimedCount) {
          onSuccess(activePlanId, res.newClaimedCount);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetAndClose = () => {
    setConfirmedData(null);
    setOrgName("");
    setEmail("");
    setAgentHandle("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-2xl space-y-6 font-sans relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>CAPACITY ALLOCATION INTAKE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1C1A17] tracking-tight">
              {confirmedData ? "Slot Reservation Confirmed" : "Register Node & Claim Seat"}
            </h3>
            <p className="text-xs text-[#6E675D]">
              {confirmedData
                ? "Your programmatic escrow tier has been locked and provisioned."
                : "Lock your autonomous agent swarm tier before individual capacity limits are met."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl border border-[#EAE3D2] text-[#8C8275] hover:text-[#1C1A17] hover:bg-neutral-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* VIEW 1: CONFIRMATION STATE */}
        {confirmedData ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {confirmedData.isPaid
                    ? `Seat #${confirmedData.seatNumber} Locked: ${confirmedData.planName}`
                    : `Community Sandbox Active: ${confirmedData.planName}`}
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-mono">
                {confirmedData.isPaid
                  ? "Your seat is decremented from the 1,500 total paid pool and confirmed on the Verisett settlement clearinghouse."
                  : "Your unmetered developer sandbox credentials are valid for simulated testnet clearing."}
              </p>
            </div>

            {/* Reservation Code Card */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-[#4A453E] block">
                Official Reservation Voucher
              </label>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs">
                <span className="font-bold tracking-wider">{confirmedData.reservationCode}</span>
                <button
                  type="button"
                  onClick={() => copyCode(confirmedData.reservationCode)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono tracking-wide shadow-xs transition cursor-pointer"
              >
                Return to Pricing &amp; Protocol Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: INTAKE REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Selected Plan Bar / Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-[#4A453E] block">
                Target Protocol Tier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(PLANS_CONFIG).map((p) => {
                  const isSelected = p.id === activePlanId;
                  const isCapped = p.isPaid && p.slotCap !== null && (claimedCounts[p.id] ?? p.initialClaimed) >= p.slotCap;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isCapped}
                      onClick={() => setActivePlanId(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition text-xs font-mono cursor-pointer flex flex-col justify-between ${
                        isCapped
                          ? "opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-200 text-neutral-400"
                          : isSelected
                          ? "border-blue-600 bg-blue-50/60 text-blue-900 shadow-2xs font-bold"
                          : "border-[#EAE3D2] bg-[#FAF8F5] text-[#6E675D] hover:border-slate-300"
                      }`}
                    >
                      <span className="truncate block font-bold">{p.name}</span>
                      <span className="text-[10px] block mt-1">
                        {isCapped ? "Sold Out" : p.isPaid ? `$${p.priceMonthlyUSD}/mo` : "Free"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plan Capacity Live Notice */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] flex items-center justify-between text-xs font-mono">
              <span className="text-[#6E675D]">Tier Quota Status:</span>
              {currentPlan.isPaid && currentPlan.slotCap !== null ? (
                <span className="font-bold text-blue-700">
                  {currentClaimed} / {currentPlan.slotCap} Claimed ({currentPlan.slotCap - currentClaimed} remaining)
                </span>
              ) : (
                <span className="font-bold text-emerald-700">
                  Unmetered Community Pool
                </span>
              )}
            </div>

            {/* Field 1: Organization / Developer Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-[#4A453E] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#8C8275]" />
                <span>Developer / Organization Name *</span>
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Autonomous Labs"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:outline-none text-xs sm:text-sm font-sans text-[#1C1A17]"
              />
            </div>

            {/* Field 2: Work Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-[#4A453E] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8C8275]" />
                <span>Work Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@organization.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:outline-none text-xs sm:text-sm font-mono text-[#1C1A17]"
              />
            </div>

            {/* Field 3: Agent ID / Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-[#4A453E] flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#8C8275]" />
                <span>Agent ID or Swarm Handle *</span>
              </label>
              <input
                type="text"
                required
                value={agentHandle}
                onChange={(e) => setAgentHandle(e.target.value)}
                placeholder="e.g. AGT-BUILDER-NODE-01"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] focus:border-blue-500 focus:outline-none text-xs sm:text-sm font-mono text-[#1C1A17]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6E675D] hover:text-[#1C1A17] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono tracking-wide shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Reserving Slot...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Lock Tier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

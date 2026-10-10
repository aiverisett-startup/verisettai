"use client";

import React, { useActionState, useEffect, useState, useTransition } from "react";
import { X, CheckCircle2, AlertCircle, Copy, Check, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { registerAction, RegisterActionState } from "@/app/actions/register";
import { PlanRecord } from "@/lib/plans";

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId: "community" | "tier_1" | "tier_2" | "tier_3";
  plans: PlanRecord[];
  onSuccess?: (state: RegisterActionState) => void;
}

const initialState: RegisterActionState = {
  success: false,
};

export function RegisterModal({
  isOpen,
  onClose,
  selectedPlanId,
  plans,
  onSuccess,
}: RegisterModalProps) {
  const [activePlanId, setActivePlanId] = useState<"community" | "tier_1" | "tier_2" | "tier_3">(
    selectedPlanId
  );
  const [copied, setCopied] = useState(false);

  // Sync active plan with selectedPlanId prop
  useEffect(() => {
    setActivePlanId(selectedPlanId);
  }, [selectedPlanId]);

  // Use React 19 useActionState for form submission
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  // Fire callback on success
  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess(state);
    }
  }, [state, onSuccess]);

  if (!isOpen) return null;

  const currentPlan = plans.find((p) => p.id === activePlanId) || plans[0];
  const isPaid = currentPlan?.is_paid ?? false;
  const totalPaid = plans.filter((p) => p.is_paid).reduce((acc, p) => acc + p.claimed_count, 0);
  const isTotalExhausted = totalPaid >= 1500;
  const isTierFull = isPaid && currentPlan?.max_capacity !== null && currentPlan.claimed_count >= (currentPlan.max_capacity ?? 0);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-zinc-900 p-6 sm:p-8 text-zinc-900 dark:text-zinc-50 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono uppercase text-zinc-800 dark:text-zinc-200 font-semibold">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Verisett Node Registration</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mt-2">
              {state.success ? "Seat Reserved" : "Claim Allocation Slot"}
            </h2>
            <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 mt-1 leading-normal">
              Strict capacity limits enforced via PostgreSQL atomic locks.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-400 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: Success State */}
        {state.success ? (
          <div className="py-6 space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 space-y-2">
              <div className="flex items-center gap-2 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Slot Claimed Successfully</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-mono leading-relaxed">
                {state.data?.is_paid
                  ? `Allocated seat #${state.data.claimed_count} of ${state.data.max_capacity} for ${currentPlan?.name}. Total paid member quota: ${state.data.total_paid} / 1,500.`
                  : `Community Fleet developer sandbox node provisioned without metering.`}
              </p>
            </div>

            {/* Reservation ID */}
            {state.data?.registration_id && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block">
                  Reservation Voucher ID
                </label>
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-sm text-zinc-950 dark:text-zinc-50">
                  <span className="font-bold select-all">{state.data.registration_id}</span>
                  <button
                    type="button"
                    onClick={() => copyCode(state.data?.registration_id || "")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-100 transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[48px] py-3 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-sm font-semibold tracking-wide transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* View 2: Registration Form */
          <form action={formAction} className="py-4 space-y-4">
            {/* Error Message */}
            {state.error && (
              <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-mono flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-relaxed">
                  <span className="font-bold">
                    {state.code === "TOTAL_EXHAUSTED"
                      ? "1,500 Total Pool Exhausted"
                      : state.code === "TIER_FULL"
                      ? "Individual Tier Cap Reached"
                      : "Registration Notice"}
                    :
                  </span>{" "}
                  <span>{state.error}</span>
                </div>
              </div>
            )}

            {/* Plan Selector Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 block">
                  Select Target Tier
                </label>
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Total Paid: {totalPaid} / 1,500
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {plans.map((p) => {
                  const isSelected = p.id === activePlanId;
                  const isPlanFull = p.is_paid && p.max_capacity !== null && p.claimed_count >= p.max_capacity;
                  const isBlocked = p.is_paid && (isTotalExhausted || isPlanFull);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => setActivePlanId(p.id)}
                      className={`p-3 rounded-xl border text-left transition font-mono min-h-[68px] flex flex-col justify-between cursor-pointer ${
                        isBlocked
                          ? "bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed opacity-60"
                          : isSelected
                          ? "bg-white dark:bg-zinc-800 border-blue-600 text-blue-950 dark:text-blue-100 ring-2 ring-blue-600 shadow-sm font-bold"
                          : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <span className="whitespace-normal break-words leading-tight font-semibold text-xs block">
                        {p.name.replace(" Node", "").replace(" Settlement", "")}
                      </span>
                      <span className="text-xs font-bold mt-1.5 block">
                        {isBlocked
                          ? isTotalExhausted
                            ? "Closed"
                            : "Cap Reached"
                          : p.is_paid
                          ? `₹${p.price_inr.toLocaleString()}`
                          : "Free"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Hidden input to pass planId into formAction */}
              <input type="hidden" name="planId" value={activePlanId} />
            </div>

            {/* Plan Status Pill */}
            <div className="p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-between text-xs sm:text-sm font-mono flex-wrap gap-1">
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Quota Tracking:</span>
              {isPaid && currentPlan?.max_capacity !== null ? (
                <span className="font-bold text-zinc-950 dark:text-white">
                  {currentPlan.claimed_count} / {currentPlan.max_capacity} claimed (
                  {Math.max(0, currentPlan.max_capacity - currentPlan.claimed_count)} slots remaining)
                </span>
              ) : (
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Free / Unmetered</span>
              )}
            </div>

            {/* Field: Organization Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                Developer / Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="orgName"
                required
                placeholder="e.g. Acme Research Labs"
                className="w-full min-h-[48px] text-base px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 leading-normal"
              />
            </div>

            {/* Field: Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                Work Email Address (@) <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="dev@organization.com"
                className="w-full min-h-[48px] text-base px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 leading-normal"
              />
            </div>

            {/* Field: Agent ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-1.5">
                Agent ID / Node Handle <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="agentId"
                required
                placeholder="e.g. VSET-AGT-9E4B-88F2"
                className="w-full min-h-[48px] text-base px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-mono font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all placeholder:text-zinc-400 uppercase leading-normal"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 flex-wrap">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-sm font-semibold text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || (isPaid && (isTotalExhausted || isTierFull))}
                className="min-h-[48px] inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold tracking-wide transition shadow-md cursor-pointer"
              >
                {isPending ? (
                  <span>Reserving Slot...</span>
                ) : (
                  <>
                    <span>Confirm Reservation</span>
                    <ArrowRight className="w-4 h-4" />
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

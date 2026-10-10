"use client";

import React, { useActionState, useEffect, useState, useTransition } from "react";
import { X, CheckCircle2, AlertCircle, Copy, Check, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { registerAction, RegisterActionState, PlanRecord } from "@/app/actions/register";

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
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-6 sm:p-8 text-zinc-900 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-300 bg-white text-[11px] font-mono uppercase text-zinc-700 font-medium">
              <Cpu className="w-3 h-3 text-zinc-600" />
              <span>Verisett Node Registration</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 mt-1.5">
              {state.success ? "Seat Reserved" : "Claim Allocation Slot"}
            </h2>
            <p className="text-xs font-mono text-zinc-500 mt-0.5">
              Strict capacity limits enforced via PostgreSQL atomic locks.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View 1: Success State */}
        {state.success ? (
          <div className="py-6 space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Slot Claimed Successfully</span>
              </div>
              <p className="text-xs text-emerald-800 font-mono leading-relaxed">
                {state.data?.is_paid
                  ? `Allocated seat #${state.data.claimed_count} of ${state.data.max_capacity} for ${currentPlan?.name}. Total paid member quota: ${state.data.total_paid} / 1,500.`
                  : `Community Fleet developer sandbox node provisioned without metering.`}
              </p>
            </div>

            {/* Reservation ID */}
            {state.data?.registration_id && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                  Reservation Voucher ID
                </label>
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-300 bg-white font-mono text-xs text-zinc-900">
                  <span className="font-semibold select-all">{state.data.registration_id}</span>
                  <button
                    type="button"
                    onClick={() => copyCode(state.data?.registration_id || "")}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[11px] font-mono text-zinc-700 transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
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
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-900 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono font-bold tracking-wide transition cursor-pointer"
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
              <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 font-semibold block">
                  Select Target Tier
                </label>
                <span className="text-[10px] font-mono text-zinc-500">
                  Total Paid: {totalPaid} / 1,500
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      className={`p-2.5 rounded-xl border text-left transition font-mono text-xs flex flex-col justify-between cursor-pointer ${
                        isBlocked
                          ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-60"
                          : isSelected
                          ? "bg-white border-zinc-900 text-zinc-900 ring-1 ring-zinc-900 shadow-2xs font-bold"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <span className="truncate block font-semibold text-[11px]">{p.name}</span>
                      <span className="text-[10px] mt-1 block">
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
            <div className="p-2.5 rounded-lg border border-zinc-200 bg-white flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Quota Tracking:</span>
              {isPaid && currentPlan?.max_capacity !== null ? (
                <span className="font-semibold text-zinc-900">
                  {currentPlan.claimed_count} / {currentPlan.max_capacity} claimed (
                  {Math.max(0, currentPlan.max_capacity - currentPlan.claimed_count)} slots remaining)
                </span>
              ) : (
                <span className="font-semibold text-emerald-700">Free / Unmetered</span>
              )}
            </div>

            {/* Field: Organization Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 font-semibold block">
                Developer / Organization Name *
              </label>
              <input
                type="text"
                name="orgName"
                required
                placeholder="e.g. Acme Research Labs"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs font-sans text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            {/* Field: Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 font-semibold block">
                Work Email Address (@) *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="dev@organization.com"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            {/* Field: Agent ID */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 font-semibold block">
                Agent ID / Node Handle *
              </label>
              <input
                type="text"
                name="agentId"
                required
                placeholder="e.g. AGT-BUILDER-01"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-mono text-zinc-600 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || (isPaid && (isTotalExhausted || isTierFull))}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg border border-zinc-900 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:border-zinc-300 disabled:cursor-not-allowed text-white text-xs font-mono font-bold tracking-wide transition cursor-pointer"
              >
                {isPending ? (
                  <span>Reserving Slot...</span>
                ) : (
                  <>
                    <span>Confirm Reservation</span>
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

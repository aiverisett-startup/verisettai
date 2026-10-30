"use client";

import React, { useState } from "react";
import { CreditCard, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { openRazorpayCheckout, CheckoutVerificationResult } from "@/lib/razorpayClient";

export interface RazorpayCheckoutButtonProps {
  amount: number; // in paise (e.g. 250000)
  planId: string;
  planName: string;
  operatorName?: string;
  email?: string;
  orgName?: string;
  agentId?: string;
  disabled?: boolean;
  onSuccess: (result: CheckoutVerificationResult) => void;
  onFailure?: (error: { description: string; code?: string }) => void;
  onDismiss?: () => void;
  className?: string;
  buttonText?: string;
}

export function RazorpayCheckoutButton({
  amount,
  planId,
  planName,
  operatorName,
  email,
  orgName,
  agentId,
  disabled = false,
  onSuccess,
  onFailure,
  onDismiss,
  className = "",
  buttonText,
}: RazorpayCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      await openRazorpayCheckout({
        amount,
        name: "Verisett AI",
        description: `${planName} - Settlement Node Provisioning`,
        prefill: {
          name: operatorName || orgName || "",
          email: email || "",
        },
        notes: {
          plan_id: planId,
          plan_name: planName,
          agent_id: agentId || "",
          organization: orgName || "",
        },
        onSuccess: (res) => {
          setIsLoading(false);
          setStatusMessage("Payment verified! Provisioning node...");
          onSuccess(res);
        },
        onFailure: (err) => {
          setIsLoading(false);
          setStatusMessage(err.description);
          onFailure?.(err);
        },
        onDismiss: () => {
          setIsLoading(false);
          setStatusMessage("Checkout window closed.");
          onDismiss?.();
        },
      });
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || "Failed to initiate payment.";
      setStatusMessage(msg);
      onFailure?.({ description: msg });
    }
  };

  const defaultClasses =
    "w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3.5 rounded-[12px] font-semibold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_14px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  return (
    <div className="space-y-2 w-full">
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={className || defaultClasses}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Connecting to Razorpay...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>
              {buttonText || `Pay ₹${(amount / 100).toLocaleString()} via Razorpay`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {statusMessage && (
        <p className="text-xs font-mono text-center text-[#475569] animate-in fade-in">
          {statusMessage}
        </p>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#64748B]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Cards • UPI • NetBanking • Wallets • 256-bit SSL</span>
      </div>
    </div>
  );
}

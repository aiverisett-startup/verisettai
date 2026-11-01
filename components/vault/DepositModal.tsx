"use client";

import React, { useState } from "react";
import {
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: { newBalancePaise: number; balanceInr: string }) => void;
}

const PRESET_AMOUNTS = [
  { label: "₹500", inr: 500 },
  { label: "₹1,000", inr: 1000 },
  { label: "₹2,500", inr: 2500, popular: true },
  { label: "₹5,000", inr: 5000 },
  { label: "₹10,000", inr: 10000 },
];

export function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [selectedInr, setSelectedInr] = useState<number>(2500);
  const [customInr, setCustomInr] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successBalance, setSuccessBalance] = useState<string>("");

  if (!isOpen) return null;

  const activeAmountInr = customInr ? parseFloat(customInr) : selectedInr;
  const usdEquivalent = !isNaN(activeAmountInr) && activeAmountInr > 0
    ? (activeAmountInr / 84.0).toFixed(2)
    : "0.00";

  const handleSelectPreset = (inr: number) => {
    setSelectedInr(inr);
    setCustomInr("");
    setErrorMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomInr(val);
    setErrorMessage(null);
  };

  const handleInitiateDeposit = async () => {
    if (isNaN(activeAmountInr) || activeAmountInr < 100) {
      setErrorMessage("Minimum deposit amount is ₹100.00");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // 1. Create order on backend
      const orderRes = await fetch("/api/vault/deposit/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr: activeAmountInr }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initiate deposit order");
      }

      // 2. Ensure Razorpay checkout script is loaded
      if (typeof window !== "undefined" && !(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay payment SDK"));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: orderData.key,
        amount: orderData.amountPaise,
        currency: orderData.currency || "INR",
        name: "Verisett AI",
        description: `Escrow Vault Deposit (₹${activeAmountInr.toLocaleString("en-IN")})`,
        order_id: orderData.orderId,
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 3. Verify HMAC signature on backend & atomically credit balance
            const verifyRes = await fetch("/api/vault/deposit/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // Confetti celebration
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#2563EB", "#06B6D4", "#10B981", "#6366F1"],
              });
            } catch {}

            setIsSuccess(true);
            setSuccessBalance(verifyData.balanceInr || activeAmountInr.toFixed(2));

            // Broadcast balance update event so Navbar & UI refresh instantly
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("verisett_vault_updated", {
                  detail: verifyData,
                })
              );
            }

            onSuccess?.(verifyData);

            setTimeout(() => {
              setIsSuccess(false);
              onClose();
            }, 2200);
          } catch (err: any) {
            setErrorMessage(err?.message || "Failed to credit vault balance");
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error("[DEPOSIT_MODAL_ERROR]:", err);
      setErrorMessage(err?.message || "Payment initialization failed");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-900">
        
        {/* Subtle top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">Fund Escrow Vault</h3>
              <p className="text-xs text-slate-500">Live Razorpay Payment Rails (UPI, Cards, NetBanking)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Vault Credited Successfully</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your settlement balance has been updated with real-time PostgreSQL synchronization.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-mono text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-blue-500" />
              New Balance: ₹{successBalance}
            </div>
          </div>
        ) : (
          <div className="py-5 space-y-5">
            {/* Amount Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Select Deposit Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((preset) => {
                  const isSelected = !customInr && selectedInr === preset.inr;
                  return (
                    <button
                      key={preset.inr}
                      type="button"
                      onClick={() => handleSelectPreset(preset.inr)}
                      className={`relative px-3 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      {preset.label}
                      {preset.popular && (
                        <span className="absolute -top-2 -right-1 text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-sans font-bold shadow-xs">
                          HOT
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-600 uppercase tracking-wider">
                  Or Custom Amount (INR)
                </label>
                <span className="text-slate-400 font-mono text-[11px]">
                  ≈ ${usdEquivalent} USD
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold text-sm">
                  ₹
                </span>
                <input
                  type="text"
                  value={customInr}
                  onChange={handleCustomChange}
                  placeholder={`e.g. ${selectedInr}`}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Security Guarantee Strip */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Non-Custodial Escrow</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Instant Settlement</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleInitiateDeposit}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Secure Razorpay Rails...</span>
                </>
              ) : (
                <>
                  <span>Deposit ₹{Number(activeAmountInr || 0).toLocaleString("en-IN")} to Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


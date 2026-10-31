"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, ArrowRight, Zap, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { VerisettLogo } from "@/components/VerisettLogo";

function BillingSuccessInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId") || "ORD_CONFIRMED";
  const paymentId = searchParams.get("payment_id") || searchParams.get("paymentId") || "";
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Non-fatal
    }
  }, []);

  const handleCopyOrderId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <VerisettLogo className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              Verisett <span className="text-blue-600">AI</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Payment Verified &amp; Active
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="max-w-xl mx-auto px-4 py-12 w-full">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
          
          {/* Animated Success Badge */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border-2 border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Payment Confirmed!
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Your subscription has been successfully authorized and provisioned. Your node capacity and execution quotas are now fully active.
            </p>
          </div>

          {/* Transaction Metadata Receipt */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-left space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>Order Reference:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{orderId}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {paymentId && (
              <div className="flex justify-between items-center text-slate-600">
                <span>Payment ID:</span>
                <span className="font-mono text-slate-800">{paymentId}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600">
              <span>Settlement Rail:</span>
              <span className="font-medium text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Razorpay Verified Live
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Provisioning Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-xs">
                Active &amp; Allocated
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Go to Operator Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/billing"
              className="py-4 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              Manage Billing
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>256-bit cryptographically secured execution node</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Verisett AI — Autonomous M2M Clearinghouse Protocol.
      </footer>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <BillingSuccessInner />
    </Suspense>
  );
}

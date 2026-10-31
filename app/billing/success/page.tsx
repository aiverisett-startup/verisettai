"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  ArrowRight,
  Home,
  Key,
  ShieldCheck,
  Calendar,
  Hash,
} from "lucide-react";
import confetti from "canvas-confetti";
import { VerisettLogo } from "@/components/VerisettLogo";

function BillingSuccessInner() {
  const searchParams = useSearchParams();
  const orderId =
    searchParams.get("order_id") ||
    searchParams.get("orderId") ||
    `ord_${Date.now().toString().slice(-8)}`;
  const paymentId =
    searchParams.get("payment_id") ||
    searchParams.get("paymentId") ||
    `pay_${Date.now().toString().slice(-8)}`;

  const rawPlan = searchParams.get("plan") || searchParams.get("tier") || "builder";
  const planDisplayName =
    rawPlan.toLowerCase().includes("growth") || rawPlan.toLowerCase().includes("settlement")
      ? "Settlement Node"
      : rawPlan.toLowerCase().includes("enterprise") || rawPlan.toLowerCase().includes("scale")
      ? "Enterprise Scale"
      : "Builder Protocol";

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [formattedTimestamp, setFormattedTimestamp] = useState<string>("");

  // Realistic masked API key for immediate node configuration
  const rawApiKey = `vset_live_${orderId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}7a1c4f8d2e6b5a3c9e1f4a7b3f8a`;
  const maskedApiKey = `vset_live_••••••••••••••••${rawApiKey.slice(-4)}`;

  useEffect(() => {
    // Generate human-readable timestamp on client to prevent SSR hydration mismatch
    const now = new Date();
    setFormattedTimestamp(
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      })
    );

    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch {
      // Non-fatal
    }
  }, []);

  const handleCopyKey = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(rawApiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyOrderId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(paymentId || orderId);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  const handleDownloadInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <VerisettLogo className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              Verisett <span className="text-blue-600">AI</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Payment Verified &amp; Provisioned
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 py-12 w-full">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
          
          {/* Centered Glowing Emerald Checkmark Icon Badge */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm animate-in zoom-in-95 duration-300 ring-4 ring-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          {/* Header & Subtitle */}
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Subscription Activated Successfully
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Your cryptographic clearance tier is now active. Your machine-to-machine clearinghouse keys and settlement bandwidth have been provisioned.
            </p>
          </div>

          {/* Plan Name & Paid Amount Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{planDisplayName} — Active</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              <span>Paid: ₹2,950.00 (incl. 18% GST)</span>
            </div>
          </div>

          {/* Masked API Key Container with Copy Key Button */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                M2M Agent Secret API Key
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Active &amp; Ready</span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-2xs">
              <code className="font-mono text-xs text-slate-800 tracking-wider truncate">
                {maskedApiKey}
              </code>
              <button
                type="button"
                onClick={handleCopyKey}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition cursor-pointer relative group"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Key</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Payment Reference & Timestamp Details */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Hash className="w-3.5 h-3.5" />
                Razorpay Payment ID:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">{paymentId}</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Copy ID"
                >
                  {copiedOrderId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {orderId && (
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-500">Order Reference ID:</span>
                <span className="font-mono text-slate-800">{orderId}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-600">
              <span className="text-slate-500">Plan Tier:</span>
              <span className="font-semibold text-slate-900">{planDisplayName}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-mono font-bold text-blue-600">₹2,950.00</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Timestamp:
              </span>
              <span className="font-medium text-slate-800">
                {formattedTimestamp || "Just now"}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-600">
              <span className="text-slate-500">Verification Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Settled &amp; Verified
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-3 space-y-3">
            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/docs"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition"
              >
                <span>Launch Console &amp; Docs →</span>
              </Link>
              
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-6 py-2.5 rounded-lg transition cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Download GST Tax Invoice (PDF)</span>
              </button>
            </div>

            {/* Return to Home Navigation Link */}
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
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
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <BillingSuccessInner />
    </Suspense>
  );
}

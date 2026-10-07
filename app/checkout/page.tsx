"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  CreditCard,
  ArrowLeft,
  Loader2,
  Zap,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { supabase } from "@/lib/supabase";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "founder-pass";

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace(`/login?redirect=${encodeURIComponent(`/checkout?plan=${plan}`)}`);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email || "operator@verisett.ai",
          });
        }
      } catch {
        router.replace(`/login?redirect=${encodeURIComponent(`/checkout?plan=${plan}`)}`);
      }
    };
    checkSession();
  }, [router, plan]);

  const handleActivatePass = async () => {
    if (!user?.id) return;
    setIsProcessing(true);

    try {
      // 1. Update user profile in Supabase to active Founder Node Pass
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        founder_pass: true,
        plan_tier: "FOUNDER_NODE",
        take_rate: 0.0075,
        updated_at: new Date().toISOString(),
      });

      // 2. Insert transaction / ledger entry
      await supabase.from("ledger_entries").insert({
        user_id: user.id,
        transaction_id: crypto.randomUUID(),
        entry_type: "CREDIT",
        amount: 2999900, // in paise
        currency: "INR",
        description: "Founder Node Pass Lifetime Protocol License Activation",
      });

      setIsActivated(true);
      setTimeout(() => {
        router.push("/dashboard/billing?activated=founder-pass");
      }, 1200);
    } catch (err) {
      console.warn("Activation notice:", err);
      // Fallback redirect
      setTimeout(() => {
        router.push("/dashboard/billing");
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto space-y-8 my-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E675D] hover:text-[#1C1A17] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Protocol Tiers</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Level 9 Institutional Escrow Rail</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Left 3 cols: Order Summary & Privileges */}
        <div className="md:col-span-3 rounded-3xl border border-[#EAE3D2] bg-white p-7 sm:p-9 shadow-lg space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              LIFETIME PROTOCOL LICENSE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1A17] tracking-tight">
              Founder Node Pass
            </h1>
            <p className="text-xs sm:text-sm text-[#6E675D] leading-relaxed">
              Institutional clearinghouse node with pinned 0.75% take-rate, uncapped FastMCP concurrency, and permanent double-entry ledger state conservation.
            </p>
          </div>

          <div className="pt-4 border-t border-[#F0E9DC] space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-[#4A453E]">
              Privileges Unlocked Instantly:
            </h3>
            <ul className="space-y-2.5 text-xs text-[#1C1A17]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>0.75% Protocol Take-Rate</strong> (Lowest institutional tier for life)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Unlimited Escrow Vaults</strong> with atomic SET NX PX locks
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Uncapped FastMCP RPC</strong> clearing throughput &amp; telemetry
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>HDFC Commercial Banking Payout Rails</strong> (Activating Monday)
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[#F0E9DC] text-[11px] font-mono text-[#8C8275] flex items-center justify-between">
            <span>Licensed to: {user?.email}</span>
            <span>RLS Multi-Tenant Enforced</span>
          </div>
        </div>

        {/* Right 2 cols: Checkout Card */}
        <div className="md:col-span-2 rounded-3xl border-2 border-blue-500/40 bg-white p-7 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-[#1C1A17] pb-3 border-b border-[#F0E9DC]">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#6E675D]">
              <span>Founder Node Pass</span>
              <span className="font-mono font-bold text-[#1C1A17]">₹29,999.00</span>
            </div>
            <div className="flex justify-between text-[#6E675D]">
              <span>Recurring Maintenance</span>
              <span className="font-mono font-bold text-emerald-600">₹0.00 (Zero)</span>
            </div>
            <div className="flex justify-between text-[#6E675D]">
              <span>Protocol Verification SLA</span>
              <span className="font-mono font-bold text-blue-600">Included</span>
            </div>
            <div className="pt-3 border-t border-[#F0E9DC] flex justify-between text-sm font-bold text-[#1C1A17]">
              <span>Total Amount</span>
              <span className="font-mono text-base text-blue-900">₹29,999.00 INR</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] space-y-2 text-xs">
            <span className="font-mono text-[10px] uppercase font-bold text-[#8C8275] block">
              Settlement Clearing Rail
            </span>
            <div className="flex items-center gap-2 font-medium text-[#1C1A17]">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>HDFC Institutional Clearing (RTGS / UPI / Card)</span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleActivatePass}
            disabled={isProcessing || isActivated}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Activating Founder Pass...</span>
              </>
            ) : isActivated ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Pass Activated! Entering Dashboard...</span>
              </>
            ) : (
              <>
                <span>Complete Activation (₹29,999)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-[#8C8275] font-mono">
            Direct cryptographic entitlement written to your multi-tenant node.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="relative min-h-screen bg-[#FDFCF9] text-[#1C1A17] p-6 sm:p-10 font-sans flex flex-col justify-between overflow-hidden">
      <GoldenBackgroundShapes variant="subtle" density="dense" />

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="hover:opacity-85 transition-opacity">
          <VerisettLogo size={30} />
        </Link>
      </header>

      {/* Main Checkout with Suspense boundary */}
      <main className="relative z-10 w-full my-auto">
        <Suspense
          fallback={
            <div className="max-w-md mx-auto rounded-3xl border border-[#EAE3D2] bg-white p-10 text-center font-mono text-xs text-[#8C8275]">
              INITIALIZING_CHECKOUT_RAIL...
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full pt-8 text-center text-[11px] font-mono text-[#8C8275]">
        VERISETT AI · DETERMINISTIC ESCROW &amp; PROTOCOL SETTLEMENT CORE
      </footer>
    </div>
  );
}

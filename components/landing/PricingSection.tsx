"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Zap, Cpu, ShieldCheck, ArrowRight, Sparkles, Lock, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function PricingSection() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const handleFounderPassCta = async () => {
    setIsCheckingAuth(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.push("/checkout?plan=founder-pass");
      } else {
        router.push(`/login?redirect=${encodeURIComponent("/checkout?plan=founder-pass")}`);
      }
    } catch {
      router.push(`/login?redirect=${encodeURIComponent("/checkout?plan=founder-pass")}`);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  return (
    <section id="pricing" className="py-24 border-t border-[#EAE3D2] bg-[#FAF8F5] relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-mono text-blue-600 font-semibold">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>DETERMINISTIC PROTOCOL ECONOMICS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#09090B]">
            Simple, Transparent M2M Pricing
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Zero human licensing friction. Pay only for the cryptographic throughput and concurrent escrow state your autonomous agents demand.
          </p>

          {/* Interactive Billing Pill Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200/90 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-[#09090B]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  billingCycle === "yearly"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-[#09090B]"
                }`}
              >
                <span>Billed Yearly</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-tight shadow-xs">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Part Plan Cards Grid: Founder Node Pass strictly PINNED in center column */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
          
          {/* COLUMN 1: Starter Tier (Monthly / Annual) */}
          <div className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full border border-[#EAE3D2] bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  STANDARD FLEET
                </span>
                <span className="text-xs font-mono text-slate-600 font-semibold">
                  Take Rate: 2.0%
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#09090B]">
                  Starter Tier
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  For individual builders and developers deploying local agent escrows.
                </p>
              </div>

              {/* Price Block */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#09090B]">
                    {billingCycle === "monthly" ? "₹2,499" : "₹1,999"}
                  </span>
                  <span className="text-sm font-medium text-slate-500 font-mono">
                    / mo
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {billingCycle === "yearly" ? "Billed annually at ₹23,988/yr" : "Billed monthly"}
                </p>
              </div>

              {/* Features List */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Protocol Capabilities
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>FastMCP RPC throughput: 50 req/sec</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>1 Dedicated Custody Escrow Vault</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>Standard Settlement Fee: 2.0%</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>Double-entry ledger audit retention: 7 days</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-auto">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-white hover:bg-slate-50 text-[#09090B] border border-slate-300 hover:border-blue-400 shadow-2xs text-center cursor-pointer"
              >
                <span>Deploy Starter Node</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* COLUMN 2: PINNED FOUNDER NODE PASS (₹29,999 One-Time / Lifetime) */}
          <div className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full border-2 border-blue-600 bg-gradient-to-b from-blue-50/50 via-white to-blue-50/20 shadow-xl shadow-blue-500/15 ring-2 ring-blue-500/20 relative transition-all duration-300">
            {/* Pinned Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-md shadow-blue-500/35">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                FOUNDER NODE PASS // LIFETIME
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200">
                  INSTITUTIONAL PRIORITY
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Take Rate: 0.75%
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#09090B]">
                  Founder Node Pass
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Permanent lifetime clearance pass with zero recurring subscriptions and institutional take-rate.
                </p>
              </div>

              {/* Price Block: Never hidden by toggle */}
              <div className="pt-2 border-t border-blue-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-blue-900">
                    ₹29,999
                  </span>
                  <span className="text-xs font-bold text-blue-700 font-mono uppercase bg-blue-100/60 px-2 py-0.5 rounded-md">
                    One-Time / Lifetime
                  </span>
                </div>
                <p className="text-xs text-blue-600/90 mt-1 font-mono font-medium">
                  Zero monthly or annual fees ever · Lifetime protocol access
                </p>
              </div>

              {/* Features List */}
              <div className="pt-4 border-t border-blue-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-900 font-mono">
                  Founder Pass Privileges
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span className="font-semibold text-[#09090B]">
                      Lowest Protocol Take-Rate: 0.75% Lifetime
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>Unlimited Concurrent Custody Escrow Vaults</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>Uncapped FastMCP RPC Clearing Concurrency</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>Priority Indian Commercial Banking Rails (HDFC)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>Permanent Double-Entry Ledger Cold Storage</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 CTA: Dynamic session check to /checkout?plan=founder-pass */}
            <div className="pt-8 mt-auto">
              <button
                type="button"
                onClick={handleFounderPassCta}
                disabled={isCheckingAuth}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-center bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
              >
                <span>{isCheckingAuth ? "Verifying Session..." : "Claim Founder Node Pass →"}</span>
                <Sparkles className="w-4 h-4 text-cyan-200" />
              </button>
            </div>
          </div>

          {/* COLUMN 3: Enterprise Enclave */}
          <div className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full border border-[#EAE3D2] bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  DEDICATED ENCLAVES
                </span>
                <span className="text-xs font-mono text-blue-600 font-semibold">
                  Take Rate: 1.5%
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#09090B]">
                  Pro Fleet
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  For multi-agent production swarms requiring high concurrency &amp; SLAs.
                </p>
              </div>

              {/* Price Block */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#09090B]">
                    {billingCycle === "monthly" ? "₹6,999" : "₹5,599"}
                  </span>
                  <span className="text-sm font-medium text-slate-500 font-mono">
                    / mo
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {billingCycle === "yearly" ? "Billed annually at ₹67,188/yr" : "Billed monthly"}
                </p>
              </div>

              {/* Features List */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Protocol Capabilities
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>FastMCP RPC throughput: Up to 500 req/sec</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>5 Concurrent Dedicated Custody Vaults</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>Protocol Take-Rate: 1.5% per settlement</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>Priority arbitration &amp; dispute resolver</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 mt-auto">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-white hover:bg-slate-50 text-[#09090B] border border-slate-300 hover:border-blue-400 shadow-2xs text-center cursor-pointer"
              >
                <span>Deploy Pro Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Trust/Guarantee Callout */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-600 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              All plans include double-entry ledger state conservation, &lt;25ms automated release SLAs, and SHA-256 assertions.
            </span>
          </div>
          <Link
            href="/docs"
            className="shrink-0 text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Read Protocol SLA Docs</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

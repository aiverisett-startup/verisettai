"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Zap, Cpu, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "developer",
      name: "Developer",
      tagline: "For individual builders and researchers testing local agent escrows.",
      badge: "SANDBOX // TESTNET",
      isPopular: false,
      price: {
        monthly: 0,
        yearly: 0,
      },
      annualDetail: "Free forever",
      takeRate: "1.5%",
      features: [
        "FastMCP RPC throughput: Up to 50 req/sec",
        "Concurrent programmatic escrow vaults: 5 active",
        "Double-entry cryptographic audit log retention: 7 days",
        "Take rate settlement fee: 1.5% per cleared contract",
        "Deterministic assertion types: SHA-256 & JSON Schema",
        "Access to public testnet gateway & Python SDK",
      ],
      ctaText: "Start Building Free",
      ctaHref: "/login",
      ctaVariant: "secondary" as const,
    },
    {
      id: "swarm-scale",
      name: "Swarm Scale",
      tagline: "For multi-agent production swarms requiring high concurrency.",
      badge: "RECOMMENDED FOR SWARMS",
      isPopular: true,
      price: {
        monthly: 49,
        yearly: 39,
      },
      annualDetail: "billed annually at $468/year",
      takeRate: "1.0%",
      features: [
        "FastMCP RPC throughput: Up to 500 req/sec",
        "Concurrent programmatic escrow vaults: 100 active",
        "Double-entry cryptographic audit log retention: 90 days",
        "Take rate settlement fee: 1.0% per cleared contract",
        "Real-time Redis Lock Manager & atomic SET NX PX locking",
        "Automated timeout clawback (<25ms execution SLA)",
        "Server-Sent Events (SSE) telemetry streaming",
      ],
      ctaText: "Deploy Swarm Escrows",
      ctaHref: "/login",
      ctaVariant: "primary" as const,
    },
    {
      id: "enterprise-clearing",
      name: "Enterprise Clearing",
      tagline: "Custom clearinghouse enclaves for autonomous agent networks & DAOs.",
      badge: "DEDICATED ENCLAVES",
      isPopular: false,
      price: {
        monthly: 299,
        yearly: 249,
      },
      annualDetail: "billed annually at $2,988/year",
      takeRate: "0.5%",
      features: [
        "FastMCP RPC throughput: Unlimited / Dedicated cluster",
        "Concurrent programmatic escrow vaults: Unlimited",
        "Double-entry cryptographic audit log retention: Unlimited immutable cold storage",
        "Take rate settlement fee: 0.5% (Custom volume tiering)",
        "Zero-Knowledge Proof & TEE Enclave verification",
        "Dedicated 24/7 protocol engineer support & custom mTLS gateways",
        "Custom legal liability allocation & SLA guarantees",
      ],
      ctaText: "Contact Protocol Architects",
      ctaHref: "mailto:legal@veri-sett.com?subject=Enterprise%20Clearinghouse%20Inquiry",
      ctaVariant: "secondary" as const,
    },
  ];

  return (
    <section id="pricing" className="py-24 border-t border-[#EAE3D2] bg-[#FAF8F5] relative overflow-hidden">
      {/* Background Ambience */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-mono text-blue-600">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>DETERMINISTIC PROTOCOL ECONOMICS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#09090B]">
            Simple, Transparent M2M Pricing
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Zero per-seat charges. Zero human licensing friction. Pay only for the cryptographic throughput and concurrent escrow state your autonomous agents demand.
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

        {/* 3-Part Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
          {plans.map((plan) => {
            const currentPrice = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full transition-all duration-300 relative ${
                  plan.isPopular
                    ? "border-2 border-blue-500/40 bg-blue-950/10 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/20"
                    : "border border-[#EAE3D2] bg-white shadow-sm hover:shadow-md hover:border-slate-300"
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-md shadow-blue-500/30">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Top Details */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {plan.isPopular ? "MULTI-AGENT PROTOCOL" : plan.badge}
                    </span>
                    <span className="text-xs font-mono text-blue-600 font-semibold">
                      Take Rate: {plan.takeRate}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#09090B]">
                      {plan.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#09090B]">
                        ${currentPrice}
                      </span>
                      <span className="text-sm font-medium text-slate-500">
                        {plan.price.monthly === 0 ? "/ mo" : "/ mo"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      {billingCycle === "yearly" && plan.price.yearly > 0
                        ? plan.annualDetail
                        : plan.price.monthly === 0
                        ? "Free forever"
                        : "Billed monthly"}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      Protocol Capabilities
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className="h-4 w-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                          </div>
                          <span className="leading-snug text-[#09090B]/90 font-medium">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Anchored Action Button */}
                <div className="pt-8 mt-auto">
                  <Link
                    href={plan.ctaHref}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-center ${
                      plan.ctaVariant === "primary"
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99]"
                        : "bg-white hover:bg-slate-50 text-[#09090B] border border-slate-300 hover:border-blue-400 shadow-2xs"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
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

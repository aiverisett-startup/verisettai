"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Server,
  Cpu,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";

export function EnterpriseAdBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl bg-gradient-to-r from-blue-700 via-indigo-600 via-purple-600 to-cyan-500 text-white backdrop-blur-xl border border-white/20 transition-all duration-300 group">
      {/* Dynamic Ambient Background Highlights */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-300/30 transition-all duration-500" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-900/40 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Pattern Grid Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
        {/* Left Column: Badge, Headline & Value Props */}
        <div className="space-y-4 max-w-2xl">
          {/* High-contrast animated badge with pulsing status beacon */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/25 text-xs font-mono font-bold tracking-wider uppercase text-cyan-200 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span>ENTERPRISE PROTOCOL // DEDICATED INFRASTRUCTURE</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Dedicated Node Orchestration &amp; High-Throughput Fleets
          </h2>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-sans">
            Engineered for institutional AI deployments, high-frequency autonomous settlements, and isolated multi-agent clearing corridors.
          </p>

          {/* Value Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-medium">
            <div className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15">
              <Server className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>Dedicated Bare-Metal Runtimes</span>
            </div>
            <div className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15">
              <Cpu className="w-4 h-4 text-purple-300 shrink-0" />
              <span>Custom FastMCP Adapters</span>
            </div>
            <div className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>99.99% Financial Clearing SLA</span>
            </div>
            <div className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15">
              <Zap className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Unlimited Autonomous Token Settlement</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Impact Call to Action */}
        <div className="w-full lg:w-auto flex flex-col items-center lg:items-end gap-3 shrink-0 self-stretch lg:self-center justify-center pt-2 lg:pt-0">
          <Link
            href="/checkout?plan=enterprise"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-blue-900 font-bold px-7 py-4 rounded-xl shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Claim Dedicated Fleet Access (₹30,000 / mo)</span>
            <ArrowRight className="w-4 h-4 text-blue-900 shrink-0" />
          </Link>

          <span className="text-[11px] font-mono text-cyan-100/80 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-cyan-300" />
            Instant Autonomous Provisioning • Dedicated Hardware Node
          </span>
        </div>
      </div>
    </div>
  );
}
export default EnterpriseAdBanner;


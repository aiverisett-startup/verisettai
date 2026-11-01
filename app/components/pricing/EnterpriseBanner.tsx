"use client";

import React from "react";
import Link from "next/link";
import { Server, Cpu, ShieldCheck, Zap, ArrowRight, Sparkles, Lock } from "lucide-react";

interface EnterpriseBannerProps {
  onSelectEnterprise?: () => void;
  ctaHref?: string;
}

export function EnterpriseBanner({
  onSelectEnterprise,
  ctaHref = "/checkout?plan=enterprise",
}: EnterpriseBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-700 via-indigo-600 via-purple-600 to-cyan-500 text-white backdrop-blur-xl border border-white/20 shadow-xl group transition-all duration-300">
      {/* Dynamic Ambient Blur Spheres */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-300/35 transition-all duration-500" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-900/40 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Dot Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
        {/* Left Column: Beacon Tag, Headline, Bullets */}
        <div className="space-y-3.5 max-w-2xl">
          {/* Top beacon tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/25 text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>ENTERPRISE PROTOCOL // DEDICATED INFRASTRUCTURE</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Dedicated Node Orchestration &amp; High-Throughput Fleets
          </h2>

          {/* Bullet highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs font-medium">
            <div className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15">
              <Server className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Dedicated Bare-Metal Runtime Slots</span>
            </div>
            <div className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15">
              <Cpu className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span>Custom FastMCP Adapters</span>
            </div>
            <div className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>99.99% Node SLA Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/15">
              <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Unlimited Programmatic Token Settle</span>
            </div>
          </div>
        </div>

        {/* Right Column: CTA Button */}
        <div className="w-full lg:w-auto flex flex-col items-center lg:items-end gap-2.5 shrink-0 self-stretch lg:self-center justify-center">
          {onSelectEnterprise ? (
            <button
              type="button"
              onClick={onSelectEnterprise}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-blue-900 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Deploy Enterprise Fleet (₹30,000 / mo + 18% GST)</span>
              <ArrowRight className="w-4 h-4 text-blue-900 shrink-0" />
            </button>
          ) : (
            <Link
              href={ctaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-blue-900 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Deploy Enterprise Fleet (₹30,000 / mo + 18% GST)</span>
              <ArrowRight className="w-4 h-4 text-blue-900 shrink-0" />
            </Link>
          )}

          <span className="text-[10px] font-mono text-cyan-100/80 flex items-center gap-1">
            <Lock className="w-3 h-3 text-cyan-300" />
            Instant Autonomous Provisioning • Bare-Metal Cluster
          </span>
        </div>
      </div>
    </div>
  );
}

export default EnterpriseBanner;

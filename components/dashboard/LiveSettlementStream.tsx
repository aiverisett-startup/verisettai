"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Cpu,
  CheckCircle,
  Timer,
  Pause,
  Play,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { TelemetryStats } from "./types";
import { liveTickerItems } from "./launchData";

interface LiveSettlementStreamProps {
  telemetry: TelemetryStats;
}

export const LiveSettlementStream: React.FC<LiveSettlementStreamProps> = ({
  telemetry,
}) => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveTickerItems.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentItem = liveTickerItems[tickerIndex];

  return (
    <section className="space-y-4">
      {/* Real-Time Settlement Ticker Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-[#EAE3D2] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(197,155,95,0.03)] relative overflow-hidden">
        
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider text-[#1C1A17] uppercase font-mono">
              Live Escrow Stream
            </span>
          </div>

          <div className="h-4 w-px bg-[#EAE3D2] hidden sm:block shrink-0" />

          {/* Cycling State Item */}
          <div className="flex items-center gap-2 text-xs font-mono truncate text-[#8C8275]">
            <span className="text-[#9E7A45]/70">Contract:</span>
            <span className="text-[#1C1A17] font-semibold">{currentItem.contractId}</span>
            <span className="text-[#EAE3D2]">|</span>
            <span className="text-[#1C1A17] font-medium">{currentItem.payer}</span>
            <ArrowRight className="h-3 w-3 text-[#9E7A45] shrink-0" />
            <span className="text-[#1C1A17] font-medium">{currentItem.worker}</span>
            <span className="text-[#EAE3D2]">|</span>
            <span className="text-[#9E7A45] font-semibold">{currentItem.amount}</span>
          </div>
        </div>

        {/* Status Badge & Control */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border font-mono ${
              currentItem.badgeColor === "emerald"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : currentItem.badgeColor === "amber"
                ? "border-[#EAE3D2] bg-[#FAF6EE] text-[#9E7A45]"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                currentItem.badgeColor === "emerald"
                  ? "bg-emerald-600"
                  : currentItem.badgeColor === "amber"
                  ? "bg-[#C59B5F]"
                  : "bg-rose-600"
              }`}
            />
            <span>{currentItem.state}</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume ticker" : "Pause ticker"}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-[#EAE3D2] bg-[#FDFCF9] text-[#8C8275] hover:text-[#1C1A17] transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Visual Telemetry Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: 24h Settlement Volume */}
        <div className="rounded-2xl bg-white border border-[#EAE3D2] p-5 shadow-[0_2px_12px_rgba(197,155,95,0.03)] hover:border-[#D4AF37] hover:shadow-[0_8px_24px_rgba(197,155,95,0.08)] transition-all">
          <div className="flex items-center justify-between text-[#8C8275]">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              24h Escrow Volume
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] text-[#9E7A45]">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-[#1C1A17] font-mono">
              ₹{((telemetry.volume_24h_cents / 100) * 83).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="text-xs font-medium text-emerald-700 font-mono">
              +14.2%
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8C8275]">
            Milestone volume cleared programmatically
          </p>
        </div>

        {/* Metric 2: Total Contracts Executed */}
        <div className="rounded-2xl bg-white border border-[#EAE3D2] p-5 shadow-[0_2px_12px_rgba(197,155,95,0.03)] hover:border-[#D4AF37] hover:shadow-[0_8px_24px_rgba(197,155,95,0.08)] transition-all">
          <div className="flex items-center justify-between text-[#8C8275]">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Protected Vaults
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] text-[#9E7A45]">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-[#1C1A17] font-mono">
              {telemetry.total_contracts.toLocaleString()}
            </span>
            <span className="text-xs text-[#8C8275] font-mono">
              vaults
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8C8275]">
            Zero counterparty disputes
          </p>
        </div>

        {/* Metric 3: Automated Verification Success Rate */}
        <div className="rounded-2xl bg-white border border-[#EAE3D2] p-5 shadow-[0_2px_12px_rgba(197,155,95,0.03)] hover:border-[#D4AF37] hover:shadow-[0_8px_24px_rgba(197,155,95,0.08)] transition-all">
          <div className="flex items-center justify-between text-[#8C8275]">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Pass Rate
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-emerald-700 font-mono">
              {telemetry.success_rate}%
            </span>
            <span className="text-xs text-[#8C8275] font-mono">
              verified
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8C8275]">
            Automated quality assertion score
          </p>
        </div>

        {/* Metric 4: Average Settlement Latency */}
        <div className="rounded-2xl bg-white border border-[#EAE3D2] p-5 shadow-[0_2px_12px_rgba(197,155,95,0.03)] hover:border-[#D4AF37] hover:shadow-[0_8px_24px_rgba(197,155,95,0.08)] transition-all">
          <div className="flex items-center justify-between text-[#8C8275]">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Release Latency
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] text-[#9E7A45]">
              <Timer className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-[#1C1A17] font-mono">
              {telemetry.avg_settlement_ms}ms
            </span>
            <span className="text-xs font-medium text-emerald-700 font-mono">
              instant
            </span>
          </div>
          <p className="mt-1 text-xs text-[#8C8275]">
            Sub-second programmatic disbursement
          </p>
        </div>
      </div>
    </section>
  );
};

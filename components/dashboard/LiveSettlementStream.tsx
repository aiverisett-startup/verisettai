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

const liveTickerItems = [
  {
    contractId: "vst_fastmcp_core",
    payer: "FastMCP Consensus Node",
    worker: "Autonomous Escrow Verification Rail",
    amount: "Active",
    state: "Listening to Ledger Movements",
    badgeColor: "emerald",
  },
  {
    contractId: "vst_settle_rail",
    payer: "Orchestrator Swarm",
    worker: "Double-Entry Ledger Verification",
    amount: "Standing By",
    state: "Deterministic Consensus Ready",
    badgeColor: "emerald",
  },
];

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_12px_rgba(37,99,235,0.03)] relative overflow-hidden">
        
        <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider text-[#09090B] uppercase font-mono">
              Live Escrow Stream
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

          {/* Cycling State Item with strict truncation */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono min-w-0 text-slate-500 overflow-hidden">
            <span className="text-blue-600/70 shrink-0">Contract:</span>
            <span className="text-[#09090B] font-semibold shrink-0">{currentItem.contractId}</span>
            <span className="text-slate-200 shrink-0">|</span>
            <span className="text-[#09090B] font-medium truncate max-w-[80px] sm:max-w-[140px]">{currentItem.payer}</span>
            <ArrowRight className="h-3 w-3 text-blue-600 shrink-0" />
            <span className="text-[#09090B] font-medium truncate max-w-[80px] sm:max-w-[140px]">{currentItem.worker}</span>
            <span className="text-slate-200 shrink-0">|</span>
            <span className="text-blue-600 font-semibold shrink-0">{currentItem.amount}</span>
          </div>
        </div>

        {/* Status Badge & Control */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border font-mono ${
              currentItem.badgeColor === "emerald"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : currentItem.badgeColor === "amber"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                currentItem.badgeColor === "emerald"
                  ? "bg-emerald-600"
                  : currentItem.badgeColor === "amber"
                  ? "bg-blue-600"
                  : "bg-rose-600"
              }`}
            />
            <span>{currentItem.state}</span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume ticker" : "Pause ticker"}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:text-[#09090B] transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Visual Telemetry Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Testnet Settled Volume */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-[0_2px_12px_rgba(37,99,235,0.03)] hover:border-blue-400 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Testnet Settled Volume
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-[#09090B] font-mono">
              $142,800 USD
            </span>
            <span className="text-xs font-medium text-blue-600 font-mono">
              Sandbox
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Testnet volume cleared via deterministic protocol assertions
          </p>
        </div>

        {/* Metric 2: Total Contracts Executed */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-[0_2px_12px_rgba(37,99,235,0.03)] hover:border-blue-400 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Protected Vaults
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-[#09090B] font-mono">
              {telemetry.total_contracts.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              vaults
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Zero counterparty disputes
          </p>
        </div>

        {/* Metric 3: Automated Verification Pass Rate */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-[0_2px_12px_rgba(37,99,235,0.03)] hover:border-blue-400 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition-all">
          <div className="flex items-center justify-between text-slate-500">
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
            <span className="text-xs text-slate-500 font-mono">
              verified
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automated quality assertion score
          </p>
        </div>

        {/* Metric 4: Average Settlement Latency */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-[0_2px_12px_rgba(37,99,235,0.03)] hover:border-blue-400 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Release Latency
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Timer className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-[#09090B] font-mono">
              {telemetry.avg_settlement_ms ?? telemetry.avg_latency_ms ?? 42}ms
            </span>
            <span className="text-xs font-medium text-emerald-700 font-mono">
              instant
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Sub-second programmatic disbursement
          </p>
        </div>
      </div>
    </section>
  );
};

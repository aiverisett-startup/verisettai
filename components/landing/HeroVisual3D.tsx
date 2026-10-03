"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, ArrowRight, Building2, Lock, Sparkles, Cpu } from "lucide-react";

export function HeroVisual3D() {
  const [cycleStep, setCycleStep] = useState<number>(1); // 1: Deposit Locked, 2: Tracing to Vault, 3: Validation, 4: Settled

  useEffect(() => {
    // 6-second seamless cycle: 1.5s per phase
    const interval = setInterval(() => {
      setCycleStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Derived progress percentage for step 3
  const progressPercent =
    cycleStep === 1 ? 25 : cycleStep === 2 ? 55 : cycleStep === 3 ? 85 : 100;

  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none">
      {/* Subtle Abstract 3D Geometric Half-Shape in Background */}
      <div className="absolute -top-16 -right-10 w-72 h-72 pointer-events-none -z-10 animate-[float_8s_ease-in-out_infinite]">
        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-70">
          <circle cx="120" cy="120" r="90" fill="url(#prism-ambient)" />
          {/* Half-Arc and Prism Geometric Facets with Electric Linework */}
          <path d="M 30,120 A 90,90 0 0,1 210,120" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.4" />
          <polygon points="120,20 200,80 120,140 40,80" fill="#FFFFFF" fillOpacity="0.85" stroke="#2563EB" strokeWidth="1.2" strokeOpacity="0.3" />
          <polygon points="120,140 200,80 180,180 120,220" fill="#F0F9FF" fillOpacity="0.75" stroke="#3B82F6" strokeWidth="1.2" strokeOpacity="0.3" />
          <polygon points="120,140 40,80 60,180 120,220" fill="#E0F2FE" fillOpacity="0.7" stroke="#06B6D4" strokeWidth="1.2" strokeOpacity="0.3" />
          <polygon points="120,20 120,140 120,220" stroke="#1D4ED8" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
          <ellipse cx="120" cy="130" rx="100" ry="40" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.2" transform="rotate(-15 120 130)" />
          
          <defs>
            <radialGradient id="prism-ambient" cx="0.5" cy="0.5" r="0.5" fx="0.3" fy="0.3">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
              <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Subtle Electric Blue Ambient Glow in Background */}
      <div className="absolute -bottom-8 -left-8 w-60 h-60 bg-gradient-to-tr from-blue-500/15 via-cyan-400/10 to-transparent rounded-full blur-2xl -z-10 pointer-events-none" />

      {/* Main Luxury Electric Blue & White Transaction Preview Card */}
      <div className="relative w-full rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-[0_4px_24px_rgba(37,99,235,0.07)] transition-all duration-300 hover:shadow-[0_10px_36px_rgba(37,99,235,0.12)] hover:border-blue-400">
        
        {/* Card Header: Contract Metadata */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
              
              {/* Electric Burst Ring on Settlement (Step 4) */}
              {cycleStep === 4 && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 rounded-xl border-2 border-blue-500 pointer-events-none motion-reduce:hidden"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#09090B] tracking-tight">
                  Autonomous M2M Escrow Vault
                </span>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider transition-colors ${
                    cycleStep === 4
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {cycleStep === 4 ? "SIMULATION SETTLED" : "INTERACTIVE SIMULATION"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Ref: #VAULT-2026-M2M-0982
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-500">Total Escrow Value</div>
            <div className="text-base sm:text-lg font-bold font-mono text-[#09090B] tracking-tight">
              $250.00
            </div>
          </div>
        </div>

        {/* Counterparty Dynamic Relationship & Glowing Traced Line */}
        <div className="relative bg-slate-50/80 rounded-xl p-4 border border-slate-200 mb-5 overflow-hidden">
          {/* Animated Glowing Traced Path between Agent A and Vault / Beneficiary */}
          <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-0.5 pointer-events-none z-0">
            <div className="w-full h-full bg-slate-200 relative">
              {/* Electric Blue Traced pulse beam */}
              <motion.div
                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-[1px] motion-reduce:hidden"
                animate={{
                  left: ["-20%", "120%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            {/* Step 1: Agent A Node */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all ${
                    cycleStep >= 1
                      ? "bg-white border-blue-500 text-blue-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-blue-600/60"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>

                {/* Step 1: Emerald Ping Badge */}
                {cycleStep === 1 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                )}
              </div>

              <div className="truncate">
                <div className="text-[9px] uppercase font-mono tracking-wider text-slate-500">
                  Buyer Agent
                </div>
                <div className="text-xs font-semibold text-[#09090B] truncate">Agent_Alpha_Buyer</div>
              </div>
            </div>

            {/* Central Verisett Vault Node */}
            <div className="flex flex-col items-center justify-center px-2">
              <div
                className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                  cycleStep >= 2
                    ? "bg-blue-600 border-blue-500 text-white shadow-xs shadow-blue-500/30"
                    : "bg-white border-slate-200 text-blue-600"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1">Vault Node</span>
            </div>

            {/* Step 4: Beneficiary Agent B Node */}
            <div className="flex items-center gap-2.5 min-w-0 text-right">
              <div className="truncate">
                <div className="text-[9px] uppercase font-mono tracking-wider text-slate-500">
                  Worker Agent
                </div>
                <div className="text-xs font-semibold text-[#09090B] truncate">Agent_Theta_Worker</div>
              </div>

              <div className="relative">
                <div
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all ${
                    cycleStep === 4
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>

                {/* Step 4: Soft Blue Ring Burst */}
                {cycleStep === 4 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0.9 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="absolute inset-0 rounded-xl border-2 border-blue-500 pointer-events-none motion-reduce:hidden"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Status Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {/* Step 1 & 2: Escrow Locked badge */}
          <div className="rounded-xl bg-blue-50/60 border border-blue-200/80 p-2.5 flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
            </span>
            <div>
              <div className="text-[9px] font-mono text-blue-600 uppercase">
                {cycleStep === 1
                  ? "Step 1: Agent Deposit"
                  : cycleStep === 2
                  ? "Step 2: Custody Routing"
                  : "Vault Secured"}
              </div>
              <div className="text-xs font-semibold text-[#09090B]">
                {cycleStep === 1 ? "Escrow Deposit Locked" : "Funds Locked: $250.00"}
              </div>
            </div>
          </div>

          {/* Step 3 & 4: Assertion & Settlement badge */}
          <div
            className={`rounded-xl border p-2.5 flex items-center gap-2.5 transition-all ${
              cycleStep === 4
                ? "bg-[#F0FDF4] border-[#BBF7D0]"
                : cycleStep === 3
                ? "bg-blue-50/70 border-blue-200"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div
              className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                cycleStep === 4
                  ? "bg-emerald-100 text-emerald-700"
                  : cycleStep === 3
                  ? "bg-blue-100 text-blue-700"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {cycleStep === 4 ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <Cpu className="w-2.5 h-2.5" />
              )}
            </div>
            <div>
              <div className="text-[9px] font-mono text-slate-500 uppercase">
                {cycleStep === 3
                  ? "Step 3: Verification"
                  : cycleStep === 4
                  ? "Step 4: Micro-Clearing"
                  : "Acceptance Gate"}
              </div>
              <div
                className={`text-xs font-semibold truncate ${
                  cycleStep === 4
                    ? "text-emerald-900"
                    : cycleStep === 3
                    ? "text-blue-900"
                    : "text-slate-500"
                }`}
              >
                {cycleStep === 4
                  ? "Settled: Payout Disbursed"
                  : cycleStep === 3
                  ? "Evaluating Deterministic Assertions..."
                  : "Awaiting Deliverable"}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Vault Validation Progress Bar (Fills 0% -> 100%) */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#09090B]">
              {cycleStep === 4
                ? "Settlement Finalized"
                : cycleStep === 3
                ? "Validating Acceptance Criteria..."
                : "Escrow Protocol Progress"}
            </span>
            <span className="font-mono font-semibold text-blue-600">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative border border-slate-200">
            <motion.div
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 h-full rounded-full"
              initial={{ width: "25%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Steps Indicator */}
          <div className="grid grid-cols-4 gap-1 pt-1 text-[10px] font-mono text-center">
            <div
              className={`p-1 rounded transition-colors ${
                cycleStep >= 1 ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200" : "text-slate-400"
              }`}
            >
              1. Lock
            </div>
            <div
              className={`p-1 rounded transition-colors ${
                cycleStep >= 2 ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200" : "text-slate-400"
              }`}
            >
              2. Route
            </div>
            <div
              className={`p-1 rounded transition-colors ${
                cycleStep >= 3 ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200" : "text-slate-400"
              }`}
            >
              3. Verify
            </div>
            <div
              className={`p-1 rounded transition-colors ${
                cycleStep === 4 ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200" : "text-slate-400"
              }`}
            >
              4. Settle
            </div>
          </div>
        </div>

        {/* Bottom Settlement State Confirmation Box */}
        <div className="rounded-xl bg-slate-50/80 border border-slate-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                cycleStep === 4
                  ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#09090B]">
                {cycleStep === 4 ? "Atomic Release Complete" : "Settlement Protocol"}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Latency: 38ms • SHA-256 Receipt Generated
              </div>
            </div>
          </div>

          <span
            className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
              cycleStep === 4
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-white text-blue-600 border border-blue-200"
            }`}
          >
            {cycleStep === 4 ? "CLEARED" : "IN_PROGRESS"}
          </span>
        </div>

      </div>
    </div>
  );
}

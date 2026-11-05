"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Lock,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  KeyRound,
  FileCode2,
  Terminal,
} from "lucide-react";
import { EASINGS } from "@/lib/motion";
import Link from "next/link";

interface LifecycleStage {
  id: number;
  key: string;
  badge: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  color: string;
  meta: {
    status: string;
    protocolAction: string;
    proofHash: string;
    sla: string;
    details: { label: string; value: string }[];
  };
}

const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: 1,
    key: "lock",
    badge: "01 / ATOMIC LOCK",
    title: "Vault Invariant & Collateral Lock",
    shortDesc: "Milestone funds locked in non-custodial multi-sig vault using atomic SET NX lock with dual-key authorization.",
    icon: Lock,
    color: "#2563EB",
    meta: {
      status: "LOCKED (SET NX)",
      protocolAction: "deposit_collateral_vault",
      proofHash: "0x4a19...9f82c0",
      sla: "3.2ms",
      details: [
        { label: "Locked Collateral", value: "$1,000.00 USDC" },
        { label: "Signer Authority", value: "ed25519:agent_buyer_92" },
        { label: "Vault Invariant", value: "SHA-256 Output Match" },
      ],
    },
  },
  {
    id: 2,
    key: "dispatch",
    badge: "02 / FASTMCP DISPATCH",
    title: "Autonomous Agent Execution",
    shortDesc: "Mutual TLS FastMCP handshake dispatches worker agent with ephemeral scoped capability tokens.",
    icon: Cpu,
    color: "#0284C7",
    meta: {
      status: "DISPATCHED (mTLS)",
      protocolAction: "mcp_tool_exec",
      proofHash: "0x7b23...a381de",
      sla: "11.8ms",
      details: [
        { label: "Worker Agent", value: "Agent_Sentinel_Worker" },
        { label: "Protocol Channel", value: "FastMCP SSE Stream" },
        { label: "Session Nonce", value: "vrs_sess_9024f81c" },
      ],
    },
  },
  {
    id: 3,
    key: "verify",
    badge: "03 / CRYPTOGRAPHIC PROOF",
    title: "Proof of Execution & AST Audit",
    shortDesc: "Automated engine computes SHA-256 deliverable commitment, AST lint rules, and zero-knowledge state root assertion.",
    icon: ShieldCheck,
    color: "#4F46E5",
    meta: {
      status: "VERIFIED & SIGNED",
      protocolAction: "evaluate_deliverable_hash",
      proofHash: "0x8f2a...c4b1e9",
      sla: "18.4ms",
      details: [
        { label: "SHA-256 Match", value: "100% IDENTICAL" },
        { label: "Security Vulnerabilities", value: "0 Critical / 0 High" },
        { label: "ZK State Root", value: "0x39a1...1092e4 Cleared" },
      ],
    },
  },
  {
    id: 4,
    key: "settle",
    badge: "04 / INSTANT SETTLEMENT",
    title: "Autonomous Payout Release",
    shortDesc: "Programmatic settlement release disburses net funds to receiver agent wallet in sub-25ms with immutable ledger logging.",
    icon: Zap,
    color: "#059669",
    meta: {
      status: "ATOMIC SETTLED",
      protocolAction: "release_escrow_payout",
      proofHash: "0x9c31...ee8201",
      sla: "22.5ms",
      details: [
        { label: "Disbursed Amount", value: "$980.00 USDC" },
        { label: "Protocol Fee", value: "$20.00 (2.0%)" },
        { label: "Ledger Receipt", value: "#VR-REC-8921" },
      ],
    },
  },
];

export function EscrowLifecycleVisualizer() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // Auto-advance lifecycle simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % LIFECYCLE_STAGES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeStage = LIFECYCLE_STAGES[activeStageIndex];

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] border-y border-slate-200/80 overflow-hidden">
      {/* Background Ambient Electric Blue Beam */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.06)_0%,transparent_70%)] blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-600 border border-blue-200/60 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            LIVE CLEARINGHOUSE TELEMETRY
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-[#0F172A] leading-[1.18]">
            Animated Escrow Transaction Lifecycle
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3.5 leading-relaxed">
            Watch how sovereign AI agents lock collateral, execute verifiable work, and receive programmatic settlement payouts with mathematical finality.
          </p>
        </div>

        {/* The Main Futuristic Glass Container */}
        <div className="relative rounded-3xl bg-white/80 backdrop-blur-2xl border border-blue-200/70 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.1)] p-6 sm:p-8 md:p-10 transition-all">
          
          {/* Top Control Bar: Simulation Controls & Active State Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Phase Progress:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-full border border-slate-200">
                {LIFECYCLE_STAGES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveStageIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`px-3 py-1 text-xs font-mono font-semibold rounded-full transition-all ${
                      activeStageIndex === idx
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    0{s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Play/Pause & Reset Micro-Interactions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-all active:scale-95"
                title={isPlaying ? "Pause autoplay" : "Resume autoplay"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-blue-600" /> : <Play className="w-3.5 h-3.5 text-blue-600" />}
                <span>{isPlaying ? "Pause Simulation" : "Auto Play"}</span>
              </button>

              <button
                onClick={() => {
                  setActiveStageIndex(0);
                  setIsPlaying(true);
                }}
                className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all active:scale-95"
                title="Restart from Stage 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4 Interactive Stage Cards Rail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 mb-8">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = activeStageIndex === idx;
              const isPast = activeStageIndex > idx;

              return (
                <motion.div
                  key={stage.id}
                  onClick={() => {
                    setActiveStageIndex(idx);
                    setIsPlaying(false);
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                  className={`group relative cursor-pointer rounded-2xl p-5 border transition-all text-left ${
                    isActive
                      ? "bg-gradient-to-b from-blue-50/70 to-white border-blue-500 shadow-[0_12px_28px_-6px_rgba(37,99,235,0.2)] ring-2 ring-blue-500/20"
                      : isPast
                      ? "bg-white/60 border-emerald-300/60 hover:border-slate-300"
                      : "bg-white/40 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : isPast
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {isPast ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
                      </span>
                    ) : isActive ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md font-bold border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 font-medium">QUEUED</span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    {stage.badge}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                    {stage.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {stage.shortDesc}
                  </p>

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBar"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Inspection Terminal / Deep Dive Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASINGS.luxury }}
              className="rounded-2xl bg-slate-900 text-slate-100 p-6 sm:p-7 border border-slate-800 shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
                        {activeStage.meta.protocolAction}()
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        Latency: {activeStage.meta.sla}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      Execution State: <span className="text-emerald-400 font-mono">{activeStage.meta.status}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                  <span>Hash: {activeStage.meta.proofHash}</span>
                </div>
              </div>

              {/* Data Invariants Inspection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
                {activeStage.meta.details.map((detail, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {detail.label}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-100 font-mono mt-1">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Action Strip */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Full cryptographic audit log generated with deterministic double-entry clearing.</span>
            </div>

            <Link
              href="/dashboard/create-contract"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Deploy Autonomous Contract</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}

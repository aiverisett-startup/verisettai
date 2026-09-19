"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Cpu, Lock, CheckCircle2, ArrowRight, FileCheck, Layers, Sparkles, ExternalLink } from "lucide-react";
import { AutonomousVerificationNetwork } from "@/components/3d/AutonomousVerificationNetwork";

export function ProtocolArchitecture() {
  const [activeEngine, setActiveEngine] = useState<"test" | "integrity" | "sla" | "approval" | "network3d">("test");

  const engines = {
    test: {
      tag: "AUTOMATED DELIVERABLE VERIFICATION",
      title: "Automated Acceptance & Quality Test Suite",
      description:
        "Define software deliverable acceptance criteria without writing complex code. Verisett automatically evaluates test pass rates, AST lint standards, and security checks before releasing milestone funds.",
      badge: "Condition Verified: Milestone Deliverable Accepted",
      stats: [
        { label: "Unit Test Coverage", value: "99.4%", status: "PASSED (>95%)", ok: true },
        { label: "AST Security Audit", value: "Zero Vulnerabilities", status: "CLEARED", ok: true },
        { label: "Execution Trace", value: "Verified & Hash-Pinned", status: "MATCHED", ok: true },
      ],
      payoutStatus: "₹25,000 Payout Auto-Release Scheduled",
      payoutColor: "gold",
    },
    integrity: {
      tag: "CRYPTOGRAPHIC ARTIFACT HASHING",
      title: "Cryptographic Artifact & Build Fingerprinting",
      description:
        "Ensures the delivered software build, Docker image, or documentation bundle matches the exact agreed cryptographic hash commitment. Eliminates bait-and-switch risks.",
      badge: "Integrity Confirmed: 100% Bit-for-Bit Match",
      stats: [
        { label: "Build SHA-256", value: "0x8f2a...c4b1e9", status: "HASH PINNED", ok: true },
        { label: "Tamper Resistance", value: "100% Immutable", status: "VERIFIED", ok: true },
        { label: "Oracle Verification", value: "Sub-5ms Execution", status: "CONFIRMED", ok: true },
      ],
      payoutStatus: "₹50,000 Milestone Unlocked Instantly",
      payoutColor: "gold",
    },
    sla: {
      tag: "PERFORMANCE & LATENCY CRITERIA",
      title: "Deterministic Benchmark & SLA Enforcement",
      description:
        "Release milestone tranches only when APIs, models, or data pipelines achieve agreed throughput and response latency SLAs under simulated production load.",
      badge: "Benchmark Verified: SLA Standards Exceeded",
      stats: [
        { label: "p99 Response Latency", value: "38ms", status: "EXCEEDED (<100ms)", ok: true },
        { label: "Stress Throughput", value: "2,400 req/sec", status: "TARGET MET", ok: true },
        { label: "Error Rate", value: "0.00%", status: "OPTIMAL", ok: true },
      ],
      payoutStatus: "₹1,00,000 Infrastructure Payout Released",
      payoutColor: "gold",
    },
    approval: {
      tag: "DUAL-CLIENT SIGN-OFF OR MANUAL REVIEW",
      title: "Dual-Party Commercial Milestone Approval",
      description:
        "Combine automated programmatic checks with formal dual-signature client authorization. Protects both payer and contractor with transparent audit logs.",
      badge: "Dual Approval: Mutual Sign-Off Complete",
      stats: [
        { label: "Client Sign-Off", value: "Authorized by VP Engineering", status: "CONFIRMED", ok: true },
        { label: "Deliverable Received", value: "Full Code Repository & Docs", status: "DOWNLOADED", ok: true },
        { label: "Escrow Vault State", value: "Auto-Release Complete: 100%", status: "SETTLED", ok: true },
      ],
      payoutStatus: "₹2,50,000 Final Deliverable Cleared",
      payoutColor: "gold",
    },
    network3d: {
      tag: "3D AUTONOMOUS VERIFICATION NETWORK",
      title: "Crystalline Consensus Core Architecture",
      description:
        "An autonomous geometric verification network rendered in interactive 3D WebGL. Featuring deep obsidian facets, frosted refractions, glowing golden (#D4AF37) edges, and traveling photon micro-pulses.",
      badge: "3D Consensus Topology: Live Interactive Drift",
      stats: [
        { label: "Geometric Nodes", value: "11 Consensus Vertices", status: "SYNCHRONIZED", ok: true },
        { label: "Network Struts", value: "11 Dynamic Photon Rails", status: "PULSING", ok: true },
        { label: "Consensus Apex", value: "Sharp Consensus Anchor", status: "IMMUTABLE", ok: true },
      ],
      payoutStatus: "Interactive WebGL Embed Active",
      payoutColor: "gold",
    },
  };

  const current = engines[activeEngine];

  return (
    <section id="milestones" className="py-24 border-t border-[#EAE3D2] bg-white relative overflow-hidden">
      {/* Precision Edge Shapes flanking Protocol Architecture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Top-Right Edge: Semicircle & Concentric Radial Arcs */}
        <div className="absolute top-8 -right-16 sm:-right-20 w-80 sm:w-96 h-80 sm:h-96 opacity-50 motion-safe:animate-float-slow">
          <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="arch-half-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#C59B5F" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 200,30 A 160,160 0 0,0 200,350 L 200,30 Z"
              fill="url(#arch-half-grad)"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
            <path
              d="M 200,60 A 130,130 0 0,0 200,320"
              stroke="#C59B5F"
              strokeWidth="1"
              strokeDasharray="5 5"
              strokeOpacity="0.35"
            />
            <circle cx="90" cy="190" r="4" fill="#D4AF37" />
            <circle cx="130" cy="100" r="3" fill="#C59B5F" />
            <circle cx="130" cy="280" r="3" fill="#9E7A45" />
          </svg>
        </div>

        {/* Bottom-Left Edge: Architectural Circuit Caliper & Vault Diamond */}
        <div className="absolute bottom-10 -left-12 sm:-left-16 w-64 sm:w-80 h-72 opacity-50 motion-safe:animate-float-reverse">
          <svg viewBox="0 0 300 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 20,240 L 20,60 L 140,60 L 180,100 L 180,240"
              stroke="#C59B5F"
              strokeWidth="1.2"
              strokeOpacity="0.45"
              fill="none"
            />
            <circle cx="20" cy="60" r="3" fill="#C59B5F" />
            <circle cx="180" cy="100" r="3.5" fill="#D4AF37" />
            <line x1="20" y1="150" x2="180" y2="150" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.3" />
            <line x1="20" y1="90" x2="32" y2="90" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="20" y1="120" x2="32" y2="120" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="20" y1="180" x2="32" y2="180" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="20" y1="210" x2="32" y2="210" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.5" />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[11px] font-mono uppercase tracking-wider text-[#9E7A45] mb-3">
            Milestone Verification
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1A17]">
            Pre-programmed acceptance. Zero payment anxiety.
          </h2>
          <p className="text-base sm:text-lg text-[#8C8275] mt-3 leading-relaxed">
            Replace subjective deliverable disputes and delayed invoices with automated verification. Funds stay safely in vault custody until contractual conditions are met.
          </p>
        </div>

        {/* Engine Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 border-b border-[#F0E9DC]">
          {[
            { id: "test", label: "Acceptance Tests", icon: FileCheck },
            { id: "integrity", label: "Cryptographic Fingerprint", icon: ShieldCheck },
            { id: "sla", label: "Performance & SLA", icon: Cpu },
            { id: "approval", label: "Dual-Party Sign-Off", icon: Layers },
            { id: "network3d", label: "3D Verification Network", icon: Sparkles, highlight: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeEngine === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveEngine(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#C59B5F] text-white border border-[#B38A4F] shadow-sm shadow-[#C59B5F]/20"
                    : tab.highlight
                    ? "bg-[#FAF6EE] text-[#9E7A45] border border-[#EAE3D2] hover:bg-[#F5EEDB]"
                    : "bg-[#FDFCF9] text-[#8C8275] border border-[#EAE3D2] hover:text-[#1C1A17] hover:border-[#D4AF37]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : tab.highlight ? "text-[#C59B5F]" : "text-[#8C8275]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Visual Inspection Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Commercial Description & Payout Rules */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-[#FAF6EE]/45 border border-[#EAE3D2] p-6 sm:p-8">
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#9E7A45] mb-2">
                {current.tag}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1C1A17] mb-3 tracking-tight">
                {current.title}
              </h3>
              <p className="text-sm sm:text-base text-[#8C8275] leading-relaxed mb-6">
                {current.description}
              </p>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
                <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600" />
                <span>{current.badge}</span>
              </div>
            </div>

            {/* Bottom Guaranteed Escrow Payout Box */}
            <div className="rounded-xl bg-white border border-[#EAE3D2] p-4 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[10px] text-[#8C8275] font-mono uppercase tracking-wider">Settlement Action</div>
                <div className="text-sm font-semibold text-[#1C1A17] mt-0.5">{current.payoutStatus}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Column: Visual Verification Metrics or 3D WebGL Embed */}
          {activeEngine === "network3d" ? (
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-[#14120E] border border-[#C59B5F]/40 p-4 shadow-[0_12px_40px_rgba(197,155,95,0.15)] relative min-h-[440px] overflow-hidden">
              <div className="relative w-full h-[370px] rounded-xl overflow-hidden">
                <AutonomousVerificationNetwork
                  transparent={false}
                  accentColor="#D4AF37"
                  interactive={true}
                  autoRotate={true}
                  showOverlayStats={true}
                />
              </div>

              <div className="mt-3 pt-3 border-t border-[#C59B5F]/20 flex items-center justify-between px-2 text-xs font-mono text-[#D4AF37]/80">
                <span className="flex items-center gap-1.5 text-[#FAF6EE]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Interactive Gold Core: Move Cursor to Tilt</span>
                </span>
                <Link
                  href="/network"
                  className="flex items-center gap-1.5 text-white hover:text-[#D4AF37] transition-colors font-semibold bg-[#262016] px-3 py-1 rounded-lg border border-[#C59B5F]/40 shadow-xs"
                >
                  <span>Fullscreen 3D Stage</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl bg-white border border-[#EAE3D2] p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.05)]">
              
              {/* Visual Header */}
              <div>
                <div className="flex items-center justify-between border-b border-[#F0E9DC] pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono uppercase font-semibold text-[#1C1A17]">
                      Deliverable Evaluation
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 font-medium">
                    Status: 100% Passed
                  </span>
                </div>

                {/* Metric Breakdown Cards */}
                <div className="space-y-3">
                  {current.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#FDFCF9] border border-[#EAE3D2]"
                    >
                      <div>
                        <div className="text-xs text-[#8C8275] font-medium">{stat.label}</div>
                        <div className="text-sm sm:text-base font-bold text-[#1C1A17] font-mono mt-0.5">
                          {stat.value}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800 font-semibold">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>{stat.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Assertion Invariant */}
              <div className="mt-6 pt-4 border-t border-[#F0E9DC] flex items-center justify-between text-xs text-[#8C8275]">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#9E7A45]" />
                  <span>Deterministic escrow invariant: Funds cannot disburse until checks clear.</span>
                </span>
                <span className="font-mono text-[11px] text-[#9E7A45] font-semibold">100% ENFORCED</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}

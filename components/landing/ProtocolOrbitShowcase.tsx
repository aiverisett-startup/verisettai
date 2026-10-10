"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  FileCode2,
  Zap,
  QrCode,
  Layers,
  Sparkles,
  ArrowUpRight,
  Fingerprint,
  Radio,
  Check,
} from "lucide-react";

export function ProtocolOrbitShowcase() {
  const [copiedNode, setCopiedNode] = useState(false);

  const handleCopyNode = () => {
    navigator.clipboard.writeText("node_0x9f88c2471b05a4e1");
    setCopiedNode(true);
    setTimeout(() => setCopiedNode(false), 2000);
  };

  return (
    <section className="relative w-full py-24 md:py-36 bg-[#09090b] text-white overflow-hidden select-none border-b border-zinc-800">
      
      {/* 1. Deep Radial Ambient Glows anchored from bottom-center */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] md:w-[1200px] h-[550px] bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.18)_0%,rgba(37,99,235,0.14)_35%,rgba(9,9,11,0)_70%)] blur-2xl -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-3xl -z-10" />

      {/* 2. Concentric Circular Radar Orbit Rings radiating outward from bottom-center */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover opacity-85"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            <radialGradient id="orbit-cyan-glow" cx="50%" cy="100%" r="65%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
              <stop offset="45%" stopColor="#2563EB" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
            </radialGradient>
            
            <linearGradient id="radar-beam" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sweeping Radar Arc Cone */}
          <path
            d="M 720,900 L 400,200 A 700,700 0 0,1 1040,200 Z"
            fill="url(#radar-beam)"
            className="opacity-30"
          />

          {/* Concentric Ring 1 (Inner core orbit) */}
          <circle
            cx="720"
            cy="900"
            r="160"
            stroke="#06B6D4"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            strokeDasharray="4 4"
          />
          
          {/* Concentric Ring 2 */}
          <circle
            cx="720"
            cy="900"
            r="320"
            stroke="#3B82F6"
            strokeWidth="1.2"
            strokeOpacity="0.28"
          />

          {/* Concentric Ring 3 (Main cards orbit) */}
          <circle
            cx="720"
            cy="900"
            r="500"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.32"
            strokeDasharray="6 6"
          />

          {/* Concentric Ring 4 */}
          <circle
            cx="720"
            cy="900"
            r="680"
            stroke="#2563EB"
            strokeWidth="1"
            strokeOpacity="0.2"
          />

          {/* Concentric Ring 5 (Outer horizon orbit) */}
          <circle
            cx="720"
            cy="900"
            r="880"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeOpacity="0.15"
            strokeDasharray="8 8"
          />

          {/* Orbit Coordinate Ray Lines */}
          <line x1="720" y1="900" x2="200" y2="380" stroke="#06B6D4" strokeWidth="0.8" strokeOpacity="0.18" strokeDasharray="3 5" />
          <line x1="720" y1="900" x2="720" y2="120" stroke="#06B6D4" strokeWidth="0.8" strokeOpacity="0.22" strokeDasharray="3 5" />
          <line x1="720" y1="900" x2="1240" y2="380" stroke="#06B6D4" strokeWidth="0.8" strokeOpacity="0.18" strokeDasharray="3 5" />

          {/* Decorative Radar Angle Ticks */}
          <text x="320" y="520" fill="#06B6D4" fillOpacity="0.4" fontSize="10" fontFamily="monospace">RADAR_ARC_45°</text>
          <text x="730" y="380" fill="#38BDF8" fillOpacity="0.5" fontSize="10" fontFamily="monospace">ZENITH_90° • ENCLAVE</text>
          <text x="1080" y="520" fill="#06B6D4" fillOpacity="0.4" fontSize="10" fontFamily="monospace">RADAR_ARC_135°</text>

          {/* Orbit Nodes Points */}
          <circle cx="480" cy="580" r="4" fill="#06B6D4" fillOpacity="0.8" />
          <circle cx="720" cy="400" r="5" fill="#38BDF8" fillOpacity="0.9" />
          <circle cx="960" cy="580" r="4" fill="#06B6D4" fillOpacity="0.8" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header: Top Center */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-sm backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              CONCENTRIC RADAR SETTLEMENT ORBIT
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-white font-sans leading-[1.14]">
            Deterministic, Fast &amp; Cryptographically Verified Settlement
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Autonomous FastMCP state machines verify software deliverables, bind non-custodial milestone vaults, and release programmatic payments with mathematical certainty.
          </p>
        </div>

        {/* 3 Orbiting Feature Nodes / Cards arranged symmetrically */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-20 md:mb-24">
          
          {/* Card 1: Left Node — "Milestone Escrow Vault" */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-7 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)]">
            <div className="space-y-5">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-950/70 border border-blue-800 text-blue-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                    VAULT #V-0982
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold uppercase">
                  FASTMCP ACTIVE
                </span>
              </div>

              {/* Title & Copy */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Milestone Escrow Vault
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed font-sans">
                  Autonomous FastMCP deliverable verification and conditional release.
                </p>
              </div>

              {/* Visual: Floating Stacked Assertion Cards with Dynamic Status Indicators */}
              <div className="space-y-2.5 pt-1">
                {/* Assertion 1 */}
                <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/90 flex items-center justify-between shadow-2xs group-hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shrink-0">
                      <FileCode2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-zinc-200 truncate">
                        Deliverable SHA-256 Digest
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        e3b0c44298fc...7b1a
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 shrink-0 flex items-center gap-1">
                    <Check className="w-3 h-3" /> VERIFIED
                  </span>
                </div>

                {/* Assertion 2 */}
                <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/90 flex items-center justify-between shadow-2xs group-hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-zinc-200 truncate">
                        FastMCP Latency SLA
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        18.4ms &lt; 50ms Limit
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 shrink-0 flex items-center gap-1">
                    <Check className="w-3 h-3" /> PASSED
                  </span>
                </div>

                {/* Assertion 3 */}
                <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/90 flex items-center justify-between shadow-2xs group-hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-md bg-blue-950/80 text-blue-400 border border-blue-800/60 shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-zinc-200 truncate">
                        Programmatic Release
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        $250.00 USDC Balance
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-blue-400 px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/80 shrink-0">
                    ● EXECUTED
                  </span>
                </div>
              </div>
            </div>

            {/* Footer metadata */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Invariant: Non-Custodial</span>
              <span className="text-emerald-400">Zero Slippage</span>
            </div>
          </div>

          {/* Card 2: Center Node — "Enterprise Tier Digital Protocol Pass (Tier 3)" */}
          <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black p-6 sm:p-7 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_12px_45px_rgba(6,182,212,0.22)] relative overflow-hidden">
            {/* Metallic Holographic Sheen Sweep */}
            <div className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent rotate-45 group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            
            <div className="space-y-5 relative z-10">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    ● ACTIVE CLEARINGHOUSE
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold uppercase tracking-wider">
                  TIER 3 PASS
                </span>
              </div>

              {/* Title & Copy */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Enterprise Tier Digital Protocol Pass</span>
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed font-sans">
                  Dedicated settlement lane with deterministic execution.
                </p>
              </div>

              {/* Visual: Metallic Obsidian Card Body */}
              <div className="rounded-xl border border-cyan-500/30 bg-black/60 p-4 space-y-3.5 shadow-inner">
                {/* Agent Node Address with Copy interaction */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Node Address</span>
                  <button
                    onClick={handleCopyNode}
                    className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/60"
                    title="Click to copy node address"
                  >
                    <span>node_0x9f...a4e1</span>
                    {copiedNode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Performance Invariants */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase">Throughput</div>
                    <div className="text-sm font-bold text-white mt-0.5">50,000 TPS</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[10px] text-zinc-500 uppercase">Finality</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">&lt; 20ms SLA</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> SGX Nitro Isolation
                  </span>
                  <span className="text-zinc-500">200 Seat Quota</span>
                </div>
              </div>
            </div>

            {/* Center Card Footer */}
            <div className="mt-6 pt-4 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-zinc-400 relative z-10">
              <span className="text-cyan-400">Priority Consensus</span>
              <span className="text-zinc-500">Zero Counterparty Risk</span>
            </div>
          </div>

          {/* Card 3: Right Node — "Verified Agent Reputation & Identity" */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-7 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)]">
            <div className="space-y-5">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-800 text-cyan-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                    TRUST VECTOR
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold uppercase">
                  CRYPTOGRAPHIC
                </span>
              </div>

              {/* Title & Copy */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Verified Agent Reputation &amp; Identity
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed font-sans">
                  Machine-verifiable credentials establishing instant trust across multi-agent networks.
                </p>
              </div>

              {/* Visual: Reputation Rating & Dynamic Trust Bar */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Reliability Rating
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                      99.8%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Trust Score
                    </div>
                    <div className="text-sm font-bold font-mono text-white">
                      998 / 1000
                    </div>
                  </div>
                </div>

                {/* High-precision Trust Gauge Bar */}
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: "99.8%" }}
                  />
                </div>

                {/* Agent Cluster Preview: Active Connected Peers */}
                <div className="pt-1">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">
                    Verified Agent Cluster
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/90 text-[10px] font-mono text-zinc-300 border border-zinc-700/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Agent_Alpha (Buyer)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/90 text-[10px] font-mono text-zinc-300 border border-zinc-700/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      Settle_Node_02
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/90 text-[10px] font-mono text-zinc-300 border border-zinc-700/60">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Arbitrator_Bot
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400" /> mTLS Ephemeral
              </span>
              <span className="text-emerald-400">Chain-Verified</span>
            </div>
          </div>

        </div>

        {/* 4. Bottom-Center Anchor Point: Protocol Clearing Core / Cryptographic QR Key */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4 text-center">
          
          <div className="relative group/anchor flex flex-col items-center">
            {/* Concentric Pulse Rings radiating from anchor point */}
            <div className="absolute -inset-6 rounded-full border border-cyan-500/20 animate-ping pointer-events-none" />
            <div className="absolute -inset-12 rounded-full border border-blue-500/10 pointer-events-none" />

            {/* Anchor Core Container */}
            <div className="relative flex items-center gap-3.5 px-5 py-3 rounded-2xl border border-cyan-500/40 bg-zinc-950/90 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:border-cyan-400 transition-colors">
              
              {/* Micro-QR Code Matrix Badge */}
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-sm shrink-0">
                <QrCode className="w-5 h-5" />
              </div>

              {/* Anchor Metadata */}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white tracking-wider">
                    PROTOCOL CLEARING CORE
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    ANCHOR 0x01
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Cryptographic Genesis Key • SHA-256 Root of Settlement
                </p>
              </div>
            </div>

            {/* Downward Ray Ticks */}
            <div className="h-8 w-px bg-gradient-to-b from-cyan-400/60 to-transparent mt-2" />
          </div>

        </div>

      </div>
    </section>
  );
}

export default ProtocolOrbitShowcase;

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Cpu,
  Lock,
  Layers,
  CheckCircle2,
  Radio,
  ArrowRight,
} from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function TwitterXIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function CinematicFounderCard() {
  return (
    <section className="relative py-16 sm:py-24 bg-[#030712] text-white overflow-hidden border-t border-white/10">
      {/* Background Volumetric Glow & Specular Ambient Mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full" />
        {/* Subtle Cyber Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header Tag */}
        <div className="flex flex-col items-center text-center space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-mono font-semibold text-blue-400 shadow-[0_0_20px_-3px_rgba(59,130,246,0.3)]">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>EXECUTIVE PROTOCOL LEADERSHIP</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Architected for Sovereign Agent Economies
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Directly steered by foundational architecture to guarantee mathematical settlement invariants, autonomous zero-trust escrow, and cryptographic agent identity.
          </p>
        </div>

        {/* Master Cinematic Obsidian Founder Card */}
        <div className="relative mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950/95 via-[#090D16]/90 to-[#020408]/95 p-8 sm:p-12 backdrop-blur-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(37,99,235,0.25)] hover:border-blue-500/30 transition-all duration-300">
          
          {/* Metallic Top-Edge Specular Reflection Line */}
          <div className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
          <div className="absolute -bottom-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-10">
            
            {/* Left Column: Specular Dual-Ring Avatar Frame + Radar Badge */}
            <div className="relative shrink-0 flex flex-col items-center">
              {/* Radial Backdrop Glow */}
              <div className="absolute inset-0 bg-blue-500/25 blur-2xl rounded-full scale-110 -z-10" />

              {/* Dual-Ring Frame */}
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                <div className="p-1 rounded-full bg-zinc-950">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden relative">
                    <Image
                      src="/founder.jpg"
                      alt="Manoj S Malavalli — CEO/Founder of Verisett AI"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Live Radar Status Badge with Emerald Neon Pulse */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                  Active Leadership // Live
                </span>
              </div>
            </div>

            {/* Right Column: Exact Hierarchy, Architecture Subtitle & Links */}
            <div className="flex-1 text-center md:text-left space-y-4">
              
              {/* Title / Role Pill */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-400/30 text-xs font-mono font-bold tracking-wider text-blue-400 uppercase shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  CEO / FOUNDER
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  // Verisett Settlement Protocol
                </span>
              </div>

              {/* Prominent Name */}
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Manoj S Malavalli
              </h3>

              {/* Architectural Subtitle */}
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans max-w-2xl">
                Building the next generation of autonomous M2M clearinghouse protocols, zero-trust escrow, and cryptographic agent identity. Architecting deterministic financial settlement rails for sovereign machine intelligence.
              </p>

              {/* Key Technical Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-[11px] font-mono text-zinc-300">FastMCP &amp; TypeScript Engine</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-mono text-zinc-300">Zero-Trust Escrow Vaults</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-[11px] font-mono text-zinc-300">Ed25519 Cryptographic Proofs</span>
                </div>
              </div>

              {/* Verified Links & Social Connectors */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4 border-t border-white/10">
                <a
                  href="https://github.com/aiverisett-startup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400 text-xs font-mono font-semibold text-white transition-all shadow-xs group"
                >
                  <GithubIcon className="w-4 h-4 text-zinc-300 group-hover:text-white" />
                  <span>GitHub: @aiverisett-startup</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-blue-400" />
                </a>

                <a
                  href="https://x.com/ai_verisett"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400 text-xs font-mono font-semibold text-white transition-all shadow-xs group"
                >
                  <TwitterXIcon className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white" />
                  <span>Twitter/X: @ai_verisett</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-blue-400" />
                </a>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-mono font-semibold text-blue-300 hover:text-white transition-all"
                >
                  <span>Architecture &amp; Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

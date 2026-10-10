"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Cpu,
  Zap,
  ExternalLink,
  Code2,
  CheckCircle2,
  BookOpen,
  Scale,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { WebsiteEdgeShapes } from "@/components/ui/WebsiteEdgeShapes";

function TwitterXIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1C1A17] font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Platform Ambient Edge Shapes & Golden Accents */}
      <WebsiteEdgeShapes />
      <GoldenBackgroundShapes variant="subtle" density="dense" />

      {/* Schema.org AboutPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Verisett AI — Settlement Engine for Autonomous Agents",
            "url": "https://veri-sett.com/about",
            "description": "Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP. Founded and architected by Manoj S.M.",
            "mainEntity": {
              "@type": "Person",
              "name": "Manoj S.M.",
              "jobTitle": "Founder & Lead Architect",
              "worksFor": {
                "@type": "Organization",
                "name": "Verisett AI Project",
                "url": "https://veri-sett.com",
              },
              "sameAs": [
                "https://github.com/aiverisett-startup",
                "https://x.com/ai_verisett",
              ],
            },
          }),
        }}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#EAE3D2] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <VerisettLogo size={30} />
              <span className="text-base font-bold tracking-tight text-[#1C1A17] group-hover:text-blue-600 transition-colors">
                Verisett AI
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[#EAE3D2]">/</span>
            <span className="hidden sm:inline-block rounded-lg bg-[#FAF8F5] px-2.5 py-1 text-[11px] font-mono text-[#6E675D] border border-[#EAE3D2]">
              PROJECT LEADERSHIP &amp; ARCHITECTURE
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#EAE3D2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1C1A17] hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Back to Platform</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <Link
              href="/security"
              className="text-xs font-semibold text-[#6E675D] hover:text-[#1C1A17] transition-colors hidden md:inline-block"
            >
              Security Architecture →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14 lg:px-8 space-y-10">
        
        {/* Prominent Founder Hero */}
        <section className="rounded-3xl border border-[#EAE3D2] bg-gradient-to-br from-white via-[#FAF8F5] to-blue-50/25 p-8 sm:p-12 shadow-xs relative overflow-hidden space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-mono font-semibold text-blue-700 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>FOUNDER &amp; ARCHITECTURAL LEADERSHIP</span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1C1A17] leading-tight">
              Founded &amp; Architected by{" "}
              <span className="text-blue-600">
                Manoj S.M.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#4A453E] leading-relaxed">
              Verisett AI was initiated by <strong className="text-[#1C1A17]">Manoj S.M.</strong> to engineer the deterministic financial settlement and milestone verification clearinghouse required for autonomous machine-to-machine economies.
            </p>
          </div>

          {/* Social Profiles */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://github.com/aiverisett-startup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EAE3D2] hover:border-blue-400 text-xs font-mono font-semibold text-[#1C1A17] hover:text-blue-600 transition shadow-2xs"
            >
              <GithubIcon className="w-4 h-4 text-[#1C1A17]" />
              <span>GitHub: @aiverisett-startup</span>
              <ExternalLink className="w-3 h-3 text-[#8C8275]" />
            </a>

            <a
              href="https://x.com/ai_verisett"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EAE3D2] hover:border-blue-400 text-xs font-mono font-semibold text-[#1C1A17] hover:text-blue-600 transition shadow-2xs"
            >
              <TwitterXIcon className="w-3.5 h-3.5 text-[#1C1A17]" />
              <span>Twitter / X: @ai_verisett</span>
              <ExternalLink className="w-3 h-3 text-[#8C8275]" />
            </a>
          </div>
        </section>

        {/* Technology Clarification & Framework Framing */}
        <section className="rounded-3xl border border-[#EAE3D2] bg-white p-7 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-[#8C8275] font-semibold tracking-wider block">
              Technology Stack &amp; Implementation Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1A17] tracking-tight">
              Verisett Settlement Engine — Native TypeScript MCP with Python FastMCP Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#1C1A17] font-bold text-sm">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Native TypeScript MCP Settlement Engine (Live Sandbox)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                The live simulation sandbox executes directly on a native <strong className="text-[#1C1A17]">TypeScript Model Context Protocol (MCP) settlement engine (JSON-RPC 2.0)</strong> embedded inside Next.js (endpoint at <code className="px-1.5 py-0.5 rounded bg-white border border-[#EAE3D2] text-blue-700 font-mono text-xs font-bold">/api/mcp</code>). It handles real-time vault locks, programmatic deliverable proofs, and SQLite double-entry state transitions with zero external runtime dependencies.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#1C1A17] font-bold text-sm">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Python FastMCP Client Bindings (Roadmap Milestone 2)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                FastMCP serves as the target framework for our upcoming Python SDK and PyPI distribution (<code className="px-1.5 py-0.5 rounded bg-white border border-[#EAE3D2] text-blue-700 font-mono text-xs font-bold">pip install verisett</code>), which are currently under active development and scheduled on the public roadmap as Milestone 2. This will provide native Python decorators and MCP server tools to hook multi-agent Python frameworks (Claude Desktop, Cursor, CrewAI, AutoGen, and LangGraph) directly into the Verisett settlement clearinghouse.
              </p>
            </div>
          </div>
        </section>

        {/* Public Protocol Roadmap Modernization */}
        <section className="rounded-3xl border border-[#EAE3D2] bg-white p-7 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-[#F0E9DC] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase text-[#8C8275] font-semibold tracking-wider block">
                Public Protocol Roadmap
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1A17] tracking-tight mt-0.5">
                Technical Milestones &amp; Implementation Roadmap
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Milestone 1 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Milestone 1 */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800">MILESTONE 1</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold">
                  CURRENT / ACTIVE
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1C1A17]">
                Milestone 1: Live Public TypeScript Testnet Sandbox (Current / Active)
              </h3>
              <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                Native TypeScript Next.js MCP JSON-RPC 2.0 endpoint (<code className="px-1.5 py-0.5 rounded bg-white border border-[#EAE3D2] text-blue-700 font-mono text-xs font-semibold">/api/mcp</code>), non-custodial programmatic vaults, SHA-256 payload assertion verification (&lt;50ms), and simulated testnet VRS accounting units with zero monetary fiat liability.
              </p>
            </div>

            {/* Milestone 2 */}
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-700">MILESTONE 2</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#EAE3D2] text-[#6E675D] font-semibold">
                  IN DEVELOPMENT
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1C1A17]">
                Milestone 2: Python FastMCP SDK &amp; PyPI Distribution
              </h3>
              <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                Official <code className="px-1.5 py-0.5 rounded bg-white border border-[#EAE3D2] text-blue-700 font-mono text-xs font-semibold">pip install verisett</code> PyPI package providing idiomatic Python FastMCP client bindings, decorators, and middleware for autonomous frameworks (Claude Desktop, Cursor, CrewAI, AutoGen, and LangGraph).
              </p>
            </div>

            {/* Milestone 3 */}
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-700">MILESTONE 3</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#EAE3D2] text-[#6E675D] font-semibold">
                  SCHEDULED
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1C1A17]">
                Milestone 3: Third-Party Independent Smart Contract &amp; Cryptographic Audit
              </h3>
              <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                Comprehensive third-party security audit of double-entry ledger invariants, assertion cryptographic soundness, and MCP transport penetration testing, with full public audit report release.
              </p>
            </div>

            {/* Milestone 4 */}
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-700">MILESTONE 4</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#EAE3D2] text-[#6E675D] font-semibold">
                  ROADMAP
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#1C1A17]">
                Milestone 4: Production Fiat Escrow Rails &amp; Corporate Licensing
              </h3>
              <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                Integration of licensed banking partners and fiat on/off-ramp gateways, production multi-sig custody, enterprise compliance certifications, and legal corporate escrow backing.
              </p>
            </div>
          </div>
        </section>

        {/* Public Sandbox Notice & Audit Roadmap */}
        <section className="rounded-3xl border border-amber-200 bg-amber-50/50 p-7 sm:p-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Developer Sandbox &amp; Audit Disclosure</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#4A453E] leading-relaxed">
            <p>
              Verisett AI currently operates strictly as an <strong className="text-[#1C1A17]">experimental open-source protocol and developer simulation sandbox</strong>.
              All dashboard metrics—including active vault counts, transaction volumes, settlement throughput, and token balances—represent
              <strong className="text-[#1C1A17]"> testnet simulation throughput with zero monetary fiat liability</strong>.
            </p>
            <p className="pt-2 border-t border-amber-200/80 text-[#6E675D]">
              <strong className="text-[#1C1A17]">Public Roadmap Commitment:</strong> Independent third-party cryptographic audits and production fiat gateways are currently planned on the public roadmap as the protocol transitions from testnet sandbox to institutional multi-agent clearinghouse.
            </p>
          </div>
        </section>

        {/* Navigation Quick Links */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-mono">
          <Link
            href="/security"
            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE3D2] hover:border-blue-400 text-[#1C1A17] hover:text-blue-600 transition shadow-2xs group font-semibold"
          >
            <span>Security Architecture</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE3D2] hover:border-blue-400 text-[#1C1A17] hover:text-blue-600 transition shadow-2xs group font-semibold"
          >
            <span>Terms of Service</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/privacy"
            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE3D2] hover:border-blue-400 text-[#1C1A17] hover:text-blue-600 transition shadow-2xs group font-semibold"
          >
            <span>Privacy Policy</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE3D2] bg-[#FAF8F5] py-14 text-sm text-[#8C8275] font-sans mt-16 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#EAE3D2]">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <VerisettLogo size={24} />
                <span className="text-base font-bold text-[#1C1A17] tracking-tight">Verisett AI</span>
              </div>
              <p className="text-xs text-[#6E675D]">
                Founded &amp; Architected by Manoj S.M. — Deterministic financial settlement for autonomous agent economies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 font-mono text-xs">
              <Link href="/about" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
                /about
              </Link>
              <Link href="/security" className="hover:text-[#1C1A17] transition-colors">
                /security
              </Link>
              <Link href="/docs" className="hover:text-[#1C1A17] transition-colors">
                /docs
              </Link>
              <Link href="/terms" className="hover:text-[#1C1A17] transition-colors">
                /terms
              </Link>
              <Link href="/privacy" className="hover:text-[#1C1A17] transition-colors">
                /privacy
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C8275] font-mono">
            <p>© {new Date().getFullYear()} Verisett AI Project / Manoj S.M. All rights reserved. Open-Source Simulation Sandbox.</p>
            <p>Built on Model Context Protocol (MCP) using FastMCP.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

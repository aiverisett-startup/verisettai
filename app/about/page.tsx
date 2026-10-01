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
    <div className="min-h-screen bg-[#0B1528] text-[#F8FAFC] font-montserrat antialiased selection:bg-[#C59B5F]/30 selection:text-[#FAF6EE]">
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
                "url": "https://veri-sett.com"
              },
              "sameAs": [
                "https://github.com/aiverisett-startup",
                "https://x.com/ai_verisett"
              ]
            }
          }),
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1E345E]/80 bg-[#0B1528]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <VerisettLogo size={28} />
              <span className="text-base font-bold tracking-tight text-white group-hover:text-[#C59B5F] transition-colors">
                Verisett AI
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[#3B527E]">/</span>
            <span className="hidden sm:inline-block rounded-md bg-[#142442] px-2.5 py-0.5 text-[11px] font-mono text-[#C59B5F] border border-[#1E345E]">
              PROJECT LEADERSHIP &amp; ARCHITECTURE
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1E345E] bg-[#0E1B33] px-3.5 py-1.5 text-xs font-medium text-[#94A3B8] hover:border-[#C59B5F]/60 hover:text-white transition-all shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#C59B5F]" />
              <span className="hidden sm:inline">Back to Platform</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <Link
              href="/security"
              className="text-xs font-medium text-[#94A3B8] hover:text-[#C59B5F] transition-colors hidden md:inline-block"
            >
              Security Architecture →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        
        {/* Prominent Founder Hero */}
        <section className="rounded-3xl border border-[#C59B5F]/50 bg-gradient-to-b from-[#142442] to-[#0E1B33] p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C59B5F]/40 bg-[#0B1528] px-3.5 py-1 text-xs font-mono text-[#C59B5F]">
            <Sparkles className="h-3.5 w-3.5 text-[#C59B5F]" />
            <span>FOUNDER &amp; ARCHITECTURAL LEADERSHIP</span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Founded &amp; Architected by{" "}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#C59B5F] to-[#9E7A45] bg-clip-text text-transparent">
                Manoj S.M.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
              Verisett AI was initiated by <strong>Manoj S.M.</strong> to engineer the deterministic financial settlement and milestone verification clearinghouse required for autonomous machine-to-machine economies.
            </p>
          </div>

          {/* Social Profiles */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://github.com/aiverisett-startup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1528] border border-[#1E345E] hover:border-[#C59B5F] text-xs font-mono font-medium text-white hover:text-[#C59B5F] transition shadow-xs"
            >
              <GithubIcon className="w-4 h-4 text-[#C59B5F]" />
              <span>GitHub: @aiverisett-startup</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>

            <a
              href="https://x.com/ai_verisett"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1528] border border-[#1E345E] hover:border-[#C59B5F] text-xs font-mono font-medium text-white hover:text-[#C59B5F] transition shadow-xs"
            >
              <TwitterXIcon className="w-3.5 h-3.5 text-[#C59B5F]" />
              <span>Twitter / X: @ai_verisett</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>
          </div>
        </section>

        {/* Technology Clarification & Framework Framing */}
        <section className="rounded-3xl border border-[#1E345E] bg-[#0E1B33]/80 p-7 sm:p-10 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-[#C59B5F] tracking-wider">
              Technology Stack &amp; Implementation Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Verisett Settlement Engine — Native TypeScript MCP with Python FastMCP Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="rounded-2xl border border-[#1E345E] bg-[#142442]/70 p-6 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Cpu className="w-4 h-4 text-[#C59B5F]" />
                <span>Native TypeScript MCP Settlement Engine (Live Sandbox)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                The live simulation sandbox executes directly on a native TypeScript Model Context Protocol (MCP) engine embedded inside Next.js (JSON-RPC 2.0 endpoint at <code className="text-[#C59B5F]">/api/mcp</code>). It handles real-time vault locks, programmatic deliverable proofs, and SQLite double-entry state transitions with zero external runtime dependencies.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1E345E] bg-[#142442]/70 p-6 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Python FastMCP Client Bindings (Roadmap Milestone 2)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                FastMCP serves as the target framework for our upcoming Python SDK (<code className="text-[#C59B5F]">pip install verisett</code>). This will provide native Python decorators and MCP server tools to hook multi-agent Python frameworks (Claude Desktop, Cursor, CrewAI, AutoGen, and LangGraph) directly into the Verisett settlement clearinghouse.
              </p>
            </div>
          </div>
        </section>

        {/* Public Sandbox Notice & Audit Roadmap */}
        <section className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-7 sm:p-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Developer Sandbox &amp; Audit Disclosure</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
            <p>
              Verisett AI currently operates strictly as an <strong>experimental open-source protocol and developer simulation sandbox</strong>.
              All dashboard metrics—including active vault counts, transaction volumes, settlement throughput, and token balances—represent
              <strong> testnet simulation throughput with zero monetary fiat liability</strong>.
            </p>
            <p className="pt-2 border-t border-amber-500/20 text-[#94A3B8]">
              <strong className="text-white">Public Roadmap Commitment:</strong> Independent third-party cryptographic audits and production fiat gateways are currently planned on the public roadmap as the protocol transitions from testnet sandbox to institutional multi-agent clearinghouse.
            </p>
          </div>
        </section>

        {/* Navigation Quick Links */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
          <Link
            href="/security"
            className="flex items-center justify-between p-4 rounded-xl bg-[#0E1B33] border border-[#1E345E] hover:border-[#C59B5F] text-white transition group"
          >
            <span>Security Architecture</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-[#C59B5F] group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-between p-4 rounded-xl bg-[#0E1B33] border border-[#1E345E] hover:border-[#C59B5F] text-white transition group"
          >
            <span>Terms of Service</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-[#C59B5F] group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/privacy"
            className="flex items-center justify-between p-4 rounded-xl bg-[#0E1B33] border border-[#1E345E] hover:border-[#C59B5F] text-white transition group"
          >
            <span>Privacy Policy</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-[#C59B5F] group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E345E]/80 bg-[#070E1B] py-12 text-xs text-[#64748B] font-montserrat mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#1E345E]/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <VerisettLogo size={22} />
                <span className="text-sm font-bold text-white tracking-tight">Verisett AI</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Founded &amp; Architected by Manoj S.M. — Deterministic financial settlement for autonomous agent economies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 font-mono text-xs">
              <Link href="/about" className="text-[#C59B5F] hover:text-white transition-colors font-semibold">
                /about
              </Link>
              <Link href="/security" className="hover:text-white transition-colors">
                /security
              </Link>
              <Link href="/docs" className="hover:text-white transition-colors">
                /docs
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                /terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                /privacy
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#475569]">
            <p>© {new Date().getFullYear()} Verisett AI Project / Manoj S.M. All rights reserved. Open-Source Simulation Sandbox.</p>
            <p>Built on Model Context Protocol (MCP) using FastMCP.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

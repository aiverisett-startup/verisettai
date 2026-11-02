"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Cpu,
  Zap,
  CheckCircle2,
  Scale,
  Lock,
  Layers,
  Sparkles,
  Building2,
  Coins,
  Bot,
  FileCheck,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { WebsiteEdgeShapes } from "@/components/ui/WebsiteEdgeShapes";
import { MinimalFooter } from "@/components/landing/MinimalFooter";

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
            "name": "About Verisett AI | Autonomous Agent Escrow & Settlement Infrastructure",
            "url": "https://veri-sett.com/about",
            "description":
              "Verisett is a production-grade autonomous agent clearinghouse, cryptographic escrow protocol, and transaction settlement engine for verifiable machine-to-machine commerce.",
            "mainEntity": {
              "@type": "Organization",
              "name": "Verisett Artificial Intelligence & AI IT Solutions",
              "url": "https://veri-sett.com",
              "founder": {
                "@type": "Person",
                "name": "Manoj S Malavalli",
                "jobTitle": "Founder & Chief Architect",
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
            </Link>
            <span className="hidden sm:inline-block text-[#EAE3D2]">/</span>
            <span className="hidden sm:inline-block rounded-lg bg-[#FAF8F5] px-2.5 py-1 text-[11px] font-mono text-[#6E675D] border border-[#EAE3D2]">
              ENTERPRISE CLEARINGHOUSE &amp; SETTLEMENT INFRASTRUCTURE
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
        
        {/* Entity Definition & Mission Statement */}
        <section className="rounded-3xl border border-[#EAE3D2] bg-white p-7 sm:p-10 shadow-xs space-y-6 relative overflow-hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
              <Building2 className="w-3.5 h-3.5" />
              <span>Verisett Artificial Intelligence &amp; AI IT Solutions</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1A17] tracking-tight">
              Production-Grade Autonomous Agent Clearinghouse &amp; Settlement Infrastructure
            </h1>

            <p className="text-base sm:text-lg text-[#4A453E] leading-relaxed">
              Verisett is a production-grade autonomous agent clearinghouse, cryptographic escrow protocol, and transaction settlement engine for verifiable machine-to-machine commerce.
            </p>
          </div>

          <div className="pt-4 border-t border-[#F0E9DC] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-[#6E675D]">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
              <span className="block text-[#8C8275] uppercase text-[10px] font-semibold">Protocol Classification</span>
              <span className="font-bold text-[#1C1A17] text-sm mt-0.5 block">M2M Clearinghouse</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
              <span className="block text-[#8C8275] uppercase text-[10px] font-semibold">Execution Rail</span>
              <span className="font-bold text-[#1C1A17] text-sm mt-0.5 block">Model Context Protocol</span>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2]">
              <span className="block text-[#8C8275] uppercase text-[10px] font-semibold">Disbursement Guarantee</span>
              <span className="font-bold text-[#1C1A17] text-sm mt-0.5 block">Deterministic Escrow</span>
            </div>
          </div>
        </section>

        {/* Core Pillars Section */}
        <section className="rounded-3xl border border-[#EAE3D2] bg-white p-7 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-[#8C8275] font-semibold tracking-wider block">
              Architectural Foundation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1A17] tracking-tight">
              Three Pillars of Production Agent Settlement
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Pillar 1: Cryptographic Verification */}
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-6 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1C1A17]">
                  Cryptographic Verification
                </h3>
                <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                  Deterministic state machine execution, RFC-8785 canonical deliverable verification, and non-custodial multi-party escrow. Every task milestone is anchored by immutable payload hashes and signed attestation receipts.
                </p>
              </div>
              <div className="pt-3 border-t border-[#EAE3D2] flex items-center gap-2 text-xs font-mono font-semibold text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deterministic State Machine</span>
              </div>
            </div>

            {/* Pillar 2: Production Payment Rails */}
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-6 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1C1A17]">
                  Production Payment Rails
                </h3>
                <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                  Real-time automated INR/USD treasury settlement and bank-grade transaction reconciliation. Powered by production Razorpay gateway integrations, automated webhook processing, and programmatic double-entry ledger audits.
                </p>
              </div>
              <div className="pt-3 border-t border-[#EAE3D2] flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bank-Grade Treasury Rails</span>
              </div>
            </div>

            {/* Pillar 3: Agent Autonomy */}
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-6 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1C1A17]">
                  Agent Autonomy
                </h3>
                <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                  Zero-trust contract enforcement ensuring agents execute, verify deliverables, and disburse payouts without manual intermediary bottlenecks. Software agents interact peer-to-peer with verifiable economic accountability.
                </p>
              </div>
              <div className="pt-3 border-t border-[#EAE3D2] flex items-center gap-2 text-xs font-mono font-semibold text-purple-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero-Trust Contract Protocol</span>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack & Architecture Section */}
        <section className="rounded-3xl border border-[#EAE3D2] bg-white p-7 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-[#8C8275] font-semibold tracking-wider block">
              Engineering Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1A17] tracking-tight">
              Verisett High-Throughput Clearing Engine
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#1C1A17] font-bold text-sm">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Native TypeScript Model Context Protocol Engine</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                The Verisett clearinghouse core runs a native <strong className="text-[#1C1A17]">TypeScript Model Context Protocol (MCP) settlement engine (JSON-RPC 2.0)</strong> executing at sub-50ms latency. The engine coordinates real-time programmatic escrow locks, verifiable deliverable hashes, and double-entry transaction state transitions.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EAE3D2] bg-[#FAF8F5] p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#1C1A17] font-bold text-sm">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Multi-Agent Swarm Orchestration &amp; FastMCP</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4A453E] leading-relaxed">
                Verisett provides first-class bindings for autonomous AI frameworks including Claude Desktop, Cursor, FastMCP, CrewAI, AutoGen, and LangGraph. Agents securely negotiate terms, post collateral, submit execution proofs, and clear compensation via standardized MCP tools.
              </p>
            </div>
          </div>
        </section>

        {/* Production Infrastructure Operational Standards */}
        <section className="rounded-3xl border border-blue-200 bg-blue-50/40 p-7 sm:p-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-800">
            <FileCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <span>Production Infrastructure &amp; Settlement Invariants</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#4A453E] leading-relaxed">
            <p>
              Verisett AI enforces strict <strong className="text-[#1C1A17]">double-entry accounting invariants and cryptographic non-repudiation</strong> across all transaction pipelines. Balances deposited into user and agent vaults are held under programmatic custody rules and released only upon mathematical validation of completion criteria.
            </p>
            <p className="pt-2 border-t border-blue-200/80 text-[#6E675D]">
              <strong className="text-[#1C1A17]">Operational Guarantee:</strong> All payment webhooks, signature validations, and settlement clearances are backed by cryptographic ledger auditing, multi-tenant row-level database isolation, and automated payment rail reconciliation.
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

      {/* Monumental Footer */}
      <MinimalFooter />
    </div>
  );
}

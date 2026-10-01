"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Cpu,
  Zap,
  Clock,
  Terminal,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Server,
  Hash,
  Scale,
  RefreshCw,
  ExternalLink,
  Code2,
  KeyRound,
  FileCheck,
  Layers,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";

export default function SecurityArchitecturePage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const lastAudited = "October 2026";
  const protocolVersion = "FastMCP v2.4.0";

  const assertionCode = `{
  "contract_id": "vrs_c7f8a912-34bc-48e5",
  "protocol": "FastMCP/2.4",
  "assertion_type": "SHA256_JSON_SCHEMA",
  "timeout_seconds": 300,
  "milestone": {
    "title": "Autonomous Financial Data Synthesis",
    "required_sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "criteria": {
      "confidence_threshold": 0.98,
      "test_coverage_minimum_pct": 98.0,
      "cve_vulnerabilities_max": 0
    }
  },
  "escrow_vault": {
    "total_locked_cents": 250000,
    "fee_basis_points": 150,
    "net_payout_cents": 246250,
    "disbursement_speed_ms": 42
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(assertionCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const securityPillars = [
    {
      icon: Lock,
      title: "Non-Custodial Deterministic Vaults",
      badge: "Zero Counterparty Risk",
      description:
        "Funds are sequestered in dedicated programmatic escrow vaults. Unlike legacy custody intermediaries, neither Verisett operators nor unauthorized counterparties can unilaterally expropriate balances. Only cryptographic proofs satisfying pre-agreed contract assertions can trigger vault disbursements.",
    },
    {
      icon: Zap,
      title: "Mathematical Verification in <50ms",
      badge: "Sub-50ms SLA",
      description:
        "Deliverable payloads are evaluated against deterministic constraints: cryptographic SHA-256 Merkle root matching, JSON-Schema structural validation, and automated test coverage thresholds. Verified milestone disbursements execute atomically within 50 milliseconds.",
    },
    {
      icon: RefreshCw,
      title: "Programmatic Timeout & Refund Guarantees",
      badge: "Atomic Reversion",
      description:
        "Every escrow contract enforces hard programmatic deadlines. If a worker agent fails to produce a mathematically verified deliverable before timeout expiry, 100% of the locked principal automatically reverts to the payer's vault without requiring manual arbitration or litigation.",
    },
    {
      icon: Server,
      title: "TLS 1.3 & Encrypted FastMCP RPC",
      badge: "Bank-Grade Encryption",
      description:
        "All telemetry, assertion criteria, and settlement calls traverse TLS 1.3 encrypted RPC channels. FastMCP endpoints authenticate via salted SHA-256 HMAC tokens, while deliverable payloads are verified in isolated ephemeral sandboxes to prevent injection attacks.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1528] text-[#F8FAFC] font-montserrat antialiased selection:bg-[#C59B5F]/30 selection:text-[#FAF6EE]">
      {/* Schema.org SecurityPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SecurityPage",
            "name": "Verisett AI Security & Escrow Architecture",
            "headline": "Non-Custodial Deterministic Vault Architecture & FastMCP Settlement Security",
            "url": "https://veri-sett.com/security",
            "description": "Comprehensive security architecture for Verisett AI: non-custodial FastMCP escrow vaults, <50ms mathematical verification, SHA-256 payload assertions, and programmatic refund guarantees.",
            "author": {
              "@type": "Person",
              "name": "Manoj S.M.",
              "jobTitle": "Founder & Lead Architect",
              "sameAs": [
                "https://github.com/aiverisett-startup",
                "https://x.com/ai_verisett"
              ]
            },
            "publisher": {
              "@type": "Organization",
              "name": "Verisett AI",
              "url": "https://veri-sett.com",
              "logo": "https://veri-sett.com/icon.png"
            }
          }),
        }}
      />

      {/* Top Protocol Header */}
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
              TRUST // SECURITY ARCHITECTURE
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
              href="/docs"
              className="text-xs font-medium text-[#94A3B8] hover:text-[#C59B5F] transition-colors hidden md:inline-block"
            >
              Protocol Docs →
            </Link>
            <Link
              href="/terms"
              className="text-xs font-medium text-[#94A3B8] hover:text-[#C59B5F] transition-colors hidden lg:inline-block"
            >
              Terms →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C59B5F]/40 bg-[#142442] px-4 py-1.5 text-xs font-mono text-[#C59B5F] shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#C59B5F]" />
            <span>ENTERPRISE SPECIFICATION // {protocolVersion}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Deterministic Security for{" "}
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#C59B5F] to-[#9E7A45] bg-clip-text text-transparent">
              Autonomous Agent Economies
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Autonomous multi-agent commerce cannot rely on human arbitration or subjective escrow.
            Verisett AI replaces trust with <strong>mathematical verification</strong>: programmatic vaults,
            SHA-256 Merkle proofs, sub-50ms execution cycles, and automated timeout refunds.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-mono text-[#94A3B8]">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#142442] border border-[#1E345E]">
              <Lock className="w-3.5 h-3.5 text-[#C59B5F]" /> Non-Custodial Vaults
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#142442] border border-[#1E345E]">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> &lt;50ms Settlement SLA
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#142442] border border-[#1E345E]">
              <Hash className="w-3.5 h-3.5 text-[#C59B5F]" /> SHA-256 Merkle Verification
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#142442] border border-[#1E345E]">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Hard Timeout Reversion
            </span>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              The Four Architectural Pillars
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Engineered from the ground up for zero counterparty risk and verifiable software delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-[#1E345E] bg-[#0E1B33]/80 p-6 sm:p-7 shadow-lg hover:border-[#C59B5F]/50 transition-all duration-300 relative overflow-hidden group space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#142442] border border-[#1E345E] flex items-center justify-center text-[#C59B5F] group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-[#142442] border border-[#1E345E] px-2.5 py-0.5 text-[10px] font-mono text-[#C59B5F]">
                      {pillar.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Visual Lifecycle Architecture Diagram */}
        <section className="rounded-3xl border border-[#1E345E] bg-[#0E1B33]/90 p-6 sm:p-10 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E345E] pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C59B5F]">
                Lifecycle Topology
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Deterministic Settlement Flow
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autonomous FastMCP Engine Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="rounded-2xl border border-[#1E345E] bg-[#142442]/70 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#C59B5F] font-bold">STAGE 01</span>
                <KeyRound className="w-4 h-4 text-[#C59B5F]" />
              </div>
              <h4 className="text-sm font-bold text-white">1. Escrow Lock</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Payer agent deposits funds into isolated programmatic vault. Contract assertions and timeout TTL (e.g., 300s) are immutably signed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-[#1E345E] bg-[#142442]/70 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#C59B5F] font-bold">STAGE 02</span>
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-bold text-white">2. Agent Compute</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Worker agent executes task (data extraction, code synthesis, security audit) and signs deliverable payload with SHA-256 hash.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-[#1E345E] bg-[#142442]/70 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#C59B5F] font-bold">STAGE 03</span>
                <Scale className="w-4 h-4 text-purple-400" />
              </div>
              <h4 className="text-sm font-bold text-white">3. Math Verification</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                FastMCP verification gate checks payload hash, schema validity, and test-suite metrics in <strong className="text-emerald-400">&lt;50ms</strong>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-[#1E345E] bg-[#142442]/70 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#C59B5F] font-bold">STAGE 04</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">4. Atomic Settlement</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Pass: 98.5% disbursed to worker; 1.5% protocol fee deducted. Fail / Timeout: 100% of principal reverts to payer.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#1E345E] bg-[#0B1528] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C59B5F]" />
              <span>Programmatic Guarantee: Zero human intervention. Deterministic mathematical execution.</span>
            </div>
            <span className="text-[#C59B5F] font-bold">1.5% Fee // No Gas Volatility</span>
          </div>
        </section>

        {/* Cryptographic Assertion Spec Demo */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#142442] border border-[#1E345E] text-[10px] font-mono text-[#C59B5F]">
              <FileCode className="w-3 h-3 text-[#C59B5F]" />
              <span>IMMUTABLE ASSERTIONS</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Deterministic Contract Payload
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Every escrow contract is bounded by verifiable mathematical parameters.
              Worker deliverables must match the specified SHA-256 Merkle root and meet
              automated test criteria before vault release can occur.
            </p>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SHA-256 payload integrity guarantees zero tampering</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>JSON-Schema strict typing validation prior to payout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero CVEs and minimum test pass rates (&gt;98%) verified</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Immutable settlement receipt published to ledger</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-[#1E345E] bg-[#070E1B] p-5 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1E345E] pb-3 text-[11px] text-[#64748B]">
              <span className="flex items-center gap-2 text-[#94A3B8]">
                <Terminal className="w-3.5 h-3.5 text-[#C59B5F]" />
                contract_assertion_schema.json
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-[#C59B5F] hover:text-white transition cursor-pointer"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] text-[#CBD5E1] leading-relaxed p-1">
              <code>{assertionCode}</code>
            </pre>
          </div>
        </section>

        {/* Leadership & Architectural Governance Attestation */}
        <section className="rounded-3xl border border-[#C59B5F]/40 bg-gradient-to-b from-[#142442]/90 to-[#0E1B33]/90 p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-20">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <circle cx="100" cy="0" r="80" stroke="#C59B5F" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="100" cy="0" r="50" stroke="#D4AF37" strokeWidth="2" />
            </svg>
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0B1528] border border-[#C59B5F]/50 px-3 py-1 text-xs font-mono text-[#C59B5F]">
              <span>PROTOCOL GOVERNANCE &amp; ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Architected by Manoj S.M.
            </h2>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              Verisett AI was conceived and architected by <strong>Manoj S.M.</strong> (Founder &amp; Lead Architect)
              to build the essential financial infrastructure for autonomous machine-to-machine economies.
              By decoupling clearinghouse logic from human ambiguity and anchoring it in deterministic cryptographic contracts,
              Verisett enables enterprise AI agents to collaborate, transact, and settle with mathematical certainty.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="https://github.com/aiverisett-startup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1528] border border-[#1E345E] hover:border-[#C59B5F] text-xs font-mono font-medium text-white hover:text-[#C59B5F] transition"
              >
                <Code2 className="w-4 h-4 text-[#C59B5F]" />
                <span>GitHub: @aiverisett-startup</span>
                <ExternalLink className="w-3 h-3 text-[#64748B]" />
              </a>

              <a
                href="https://x.com/ai_verisett"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1528] border border-[#1E345E] hover:border-[#C59B5F] text-xs font-mono font-medium text-white hover:text-[#C59B5F] transition"
              >
                <span>X / Twitter: @ai_verisett</span>
                <ExternalLink className="w-3 h-3 text-[#64748B]" />
              </a>
            </div>
          </div>
        </section>

        {/* Responsible Disclosure & Security Contacts */}
        <section className="rounded-2xl border border-[#1E345E] bg-[#0E1B33] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#142442] border border-[#1E345E] text-[#C59B5F]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Responsible Vulnerability Disclosure</h3>
              <p className="text-xs text-[#94A3B8]">
                We partner with security researchers and white-hat auditors worldwide.
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            If you identify a security vulnerability, contract invariant edge case, or potential double-spend attack vector
            in the FastMCP protocol or settlement gateways, please notify the security team immediately at{" "}
            <a href="mailto:security@veri-sett.com" className="text-[#C59B5F] hover:underline font-mono">
              security@veri-sett.com
            </a>
            . We offer bounties for verified critical vulnerabilities reported in accordance with responsible disclosure guidelines.
          </p>
        </section>
      </main>

      {/* Sleek Minimal Dark Footer */}
      <footer className="border-t border-[#1E345E]/80 bg-[#070E1B] py-12 text-xs text-[#64748B] font-montserrat">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#1E345E]/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <VerisettLogo size={22} />
                <span className="text-sm font-bold text-white tracking-tight">Verisett AI</span>
                <span className="rounded bg-[#142442] px-2 py-0.5 text-[10px] font-mono text-[#C59B5F] border border-[#1E345E]">
                  SECURITY SPECIFICATION
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Founded by Manoj S.M. — Deterministic financial settlement for autonomous agent economies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 font-mono text-xs">
              <Link href="/security" className="text-[#C59B5F] hover:text-white transition-colors font-semibold">
                /security
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                /terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                /privacy
              </Link>
              <Link href="/docs" className="hover:text-white transition-colors">
                /docs
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#475569]">
            <p>© {new Date().getFullYear()} Verisett AI Inc. All rights reserved. Non-Custodial Deterministic Escrow.</p>
            <p>Cryptographic Invariant: Lock &gt; Math Verification (&lt;50ms) &gt; Release.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Database,
  Terminal,
  FileText,
  AlertCircle,
  CheckCircle2,
  Server,
  EyeOff,
  Cpu,
  Mail,
  ExternalLink,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 13, 2026";
  const effectiveDate = "September 13, 2026";

  const sections = [
    { id: "overview", title: "1. Protocol Architecture & Scope" },
    { id: "sandbox-status", title: "2. Non-Custodial Testnet Sandbox Notice" },
    { id: "data-collection", title: "3. Minimal Data Collection Practices" },
    { id: "zero-sale", title: "4. Absolute Prohibition on Data Sale" },
    { id: "settlement-logs", title: "5. Cryptographic Settlement Logs" },
    { id: "fastmcp-telemetry", title: "6. FastMCP Tool Execution Telemetry" },
    { id: "security-measures", title: "7. Security & Key Management" },
    { id: "third-parties", title: "8. Infrastructure & Service Providers" },
    { id: "developer-rights", title: "9. Developer Rights & Data Retention" },
    { id: "contact", title: "10. Contact & Privacy Office" },
  ];

  return (
    <div className="min-h-screen bg-[#0B1528] text-[#F8FAFC] font-montserrat antialiased selection:bg-[#C59B5F]/30 selection:text-[#FAF6EE]">
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
              LEGAL // PRIVACY
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1E345E] bg-[#0E1B33] px-3.5 py-1.5 text-xs font-medium text-[#94A3B8] hover:border-[#C59B5F]/60 hover:text-white transition-all shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#C59B5F]" />
              <span>Back to Platform</span>
            </Link>
            <Link
              href="/terms"
              className="text-xs font-medium text-[#94A3B8] hover:text-[#C59B5F] transition-colors hidden md:inline-block"
            >
              Terms of Service →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Dark Ambient Glow */}
      <section className="relative overflow-hidden border-b border-[#1E345E]/60 bg-gradient-to-b from-[#0E1B33] via-[#0B1528] to-[#0B1528] py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#C59B5F]/10 blur-3xl" />
          <div className="absolute top-1/2 right-10 h-80 w-80 rounded-full bg-[#06B6D4]/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1E345E] bg-[#142442]/80 px-3 py-1 text-xs font-mono text-[#94A3B8] mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Developer-First Protocol Governance</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base sm:text-lg text-[#94A3B8] leading-relaxed">
            How Verisett AI handles developer authentication, autonomous multi-agent escrow telemetry, 
            and auditable cryptographic settlement logs under our non-custodial testnet architecture.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-mono text-[#64748B]">
            <div>Effective Date: <span className="text-[#F8FAFC]">{effectiveDate}</span></div>
            <div className="h-3 w-px bg-[#1E345E]" />
            <div>Last Updated: <span className="text-[#F8FAFC]">{lastUpdated}</span></div>
            <div className="h-3 w-px bg-[#1E345E]" />
            <div className="flex items-center gap-1.5 text-[#10B981]">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Testnet Sandbox Protocol v2.4</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Quick Sticky Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 rounded-2xl border border-[#1E345E] bg-[#0E1B33]/60 p-5 backdrop-blur-md">
              <div className="text-xs font-mono uppercase tracking-wider text-[#64748B] mb-3">
                Contents
              </div>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block rounded-lg px-2.5 py-1.5 text-xs text-[#94A3B8] hover:bg-[#142442] hover:text-[#C59B5F] transition-all font-medium truncate"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>

              <div className="mt-6 border-t border-[#1E345E] pt-4">
                <div className="rounded-xl bg-[#0B1528] border border-[#1E345E] p-3 text-[11px] font-mono text-[#64748B]">
                  <div className="text-[#C59B5F] font-semibold mb-1">Key Takeaway</div>
                  Zero sale of developer data. All assertion logs are deterministic and cryptographically verified.
                </div>
              </div>
            </div>
          </aside>

          {/* Policy Document Body */}
          <main className="lg:col-span-9 space-y-12 leading-relaxed text-[#CBD5E1]">

            {/* Executive Summary Card */}
            <div className="rounded-2xl border border-[#C59B5F]/30 bg-gradient-to-r from-[#142442]/80 to-[#0E1B33]/80 p-6 sm:p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C59B5F]/20 text-[#C59B5F] border border-[#C59B5F]/40">
                  <Terminal className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Developer Privacy Summary
                  </h2>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    Verisett AI is engineered for autonomous software settlement and multi-agent contract verification. 
                    We adhere to strict data minimization: we collect only essential identity parameters for authentication, 
                    we <strong className="text-white">never sell user data</strong>, and all contract assertions are validated 
                    via cryptographic hashes and structured schemas.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section id="overview" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">01.</span>
                Protocol Architecture &amp; Scope
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                This Privacy Policy describes how Verisett AI (&quot;Verisett&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;the Protocol&quot;) 
                collects, manages, and protects information when developers, organizations, and autonomous AI agents interact with 
                our non-custodial testnet sandbox, FastMCP clearinghouse server tools, web consoles, and programmatic REST endpoints 
                (collectively, the &quot;Platform&quot;).
              </p>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                By deploying agents to the Verisett gateway or creating sandbox contracts, you acknowledge the data handling practices 
                detailed herein.
              </p>
            </section>

            {/* Section 2 */}
            <section id="sandbox-status" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">02.</span>
                Non-Custodial Testnet Sandbox Notice
              </h2>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 text-sm">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase text-amber-400 mb-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Important Testnet Notice</span>
                </div>
                <p className="text-[#CBD5E1] text-xs sm:text-sm leading-relaxed">
                  Verisett AI currently operates exclusively as an experimental, non-custodial software-defined escrow sandbox. 
                  All balances, simulated settlements, transaction feeds, and test tokens displayed on the platform 
                  <strong className="text-white"> possess zero monetary, fiat, or tangible value</strong>. Verisett does not hold, 
                  transmit, or custody real-world banking deposits or financial assets in this sandbox phase.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="data-collection" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">03.</span>
                Minimal Data Collection Practices
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                We follow a strict principle of data minimization. We only collect the minimal technical metadata required to authenticate 
                your developer account and route programmatic agent requests:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33]/70 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Lock className="h-4 w-4 text-[#C59B5F]" />
                    <span>Identity &amp; Authentication</span>
                  </div>
                  <ul className="text-xs text-[#94A3B8] space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Work or institutional email address (via Google SSO, GitHub OAuth, or Email OTP).</li>
                    <li>Public avatar URL and display name returned by the identity provider.</li>
                    <li>Cryptographic user ID and associated vault account reference (`VAULT-XXXX`).</li>
                    <li><strong className="text-emerald-400">Never collected:</strong> Plaintext passwords, social security numbers, or payment card numbers.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33]/70 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Server className="h-4 w-4 text-[#06B6D4]" />
                    <span>Agent Gateway Credentials</span>
                  </div>
                  <ul className="text-xs text-[#94A3B8] space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Hashed bearer API keys (`vrs_live_...` or `vst_test_...`).</li>
                    <li>Assigned agent gateway URLs (`https://gateway.verisett.com/v1/agt_...`).</li>
                    <li>Rate limit headers and request origin IPs to mitigate denial-of-service attempts.</li>
                    <li>Ephemeral handshake timestamps for agent heartbeat verification.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="zero-sale" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">04.</span>
                Absolute Prohibition on Data Sale
              </h2>
              <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33] p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Guaranteed Zero Commercial Monetization of Data</span>
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Verisett AI does <strong className="text-white">not sell, rent, monetize, or trade</strong> your personal information, 
                  developer profiles, code snippets, prompt assertions, or execution payloads to any third parties, advertisers, or data brokers.
                </p>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Your models and proprietary deliverables belong solely to you. We do not use your private milestone deliverables or 
                  assertion inputs to train proprietary machine learning models without explicit written authorization.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="settlement-logs" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">05.</span>
                Cryptographic Settlement Logs &amp; Audit Trails
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                To provide deterministic proof of deliverable acceptance, Verisett generates immutable cryptographic ledger entries 
                for each milestone transaction:
              </p>

              <div className="rounded-xl border border-[#1E345E] bg-[#090F1C] p-4 font-mono text-xs text-[#94A3B8] space-y-2">
                <div className="text-[#C59B5F]">// Structure of public cryptographic ledger record</div>
                <div className="text-emerald-400">
                  {`{
  "contract_id": "cnt_live_94e2a87b",
  "trace_hash": "0x7f4e92a83bd1c44208e9a2b5e612f0a884e1b4c919d38402a7b681e5927c3d11",
  "assertion_type": "JSON_SCHEMA",
  "status": "SETTLED",
  "settled_at": "2026-09-13T10:14:00Z"
}`}
                </div>
              </div>

              <div className="rounded-lg bg-[#142442]/60 border border-[#1E345E] p-4 text-xs text-[#94A3B8]">
                <strong className="text-white">Developer Best Practice:</strong> Because trace hashes and verification results are auditable, 
                developers must ensure that raw personally identifiable information (PII) or confidential secrets are never placed 
                directly into assertion payloads or public ledger schemas.
              </div>
            </section>

            {/* Section 6 */}
            <section id="fastmcp-telemetry" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">06.</span>
                FastMCP Tool Execution Telemetry
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                When your autonomous agents invoke FastMCP server tools (such as `create_escrow`, `claim_milestone`, `verify_assertion`, or `release_payout`), 
                the clearinghouse processes the execution request strictly within transient execution enclaves.
              </p>
              <ul className="text-xs sm:text-sm text-[#94A3B8] space-y-2 list-disc list-inside">
                <li><strong className="text-white">Ephemeral Execution:</strong> Payload evaluations (JSON schema validation, regex parsing, LLM judge rubrics) are processed in memory and retained only for the duration required to generate the deterministic settlement proof.</li>
                <li><strong className="text-white">TTL Purging:</strong> Raw debug traces are subject to automatic Time-To-Live (TTL) expiration schedules.</li>
                <li><strong className="text-white">Zero Model Ingestion:</strong> FastMCP tool queries are not shared with public foundational model providers for training.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="security-measures" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">07.</span>
                Security &amp; Key Management
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                We implement institutional-grade security controls to protect platform communications and agent secrets:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33] p-4">
                  <div className="font-semibold text-white mb-1">In-Transit Encryption</div>
                  <div className="text-[#64748B]">All API gateway traffic is secured via mandatory TLS 1.3 with strict HSTS policies.</div>
                </div>
                <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33] p-4">
                  <div className="font-semibold text-white mb-1">At-Rest Protection</div>
                  <div className="text-[#64748B]">Datastores and configuration secrets are encrypted using AES-256 standards.</div>
                </div>
                <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33] p-4">
                  <div className="font-semibold text-white mb-1">Key Revocation</div>
                  <div className="text-[#64748B]">Developers can rotate or immediately revoke compromised agent keys from the console.</div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="third-parties" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">08.</span>
                Infrastructure &amp; Service Providers
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                We partner with select institutional infrastructure providers to operate the platform reliably:
              </p>
              <ul className="text-xs sm:text-sm text-[#94A3B8] space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">Supabase:</strong> Managed identity authentication, JWT validation, and database replication.</li>
                <li><strong className="text-white">Vercel:</strong> Edge hosting, serverless routing, and CDN asset delivery.</li>
                <li><strong className="text-white">OAuth Providers:</strong> Google Identity and GitHub OAuth for verified developer single sign-on.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="developer-rights" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">09.</span>
                Developer Rights &amp; Data Retention
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                Under global privacy frameworks (including GDPR and CCPA), developers maintain comprehensive rights over their data:
              </p>
              <ul className="text-xs sm:text-sm text-[#94A3B8] space-y-2 list-disc list-inside">
                <li><strong className="text-white">Right to Erasure:</strong> You may request complete deletion of your developer account and associated profile data by contacting our team or clicking &quot;Exit&quot; in the dashboard.</li>
                <li><strong className="text-white">Right to Export:</strong> You can export contract telemetry and assertion ledgers directly from the console interface.</li>
                <li><strong className="text-white">Audit Trail Integrity:</strong> Note that cryptographic transaction hashes embedded in distributed ledger states cannot be altered due to mathematical immutability.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="contact" className="space-y-4 scroll-mt-24 border-t border-[#1E345E] pt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">10.</span>
                Contact &amp; Privacy Office
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                If you have questions regarding this Privacy Policy, your agent&apos;s data telemetry, or wish to exercise data rights, 
                please reach out to our security and legal team:
              </p>

              <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#142442] text-[#C59B5F] border border-[#1E345E]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Verisett AI Legal &amp; Compliance</div>
                    <div className="text-xs font-mono text-[#94A3B8]">legal@verisett.com &bull; security@verisett.com</div>
                  </div>
                </div>
                <a
                  href="mailto:legal@verisett.com"
                  className="rounded-lg bg-[#C59B5F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B38A4F] transition shadow-md shadow-[#C59B5F]/20"
                >
                  Contact Legal Team
                </a>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Minimal Dark Footer */}
      <footer className="border-t border-[#1E345E]/80 bg-[#070E1B] py-8 text-xs text-[#64748B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <VerisettLogo size={18} />
            <span>&copy; {new Date().getFullYear()} Verisett AI Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-[#C59B5F] transition-colors">Platform Home</Link>
            <Link href="/terms" className="hover:text-[#C59B5F] transition-colors">Terms of Service</Link>
            <a href="https://www.instagram.com/ai.verisett/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C59B5F] transition-colors">
              Instagram
            </a>
            <a href="https://x.com/ai_verisett" target="_blank" rel="noopener noreferrer" className="hover:text-[#C59B5F] transition-colors">
              Twitter / X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

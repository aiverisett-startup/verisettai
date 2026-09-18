"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Coins,
  Cpu,
  Bot,
  Scale,
  Key,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Terminal,
  Server,
  Mail,
  Zap,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";

export default function TermsOfServicePage() {
  const lastUpdated = "September 13, 2026";
  const effectiveDate = "September 13, 2026";

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "sandbox-architecture", title: "2. Non-Custodial Testnet Sandbox" },
    { id: "zero-value", title: "3. Zero Monetary Value of Test Tokens" },
    { id: "agent-liability", title: "4. Autonomous Agent Liability" },
    { id: "assertion-rules", title: "5. Assertion Soundness & Escrow Locks" },
    { id: "api-keys", title: "6. API Key Custody & Access Control" },
    { id: "fastmcp-execution", title: "7. FastMCP Server Tool Execution" },
    { id: "intellectual-property", title: "8. Intellectual Property Rights" },
    { id: "disclaimers", title: "9. Warranty Disclaimers ('AS IS')" },
    { id: "limitation-liability", title: "10. Limitation of Liability" },
    { id: "governing-law", title: "11. Dispute Resolution & Governing Law" },
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
              LEGAL // TERMS
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
              href="/privacy"
              className="text-xs font-medium text-[#94A3B8] hover:text-[#C59B5F] transition-colors hidden md:inline-block"
            >
              Privacy Policy →
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
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-mono text-amber-400 mb-6">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Non-Custodial Testnet Sandbox Terms</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-3xl text-base sm:text-lg text-[#94A3B8] leading-relaxed">
            Legal terms governing participation in the Verisett AI autonomous escrow testnet, FastMCP server tool execution, 
            and programmatic software settlement protocols.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-mono text-[#64748B]">
            <div>Effective Date: <span className="text-[#F8FAFC]">{effectiveDate}</span></div>
            <div className="h-3 w-px bg-[#1E345E]" />
            <div>Last Updated: <span className="text-[#F8FAFC]">{lastUpdated}</span></div>
            <div className="h-3 w-px bg-[#1E345E]" />
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Zero-Value Testnet Environment</span>
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
                <div className="rounded-xl bg-[#0B1528] border border-amber-500/30 p-3 text-[11px] font-mono text-[#94A3B8]">
                  <div className="text-amber-400 font-semibold mb-1">Developer Notice</div>
                  Test tokens hold zero monetary value. Developers are solely liable for agent actions.
                </div>
              </div>
            </div>
          </aside>

          {/* Terms Document Body */}
          <main className="lg:col-span-9 space-y-12 leading-relaxed text-[#CBD5E1]">

            {/* Critical Disclaimer Banner */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-[#0E1B33] to-[#0E1B33] p-6 sm:p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Crucial Testnet Disclaimers at a Glance
                  </h2>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    1. <strong className="text-white">Non-Custodial Sandbox:</strong> Verisett AI is not a bank, escrow agent, or financial institution. We do not take custody of fiat currency.
                    <br />
                    2. <strong className="text-white">Zero Monetary Value:</strong> Testnet tokens and vault balances hold $0 real-world value and cannot be redeemed for fiat.
                    <br />
                    3. <strong className="text-white">Autonomous Agent Responsibility:</strong> You retain complete legal and technical liability for all contracts created or executed by your agents.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section id="acceptance" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">01.</span>
                Acceptance of Terms
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (whether an individual developer, 
                organization, or system deploying autonomous software agents; &quot;User&quot;, &quot;you&quot;, or &quot;Developer&quot;) and Verisett AI Inc. 
                (&quot;Verisett&quot;, &quot;we&quot;, or &quot;us&quot;).
              </p>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                By accessing our website, creating testnet contracts, integrating FastMCP tools, or generating agent API keys, you agree to be bound by these Terms. 
                If you do not agree to all terms, do not access or use the platform.
              </p>
            </section>

            {/* Section 2 */}
            <section id="sandbox-architecture" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">02.</span>
                Non-Custodial Testnet Sandbox Architecture
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                Verisett AI is a software coordination protocol designed to facilitate algorithmic verification of digital deliverables between autonomous agents. 
                The platform currently operates strictly as a <strong className="text-white">non-custodial testnet sandbox</strong>:
              </p>
              <ul className="text-xs sm:text-sm text-[#94A3B8] space-y-2 list-disc list-inside">
                <li><strong className="text-white">No Discretionary Custody:</strong> Verisett does not hold, manage, or exercise discretionary control over user funds or real-world banking deposits.</li>
                <li><strong className="text-white">Algorithmic Settlement:</strong> Milestone escrow disbursement and fee collection are governed purely by deterministic assertion rules (JSON schemas, regex validators, cryptographic hash proofs, or multi-agent rubrics).</li>
                <li><strong className="text-white">Experimental Software:</strong> The platform is under continuous active development and is subject to protocol upgrades, state resets, and sandbox re-indexing without notice.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="zero-value" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">03.</span>
                Zero Monetary Value of Test Tokens &amp; Vault Balances
              </h2>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-amber-400 uppercase">
                  <Coins className="h-4 w-4" />
                  <span>Absolute No Monetary Value Disclaimer</span>
                </div>
                <p className="text-sm text-[#CBD5E1] leading-relaxed">
                  All currencies, balances, and values referenced on the platform (including representations labeled as &quot;₹&quot;, &quot;USDC&quot;, &quot;Vault Balance&quot;, or &quot;Escrow Cents&quot;) 
                  are <strong className="text-white">purely simulated testnet accounting units</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-[#94A3B8]">
                  <div className="rounded-lg bg-[#0B1528] border border-[#1E345E] p-3">
                    <span className="text-rose-400 font-bold">NON-EXCHANGEABLE:</span> Test tokens cannot be redeemed for fiat, cryptocurrencies, or physical goods.
                  </div>
                  <div className="rounded-lg bg-[#0B1528] border border-[#1E345E] p-3">
                    <span className="text-rose-400 font-bold">NON-FINANCIAL:</span> Testnet balances do not constitute bank accounts, securities, or store-of-value instruments.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="agent-liability" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">04.</span>
                Autonomous Agent Operations &amp; User Liability
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                As an agent developer, operator, or sponsor, you acknowledge that autonomous agents operate with independent execution logic and automated decision-making.
              </p>
              
              <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33] p-5 space-y-4">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Bot className="h-4 w-4 text-[#C59B5F]" />
                  <span>Developer Responsibility Allocation</span>
                </div>
                <ul className="text-xs sm:text-sm text-[#94A3B8] space-y-2 list-disc list-inside leading-relaxed">
                  <li><strong className="text-white">Sole Liability:</strong> You retain 100% sole liability and legal responsibility for all contracts, milestone claims, settlement disbursements, and external API requests initiated by your agents.</li>
                  <li><strong className="text-white">Erroneous Decisions:</strong> Verisett AI is not responsible for losses, premature disbursements, or unfulfilled deliverables caused by agent hallucinations, incorrect assertion logic, or model inference failures.</li>
                  <li><strong className="text-white">Third-Party Interactions:</strong> Any agreements or commercial deliveries entered into between your agent and a counterparty agent represent bilateral agreements solely between the respective operators.</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="assertion-rules" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">05.</span>
                Assertion Soundness &amp; Escrow Locks
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                Contracts on Verisett are locked until verification conditions are met. You are solely responsible for ensuring the technical soundness of your assertion criteria:
              </p>

              <div className="rounded-xl border border-[#1E345E] bg-[#090F1C] p-4 font-mono text-xs text-[#94A3B8] space-y-2">
                <div className="text-[#C59B5F]">// Supported Assertion Primitives</div>
                <div className="text-slate-300">
                  - JSON_SCHEMA: Deterministic validation against RFC draft-07 schemas.<br />
                  - HASH_MATCH: Cryptographic state root proof matching (SHA-256 / Keccak).<br />
                  - REGEX: Strict regular expression pattern verification.<br />
                  - LLM_JUDGE: Multi-criteria rubric evaluation enclaves.
                </div>
              </div>

              <p className="text-xs text-[#64748B]">
                Verisett does not manually arbitrate subjective disputes or override programmatic assertion results. If your assertion contains logical contradictions or impossible constraints, the escrow will remain locked until expiration.
              </p>
            </section>

            {/* Section 6 */}
            <section id="api-keys" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">06.</span>
                API Key Custody &amp; Access Control
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                Your gateway API key (`vrs_live_...`) is the master authorization token for your agent. You agree to:
              </p>
              <ul className="text-xs sm:text-sm text-[#94A3B8] space-y-2 list-disc list-inside">
                <li>Store credentials strictly in secure environment variables or enclave key vaults.</li>
                <li>Never commit credentials into public repositories, client-side browser bundles, or unmasked logs.</li>
                <li>Immediately revoke any compromised key through the Verisett console. All actions performed with your key are legally attributed to your account.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="fastmcp-execution" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">07.</span>
                FastMCP Server Tool Execution &amp; Acceptable Use
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                When calling FastMCP clearing tools (`create_escrow`, `claim_milestone`, `verify_assertion`), users must adhere to our Acceptable Use Policy:
              </p>
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-xs sm:text-sm text-[#94A3B8] space-y-2">
                <div className="font-semibold text-rose-400 font-mono uppercase text-xs">Prohibited Activities:</div>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>Executing denial-of-service, flood attacks, or replay exploits against gateway RPC endpoints.</li>
                  <li>Attempting sandbox breakout, privilege escalation, or side-channel inspection of TEE enclaves.</li>
                  <li>Using the protocol to coordinate malicious software deployment, ransomware settlement, or unauthorized cyber operations.</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section id="intellectual-property" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">08.</span>
                Intellectual Property Rights
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                You retain full and exclusive ownership of all software code, intellectual property, machine learning models, 
                and deliverables produced by your agents. Verisett acquires no ownership rights over user deliverables verified via the protocol.
              </p>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                Verisett AI Inc. retains all rights, title, and interest in and to the platform, clearinghouse architecture, 
                trademarks, brand assets, and FastMCP protocol specifications.
              </p>
            </section>

            {/* Section 9 */}
            <section id="disclaimers" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">09.</span>
                Warranty Disclaimers (&quot;AS IS&quot;)
              </h2>
              <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33] p-5 text-xs sm:text-sm text-[#94A3B8] uppercase leading-relaxed font-mono">
                THE PLATFORM, PROTOCOL, AND FASTMCP TOOLS ARE PROVIDED STRICTLY &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;, WITHOUT WARRANTY OF ANY KIND, 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. 
                VERISETT DOES NOT WARRANT THAT THE PROTOCOL WILL OPERATE UNINTERRUPTED OR ERROR-FREE.
              </div>
            </section>

            {/* Section 10 */}
            <section id="limitation-liability" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">10.</span>
                Limitation of Liability
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                To the maximum extent permitted by applicable law, in no event shall Verisett AI Inc., its directors, employees, or protocol contributors 
                be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, loss of data, 
                agent misfires, or software bugs arising out of your use of the testnet platform.
              </p>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                Because the platform currently operates as a free testnet sandbox with zero-value tokens, our total aggregate liability for any claims 
                under these Terms shall not exceed $100.00 USD.
              </p>
            </section>

            {/* Section 11 */}
            <section id="governing-law" className="space-y-4 scroll-mt-24 border-t border-[#1E345E] pt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="text-[#C59B5F] font-mono text-lg">11.</span>
                Dispute Resolution &amp; Governing Law
              </h2>
              <p className="text-sm sm:text-base text-[#94A3B8]">
                These Terms shall be governed by and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law principles. 
                Any dispute arising from these Terms shall be resolved through confidential binding commercial arbitration.
              </p>

              <div className="rounded-xl border border-[#1E345E] bg-[#0E1B33] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#142442] text-[#C59B5F] border border-[#1E345E]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Questions About These Terms?</div>
                    <div className="text-xs font-mono text-[#94A3B8]">legal@verisett.com &bull; compliance@verisett.com</div>
                  </div>
                </div>
                <a
                  href="mailto:legal@verisett.com"
                  className="rounded-lg bg-[#C59B5F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B38A4F] transition shadow-md shadow-[#C59B5F]/20"
                >
                  Contact Counsel
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
            <Link href="/privacy" className="hover:text-[#C59B5F] transition-colors">Privacy Policy</Link>
            <a href="https://www.youtube.com/@VerisettAI" target="_blank" rel="noopener noreferrer" className="hover:text-[#C59B5F] transition-colors">
              YouTube
            </a>
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

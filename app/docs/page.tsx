"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCode,
  ArrowLeft,
  Terminal,
  BookOpen,
  Cpu,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Code2,
} from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";

export default function ProtocolDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const pythonSnippet = `from verisett import FastMCPEscrowClient

# Initialize client using your authorized API key
client = FastMCPEscrowClient(
    api_key="vrs_live_your_key_here",
    gateway_url="https://veri-sett.com"
)

# 1. Lock funds into deterministic escrow vault
contract = client.create_escrow_contract(
    worker_agent="agt_data_synthesizer_01",
    amount_cents=250000,  # ₹2,500.00 VRS
    assertion_type="SHA256_JSON_SCHEMA",
    timeout_seconds=300,
    required_sha256="7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
)

# 2. Worker submits deliverable for mathematical verification (<50ms)
settlement = client.settle_milestone(
    contract_id=contract["id"],
    deliverable_payload={"metrics": {"accuracy": 0.99, "status": "PASS"}}
)

print(f"Settled: {settlement['status']} | Fee: 1.5% | Net Payout: ₹{settlement['net_amount']}")`;

  const mcpConfigSnippet = `{
  "mcpServers": {
    "verisett": {
      "command": "npx",
      "args": ["-y", "@verisett/fastmcp-server"],
      "env": {
        "VERISETT_API_KEY": "vrs_live_your_key_here",
        "VERISETT_GATEWAY_URL": "https://veri-sett.com"
      }
    }
  }
}`;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B1528] text-[#F8FAFC] font-montserrat antialiased selection:bg-[#C59B5F]/30 selection:text-[#FAF6EE]">
      {/* Top Header */}
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
              DEVELOPER // PROTOCOL DOCS
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
            <Link
              href="/terms"
              className="text-xs font-medium text-[#94A3B8] hover:text-[#C59B5F] transition-colors hidden lg:inline-block"
            >
              Terms →
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-14">
        {/* Hero */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C59B5F]/40 bg-[#142442] px-4 py-1 text-xs font-mono text-[#C59B5F]">
            <BookOpen className="h-3.5 w-3.5 text-[#C59B5F]" />
            <span>FASTMCP PROTOCOL SPECIFICATION v2.4</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Developer Documentation
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Integrate deterministic programmatic escrow and FastMCP settlement into your autonomous agents,
            Claude Desktop workflows, Cursor environments, and Python or TypeScript runtimes.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2">
            <a
              href="https://github.com/aiverisett-startup/verisettai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#142442] border border-[#1E345E] hover:border-[#C59B5F] text-white hover:text-[#C59B5F] transition"
            >
              <Code2 className="w-4 h-4 text-[#C59B5F]" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>
            <Link
              href="/security"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#142442] border border-[#1E345E] hover:border-[#C59B5F] text-white hover:text-[#C59B5F] transition"
            >
              <ShieldCheck className="w-4 h-4 text-[#C59B5F]" />
              <span>Security Architecture Specification</span>
            </Link>
          </div>
        </div>

        {/* Python SDK Integration */}
        <section className="rounded-3xl border border-[#1E345E] bg-[#0E1B33]/80 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E345E] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#142442] border border-[#1E345E] text-[#C59B5F]">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Python FastMCP Client</h3>
                <p className="text-xs text-[#94A3B8]">Autonomous agent escrow lock, execution, and &lt;50ms settlement</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(pythonSnippet, "python")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142442] border border-[#1E345E] hover:border-[#C59B5F] text-xs font-mono text-[#C59B5F] transition cursor-pointer"
            >
              {copiedCode === "python" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Python</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto rounded-xl bg-[#070E1B] p-4 text-xs font-mono text-[#CBD5E1] leading-relaxed border border-[#1E345E]/60">
            <code>{pythonSnippet}</code>
          </pre>
        </section>

        {/* Model Context Protocol (MCP) Config */}
        <section className="rounded-3xl border border-[#1E345E] bg-[#0E1B33]/80 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E345E] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#142442] border border-[#1E345E] text-[#C59B5F]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Claude Desktop &amp; Cursor FastMCP Configuration</h3>
                <p className="text-xs text-[#94A3B8]">Attach Verisett directly to your AI development environment</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(mcpConfigSnippet, "mcp")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142442] border border-[#1E345E] hover:border-[#C59B5F] text-xs font-mono text-[#C59B5F] transition cursor-pointer"
            >
              {copiedCode === "mcp" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Config</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto rounded-xl bg-[#070E1B] p-4 text-xs font-mono text-[#CBD5E1] leading-relaxed border border-[#1E345E]/60">
            <code>{mcpConfigSnippet}</code>
          </pre>
        </section>

        {/* REST API Endpoints Overview */}
        <section className="rounded-3xl border border-[#1E345E] bg-[#0E1B33]/80 p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#1E345E] pb-4">
            <h3 className="text-base font-bold text-white">Core REST API Endpoints</h3>
            <p className="text-xs text-[#94A3B8]">Standard HTTP interface authenticated via Bearer API keys</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-2xl border border-[#1E345E] bg-[#142442]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                <span className="text-white font-semibold">/api/transfer</span>
              </div>
              <span className="text-[#94A3B8]">Execute verified agent-to-agent escrow or transfer</span>
            </div>

            <div className="p-4 rounded-2xl border border-[#1E345E] bg-[#142442]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">GET</span>
                <span className="text-white font-semibold">/api/verisett/agent?key=...</span>
              </div>
              <span className="text-[#94A3B8]">Query live agent custody balance and account status</span>
            </div>

            <div className="p-4 rounded-2xl border border-[#1E345E] bg-[#142442]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">GET</span>
                <span className="text-white font-semibold">/api/verisett/transactions</span>
              </div>
              <span className="text-[#94A3B8]">Fetch recent cryptographic contracts and ledger entries</span>
            </div>

            <div className="p-4 rounded-2xl border border-[#1E345E] bg-[#142442]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">GET</span>
                <span className="text-white font-semibold">/api/verisett/stream?key=...</span>
              </div>
              <span className="text-[#94A3B8]">Server-Sent Events (SSE) real-time settlement telemetry</span>
            </div>
          </div>
        </section>

        {/* Founder Attribution Card */}
        <section className="rounded-2xl border border-[#1E345E] bg-[#142442]/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#94A3B8]">
          <div>
            <span className="text-[#C59B5F] font-bold">Verisett Protocol Architecture</span>
            <p className="text-white font-semibold text-sm mt-0.5">Founded &amp; Architected by Manoj S.M.</p>
            <p className="text-[#94A3B8] text-xs mt-1">Deterministic financial settlement for autonomous agent economies.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/security" className="text-[#C59B5F] hover:underline">
              Security Architecture →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E345E]/80 bg-[#070E1B] py-10 text-xs text-[#64748B] font-montserrat">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Verisett AI Inc. Founded by Manoj S.M.</p>
          <div className="flex items-center gap-4 font-mono text-xs">
            <Link href="/security" className="hover:text-white transition-colors">
              /security
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              /terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              /privacy
            </Link>
            <Link href="/docs" className="text-[#C59B5F] font-semibold hover:text-white transition-colors">
              /docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

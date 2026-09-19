"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, ChevronDown, ChevronUp, Code2, Lock } from "lucide-react";
import { useAuthUser } from "@/lib/useAuthUser";

export function DeveloperCodeSection() {
  const { user } = useAuthUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"fastmcp" | "python" | "curl">("fastmcp");
  const [copied, setCopied] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const snippets = {
    fastmcp: `// Model Context Protocol (FastMCP) Native Escrow Tool
const escrow = await mcp.callTool("create_contract_escrow", {
  payer_api_key: ${user ? "process.env.VERISETT_KEY" : '"[LOGIN_REQUIRED_TO_COPY_KEY]"'},
  amount_cents: 2500000, // ₹25,000 INR
  milestone_title: "Full-Stack SaaS MVP Deliverable",
  acceptance_rules: {
    test_coverage_min: 0.95,
    lint_passed: true,
    security_audit_cleared: true
  },
  timeout_seconds: 604800 // 7 days vault custody
});

console.log("Vault Escrow Locked ID:", escrow.contract_id);`,

    python: `# Python 3.11+ Async Enterprise Client
from verisett import VerisettClient

async with VerisettClient(api_key="${user ? "vrs_live_89f72b1049c81a29e4d0812b" : "vrs_live_••••••••••••••••"}") as client:
    # Initialize programmatic milestone escrow
    escrow = await client.escrow.create(
        amount_inr=25000,
        beneficiary_id="contractor_nexus_01",
        milestone="Core Architecture & Deliverable Acceptance",
        auto_release_on_verify=True
    )
    
    print(f"Vault Status: {escrow.status} | Locked: ₹{escrow.amount_inr}")`,

    curl: `# REST API: Create Milestone Escrow Contract
curl -X POST https://api.verisett.io/v1/contracts/create \\
  -H "Authorization: Bearer ${user ? "vs_live_8f9a2b1c4e92a81b" : "[LOGIN_REQUIRED_TO_COPY_KEY]"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount_cents": 2500000,
    "currency": "INR",
    "milestone_id": "ms_fullstack_mvp",
    "auto_release": true
  }'`,
  };

  const handleCopy = () => {
    if (!user) {
      setAuthNotice("Authentication Required: Please sign in with Google or Email to copy FastMCP server configurations and API keys.");
      setTimeout(() => setAuthNotice(null), 5000);
      return;
    }
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="py-12 border-t border-[#EAE3D2] bg-[#FAF8F5] relative overflow-hidden">
      {/* Background Half-Shapes flanking Developer Code Section */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Left Edge: Smooth Half-Circle with Concentric Arc */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-14 sm:-left-20 w-48 sm:w-60 h-48 sm:h-60 opacity-30 motion-safe:animate-float-slow">
          <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 120,20 A 100,100 0 0,1 120,220 Z"
              fill="#FAF6EE"
              stroke="#C59B5F"
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />
            <path
              d="M 120,45 A 75,75 0 0,1 120,195"
              stroke="#D4AF37"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.25"
              fill="none"
            />
          </svg>
        </div>

        {/* Right Edge: Smooth Half-Circle with Concentric Arc */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-14 sm:-right-20 w-48 sm:w-60 h-48 sm:h-60 opacity-30 motion-safe:animate-float-reverse">
          <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 120,20 A 100,100 0 0,0 120,220 Z"
              fill="#FAF6EE"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />
            <path
              d="M 120,45 A 75,75 0 0,0 120,195"
              stroke="#C59B5F"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.25"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Collapsible Accordion Header */}
        <div className="rounded-2xl bg-white border border-[#EAE3D2] overflow-hidden transition-all shadow-[0_2px_12px_rgba(197,155,95,0.04)] hover:border-[#D4AF37]">
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-[#FAF6EE]/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45] shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-base sm:text-lg font-semibold text-[#1C1A17] tracking-tight">
                    Developer Documentation &amp; API
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#9E7A45] border border-[#EAE3D2]">
                    OPTIONAL SPEC
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#8C8275] mt-1">
                  Integrating programmatically? Click to view Model Context Protocol (FastMCP), Python SDK, and REST curl endpoints.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-xs font-mono text-[#8C8275] group-hover:text-[#9E7A45] hidden sm:inline">
                {isOpen ? "Collapse Spec" : "Expand Code"}
              </span>
              <div className="h-8 w-8 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45]">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {/* Collapsible Drawer Content */}
          {isOpen && (
            <div className="border-t border-[#EAE3D2] p-6 sm:p-8 bg-[#FDFCF9] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                {/* Tabs */}
                <div className="flex items-center gap-2">
                  {[
                    { id: "fastmcp", label: "FastMCP Agent Tool" },
                    { id: "python", label: "Python 3.11+ SDK" },
                    { id: "curl", label: "cURL REST" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#C59B5F] text-white border border-[#B38A4F] shadow-xs"
                          : "bg-white text-[#8C8275] hover:text-[#1C1A17] border border-[#EAE3D2]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Copy Button (Protected by Auth) */}
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer self-start sm:self-auto shadow-2xs ${
                    !user
                      ? "bg-[#FAF6EE] hover:bg-[#F5EEDD] border border-[#D4AF37]/60 text-[#9E7A45] hover:text-[#C59B5F]"
                      : "bg-white hover:bg-[#FAF6EE] border border-[#EAE3D2] hover:border-[#D4AF37] text-[#1C1A17]"
                  }`}
                  title={!user ? "Sign in to copy FastMCP & API credentials" : "Copy code snippet"}
                >
                  {!user ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#C59B5F]" />
                      <span className="font-semibold">Login to Copy</span>
                    </>
                  ) : copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#9E7A45]" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              {/* Authentication Alert / Protection Banner */}
              {authNotice ? (
                <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-montserrat flex items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-medium">{authNotice}</span>
                  </div>
                  <Link
                    href="/login"
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#C59B5F] hover:bg-[#B38A4F] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Sign In Now →
                  </Link>
                </div>
              ) : !user ? (
                <div className="mb-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] text-[11px] font-montserrat text-[#6E675D] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#C59B5F] shrink-0" />
                    <span>Protected Endpoints: FastMCP server tools and live API tokens require an authenticated account.</span>
                  </div>
                  <Link
                    href="/login"
                    className="text-[11px] font-bold text-[#9E7A45] hover:text-[#C59B5F] underline shrink-0"
                  >
                    Sign In to Unlock
                  </Link>
                </div>
              ) : null}

              {/* Code Snippet Box */}
              <pre className="p-4 rounded-xl bg-[#181613] text-[#FAF6EE] border border-[#C59B5F]/30 text-xs font-mono overflow-x-auto leading-relaxed shadow-sm">
                <code>{snippets[activeTab]}</code>
              </pre>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Search, Code2, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

interface MarketplaceWorkersProps {
  onSelectWorkerForTesting?: (worker: {
    name: string;
    amountDollars: number;
    schema: Record<string, unknown>;
    samplePayload: Record<string, unknown>;
  }) => void;
}

export function MarketplaceWorkers({ onSelectWorkerForTesting }: MarketplaceWorkersProps) {
  const templates = [
    {
      id: "search",
      name: "Web Search & Extraction Pipeline",
      category: "Data & Telemetry",
      icon: Search,
      amountDollars: 250,
      description: "Secure milestone payouts for agent data ingestion pipelines. Auto-released when extraction schemas and source citation depth meet deterministic hash commitments.",
      tags: ["Structured Extraction", "Quality Checks", "Auto-Release"],
      deliverableChecklist: [
        "Structured entity parsing >99% confidence",
        "Source citation verification included",
        "Sub-100ms API query latency SLA",
      ],
    },
    {
      id: "code",
      name: "Code Audit & Security Deliverable",
      category: "Software Development",
      icon: Code2,
      amountDollars: 1000,
      description: "Escrow protection for critical software deliverables and autonomous security audits. Funds unlocked only when test coverage and security criteria pass 100%.",
      tags: ["Security Audit", "AST Analysis", "Zero CVEs"],
      deliverableChecklist: [
        "Zero critical/high CVE vulnerabilities",
        "Unit & integration tests pass rate >98%",
        "SHA-256 Output Match",
      ],
    },
    {
      id: "doc",
      name: "Architecture & Synthesis Spec",
      category: "Technical Architecture",
      icon: FileText,
      amountDollars: 2500,
      description: "Milestone escrow for complex agent swarm specifications, architectural blueprints, and execution pipelines with deterministic assertion cleared.",
      tags: ["System Architecture", "Zero-Knowledge", "Compliance Ready"],
      deliverableChecklist: [
        "Architecture diagram & sequence specifications",
        "Deterministic Assertion Cleared",
        "Zero-Knowledge Proof Verified",
      ],
    },
  ];

  return (
    <section id="templates" className="relative py-24 md:py-32 bg-white border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563EB] mb-2">
            Contract Library
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.02em] text-[#0F172A] leading-[1.15]">
            Instant Agent Escrow Templates.
          </h2>
          <p className="text-base sm:text-lg text-[#334155] mt-3 leading-[1.6]">
            Launch pre-configured software milestone contracts with tested acceptance invariants, ready-to-use release triggers, and automated payout execution.
          </p>
        </div>

        {/* Templates Grid with 1px Borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-7 sm:p-8 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-[#CBD5E1] transition-all"
              >
                <div>
                  {/* Category & Price */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-mono uppercase font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200">
                      {tmpl.category}
                    </span>
                    <div className="text-right">
                      <div className="font-sans font-bold text-[#0F172A] text-lg">
                        ${tmpl.amountDollars.toLocaleString("en-US")}.00
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono">USD Milestone</div>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#2563EB] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] tracking-tight leading-snug">
                      {tmpl.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#334155] leading-[1.6] mb-5">
                    {tmpl.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {tmpl.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-[#475569] border border-[#E2E8F0]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Deliverable Checklist */}
                  <div className="space-y-2 p-4 rounded-xl bg-white border border-[#E2E8F0] mb-6">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] mb-2 font-semibold">
                      Acceptance Invariants
                    </div>
                    {tmpl.deliverableChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#0F172A] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Button */}
                <Link
                  href="/billing"
                  className="w-full py-2.5 px-4 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                >
                  <span>Deploy Verified Specification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export const InstantEscrowTemplates = MarketplaceWorkers;

"use client";

import React, { useState } from "react";
import { Search, Code2, FileText, ArrowRight, Check, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

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
      badge: "Condition Verified",
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
      badge: "Condition Verified",
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
      badge: "Condition Verified",
    },
  ];

  return (
    <section id="marketplace" className="py-24 border-t border-[#EAE3D2] bg-[#FAF8F5] relative overflow-hidden">
      {/* Background Half-Shapes flanking Marketplace Section */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Left Edge: Half-Circle with Concentric Arc */}
        <div className="absolute top-1/4 -left-16 sm:-left-20 w-64 sm:w-80 h-64 sm:h-80 opacity-25 motion-safe:animate-float-slow">
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="market-edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 150,20 A 130,130 0 0,1 150,280 Z"
              fill="url(#market-edge-grad)"
              stroke="#3B82F6"
              strokeWidth="1.2"
              strokeOpacity="0.2"
            />
            <path
              d="M 150,50 A 100,100 0 0,1 150,250"
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="5 5"
              strokeOpacity="0.25"
              fill="none"
            />
          </svg>
        </div>

        {/* Right Edge: Semicircular Half-Arc with Concentric Orbit */}
        <div className="absolute top-1/3 -right-16 sm:-right-24 w-72 sm:w-96 h-72 sm:h-96 opacity-25 motion-safe:animate-float-reverse">
          <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="market-half-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 160,20 A 140,140 0 0,0 160,300 Z"
              fill="url(#market-half-grad)"
              stroke="#3B82F6"
              strokeWidth="1.2"
              strokeOpacity="0.2"
            />
            <path
              d="M 160,50 A 110,110 0 0,0 160,270"
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="4 6"
              strokeOpacity="0.25"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-mono uppercase tracking-wider text-blue-600 mb-3">
              Pre-Configured Contracts
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1A17]">
              Instant Agent Escrow Templates.
            </h2>
            <p className="text-base sm:text-lg text-[#8C8275] mt-3 leading-relaxed">
              Launch pre-configured software milestone contracts with tested acceptance invariants, ready-to-use release triggers, and automated payout execution.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] text-xs font-mono text-[#09090B] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-blue-600 font-semibold">$500.00 Testnet Sandbox Credit Active</span>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                className="rounded-2xl bg-white border border-[#E2E8F0] hover:border-blue-500 p-6 sm:p-7 shadow-[0_2px_12px_rgba(37,99,235,0.04)] hover:shadow-[0_10px_32px_rgba(37,99,235,0.09)] flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  {/* Category & Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      {tmpl.category}
                    </span>
                    <div className="text-right">
                      <div className="font-sans font-semibold text-zinc-900 text-base">
                        ${tmpl.amountDollars.toLocaleString("en-US")}.00
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">USD (Testnet)</div>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#09090B] tracking-tight leading-snug">
                      {tmpl.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#8C8275] leading-relaxed mb-5">
                    {tmpl.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {tmpl.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FDFCF9] text-slate-600 border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Deliverable Checklist */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-[#FDFCF9] border border-[#EAE3D2] mb-6">
                    <div className="font-mono text-xs uppercase tracking-wider text-zinc-500 mb-1 font-semibold">
                      Acceptance Invariants
                    </div>
                    {tmpl.deliverableChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#1C1A17]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Button */}
                <button
                  onClick={() =>
                    onSelectWorkerForTesting?.({
                      name: tmpl.name,
                      amountDollars: tmpl.amountDollars,
                      schema: { deliverable: tmpl.name, accepted: true },
                      samplePayload: { deliverable: tmpl.name, status: "PASSED" },
                    })
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  <span>Load Template into Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export const InstantEscrowTemplates = MarketplaceWorkers;

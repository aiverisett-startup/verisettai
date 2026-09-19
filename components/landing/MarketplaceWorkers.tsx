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
      amountINR: 25000,
      amountDollars: 300,
      description: "Secure milestone payouts for data ingestion pipelines. Auto-released when extraction schemas and source citation depth meet required confidence thresholds.",
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
      amountINR: 100000,
      amountDollars: 1200,
      description: "Escrow protection for critical software deliverables and security audits. Funds unlocked only when test coverage and security criteria pass 100%.",
      tags: ["Security Audit", "AST Analysis", "Zero CVEs"],
      deliverableChecklist: [
        "Zero critical/high CVE vulnerabilities",
        "Unit & integration tests pass rate >98%",
        "Lead security engineer sign-off verified",
      ],
      badge: "Condition Verified",
    },
    {
      id: "doc",
      name: "Architecture & Synthesis Spec",
      category: "Technical Architecture",
      icon: FileText,
      amountINR: 50000,
      amountDollars: 600,
      description: "Milestone escrow for complex technical specifications, architectural blueprints, and enterprise documentation with dual-client sign-off.",
      tags: ["System Architecture", "Dual Sign-Off", "Compliance Ready"],
      deliverableChecklist: [
        "Architecture diagram & sequence specifications",
        "Dual-client technical approval confirmed",
        "Exported audit trail with hash commitment",
      ],
      badge: "Condition Verified",
    },
  ];

  return (
    <section id="marketplace" className="py-24 border-t border-[#EAE3D2] bg-[#FAF8F5] relative overflow-hidden">
      {/* Precision Edge Shapes flanking Marketplace Section */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Left Edge: Concentric Compass Arcs, Vertical Rail & Nodes */}
        <div className="absolute top-1/4 -left-14 sm:-left-20 w-64 sm:w-80 h-72 sm:h-88 opacity-50 motion-safe:animate-float-slow">
          <svg viewBox="0 0 320 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="market-edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#C59B5F" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Concentric Double Arcs */}
            <path
              d="M 20,320 A 150,150 0 0,1 170,170 L 170,320 Z"
              fill="url(#market-edge-grad)"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
            <path
              d="M 0,340 A 190,190 0 0,1 190,150"
              stroke="#C59B5F"
              strokeWidth="1"
              strokeDasharray="5 5"
              strokeOpacity="0.35"
              fill="none"
            />
            {/* Vertical Rail with Nodes */}
            <line x1="20" y1="40" x2="20" y2="340" stroke="#EAE3D2" strokeWidth="1.5" />
            <circle cx="20" cy="100" r="4.5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="20" cy="100" r="2" fill="#9E7A45" />
            <circle cx="170" cy="170" r="3.5" fill="#D4AF37" />
            {/* Tick Marks */}
            <line x1="20" y1="130" x2="30" y2="130" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.4" />
            <line x1="20" y1="150" x2="26" y2="150" stroke="#9E7A45" strokeWidth="1" strokeOpacity="0.3" />
            <line x1="20" y1="170" x2="30" y2="170" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.4" />
          </svg>
        </div>

        {/* Right Edge: Semicircular Half-Arc, Caliper & Orbital Nodes */}
        <div className="absolute top-1/3 -right-16 sm:-right-24 w-72 sm:w-96 h-72 sm:h-96 opacity-45 motion-safe:animate-float-reverse">
          <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="market-half-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
                <stop offset="60%" stopColor="#C59B5F" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 220,30 A 160,160 0 0,0 220,350 L 220,30 Z"
              fill="url(#market-half-grad)"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeOpacity="0.45"
            />
            <path
              d="M 220,60 A 130,130 0 0,0 220,320"
              stroke="#C59B5F"
              strokeWidth="1"
              strokeDasharray="4 6"
              strokeOpacity="0.35"
              fill="none"
            />
            {/* Caliper Bracket */}
            <path
              d="M 240,240 L 90,240 L 90,140"
              stroke="#9E7A45"
              strokeWidth="1.2"
              strokeOpacity="0.4"
              fill="none"
            />
            <circle cx="90" cy="240" r="3.5" fill="#D4AF37" />
            <circle cx="90" cy="140" r="3" fill="#C59B5F" />
            <circle cx="120" cy="80" r="3.5" fill="#D4AF37" />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[11px] font-mono uppercase tracking-wider text-[#9E7A45] mb-3">
              Pre-Configured Contracts
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1A17]">
              Instant commercial escrow templates.
            </h2>
            <p className="text-base sm:text-lg text-[#8C8275] mt-3 leading-relaxed">
              Launch pre-configured software milestone contracts with tested acceptance invariants, ready-to-use release triggers, and automated payout execution.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#EAE3D2] text-xs font-mono text-[#1C1A17] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B5F] shrink-0" />
            <span className="text-[#9E7A45] font-semibold">₹40,000 Sandbox Credit Active</span>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                className="rounded-2xl bg-white border border-[#EAE3D2] hover:border-[#D4AF37] p-6 sm:p-7 shadow-[0_2px_12px_rgba(197,155,95,0.04)] hover:shadow-[0_10px_32px_rgba(197,155,95,0.09)] flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  {/* Category & Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#9E7A45] border border-[#EAE3D2]">
                      {tmpl.category}
                    </span>
                    <div className="text-right font-mono">
                      <div className="text-base font-bold text-[#1C1A17]">₹{tmpl.amountINR.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-[#8C8275]">(${tmpl.amountDollars} USD)</div>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1C1A17] tracking-tight leading-snug">
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
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FDFCF9] text-[#8C8275] border border-[#EAE3D2]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Deliverable Checklist */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-[#FDFCF9] border border-[#EAE3D2] mb-6">
                    <div className="text-[10px] font-mono uppercase font-semibold text-[#9E7A45] mb-1">
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
                  className="w-full py-2.5 px-4 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shadow-[#C59B5F]/25 hover:shadow-sm"
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

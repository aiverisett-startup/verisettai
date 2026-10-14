"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileCheck, Lock, CheckCircle2, Zap } from "lucide-react";

interface HowItWorksSectionProps {
  onStartOnboarding?: () => void;
  onOpenVideoModal?: () => void;
}

export function HowItWorksSection({}: HowItWorksSectionProps) {
  const steps = [
    {
      number: "01",
      stepTag: "Step 01 / Authentication",
      title: "M2M FastMCP Handshake",
      description:
        "Connect autonomous AI agent swarms securely via Model Context Protocol (FastMCP) with mutual TLS and ephemeral cryptographic session keys. Instant microsecond vault initialization.",
      renderVisual: () => (
        <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB]">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#0F172A]">FastMCP mTLS &amp; Session Keys</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              SUB-5MS
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-mono text-[10px] font-bold">
                α
              </div>
              <div>
                <div className="font-semibold text-[#0F172A] text-[11px]">Agent_Alpha_Buyer</div>
                <div className="text-[10px] text-[#64748B]">Session: vrs_live_89f7...</div>
              </div>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>
      ),
    },
    {
      number: "02",
      stepTag: "Step 02 / Invariant Definition",
      title: "Define Settlement Invariants",
      description:
        "Specify milestone deliverables, testnet USD amounts, and SHA-256 deliverable commitments. Set automated assertion rules or zero-knowledge cryptographic checks.",
      renderVisual: () => (
        <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB]">
                <FileCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#0F172A]">FastMCP Escrow Vault</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#0F172A]">$250.00 USD</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#475569] bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#2563EB]" />
                Vault Custody
              </span>
              <span className="text-emerald-700 font-semibold font-mono">Locked (SET NX)</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#475569] bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
              <span>Acceptance Invariant</span>
              <span className="font-mono text-[#0F172A] font-semibold">SHA-256 Output Match</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      stepTag: "Step 03 / Automated Clearance",
      title: "Automated Release & Protection",
      description:
        "When autonomous worker agents deliver verifiable deliverables matching the SHA-256 hash or zero-knowledge proof, funds instantly clear. Zero counterparty risk.",
      renderVisual: () => (
        <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-900">Atomic Payout Disbursed</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
              &lt;25ms
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#64748B]">Settlement Status:</span>
              <span className="text-emerald-700 font-semibold">Completed</span>
            </div>
            <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-full rounded-full" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono pt-0.5">
              <span>Audit ID: #SETTLE-8821</span>
              <span>Double-entry Logged</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-[#F8FAFC] border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563EB] mb-2">
            Protocol Mechanics
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.02em] text-[#0F172A] leading-[1.15]">
            How it works in three deterministic steps.
          </h2>
          <p className="text-base sm:text-lg text-[#334155] mt-3 leading-[1.6]">
            Eliminate payment disputes and deliverable uncertainty. Verisett automates the escrow lifecycle from initial proposal to verified commercial payout.
          </p>
        </div>

        {/* Editorial 3-Step Structural Grid with 1px Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-7 sm:p-9 hover:bg-[#F8FAFC]/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-mono font-extrabold text-[#2563EB]">
                    {step.number}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                    {step.stepTag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#0F172A] tracking-tight mb-2.5">
                  {step.title}
                </h3>

                <p className="text-sm text-[#334155] leading-[1.6] mb-8">
                  {step.description}
                </p>
              </div>

              {/* Render Visual Preview */}
              <div className="pt-4 border-t border-[#E2E8F0]">{step.renderVisual()}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

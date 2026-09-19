"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileCheck, Lock, CheckCircle2, Zap, Play } from "lucide-react";
import { GoogleIcon } from "../ui/GoogleIcon";

interface HowItWorksSectionProps {
  onStartOnboarding?: () => void;
  onOpenVideoModal?: () => void;
}

export function HowItWorksSection({ onStartOnboarding, onOpenVideoModal }: HowItWorksSectionProps) {
  const steps = [
    {
      number: "01",
      stepBadge: "STEP 1: ONE-CLICK AUTH",
      title: "One-Click Authentication",
      quote: "Sign in with Google. No setup friction, instant sandbox profile.",
      description:
        "Connect securely via Google Enterprise SSO. Your institutional sandbox account and multi-sig vault profile are ready in seconds without technical setup.",
      renderVisual: () => (
        <div className="bg-[#FDFCF9] rounded-xl p-4 border border-[#EAE3D2] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white border border-[#EAE3D2] shadow-2xs">
                <GoogleIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#1C1A17]">Google Enterprise SSO</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              INSTANT
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#EAE3D2] flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#C59B5F] flex items-center justify-center text-white font-mono text-[10px]">
                JD
              </div>
              <div>
                <div className="font-medium text-[#1C1A17] text-[11px]">john@enterprise.com</div>
                <div className="text-[10px] text-[#8C8275]">Sandbox Profile Active</div>
              </div>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>
      ),
    },
    {
      number: "02",
      stepBadge: "STEP 2: DEFINE ESCROW",
      title: "Define Settlement Terms",
      quote: "Bank-grade programmatic vault locking until deliverables pass.",
      description:
        "Choose your project deliverable, milestone amounts, and acceptance criteria in plain business language. Set auto-release rules or dual-client approval.",
      renderVisual: () => (
        <div className="bg-[#FDFCF9] rounded-xl p-4 border border-[#EAE3D2] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white border border-[#EAE3D2] shadow-2xs">
                <FileCheck className="w-4 h-4 text-[#9E7A45]" />
              </div>
              <span className="text-xs font-semibold text-[#1C1A17]">Milestone Contract</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#1C1A17]">₹25,000</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#8C8275] bg-white p-2 rounded-lg border border-[#EAE3D2]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#9E7A45]" />
                Vault Custody
              </span>
              <span className="text-emerald-700 font-medium">Locked</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8C8275] bg-white p-2 rounded-lg border border-[#EAE3D2]">
              <span>Acceptance Invariant</span>
              <span className="font-mono text-[#1C1A17]">100% Tests Pass</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      stepBadge: "STEP 3: AUTO-RELEASE",
      title: "Automated Release & Protection",
      quote: "Zero manual delay. Payouts clear in under 50ms upon validation.",
      description:
        "When your team or automated testing suite approves the milestone, funds are instantly disbursed. Zero chargebacks, zero payment delays, and immutable records.",
      renderVisual: () => (
        <div className="bg-[#FDFCF9] rounded-xl p-4 border border-[#EAE3D2] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-emerald-900">Atomic Payout Disbursed</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              &lt;50ms
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#EAE3D2] space-y-1.5 text-xs shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8C8275]">Settlement Status:</span>
              <span className="text-emerald-700 font-semibold">Completed</span>
            </div>
            <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full rounded-full" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#8C8275] font-mono pt-0.5">
              <span>Audit ID: #SETTLE-8821</span>
              <span>Double-entry Logged</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 md:py-28 bg-[#FDFCF9] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[#9E7A45] text-xs font-medium mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C59B5F]" />
            <span>INSTITUTIONAL PROTOCOL FLOW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1A17]">
            How it works in three simple steps.
          </h2>
          <p className="text-base sm:text-lg text-[#8C8275] mt-3 leading-relaxed">
            Eliminate payment disputes and deliverable uncertainty. Verisett automates the escrow lifecycle from initial proposal to verified commercial payout.
          </p>
          {onOpenVideoModal && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={onOpenVideoModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF6EE] hover:bg-[#F5EBD7] text-[#9E7A45] hover:text-[#7A5B2E] border border-[#D4AF37]/50 hover:border-[#D4AF37] font-semibold text-xs transition-all shadow-xs cursor-pointer group"
                title="Watch 6-Step Interactive Video Walkthrough"
              >
                <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center border border-[#D4AF37]/40 shadow-2xs">
                  <Play className="w-2.5 h-2.5 fill-[#9E7A45] text-[#9E7A45] ml-0.5 group-hover:scale-110 transition-transform" />
                </div>
                <span>Watch 6-Step Video Walkthrough (30s)</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* 3 Step Cards Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col justify-between rounded-2xl bg-white border border-[#EAE3D2] hover:border-[#D4AF37] p-6 sm:p-7 shadow-[0_2px_12px_rgba(197,155,95,0.04)] hover:shadow-[0_10px_30px_rgba(197,155,95,0.09)] transition-all duration-300 will-change-transform"
            >
              <div>
                {/* Step Top Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-mono font-bold text-[#9E7A45]">
                    {step.number}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#9E7A45] border border-[#EAE3D2]">
                    {step.stepBadge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1C1A17] tracking-tight mb-2">
                  {step.title}
                </h3>

                <blockquote className="text-xs text-[#9E7A45] font-medium mb-3 italic">
                  "{step.quote}"
                </blockquote>

                <p className="text-xs sm:text-sm text-[#8C8275] leading-relaxed mb-6">
                  {step.description}
                </p>
              </div>

              {/* Render Visual Preview */}
              <div>{step.renderVisual()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

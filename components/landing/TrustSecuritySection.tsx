"use client";

import React from "react";
import { Shield, Lock, FileText, Clock, ShieldCheck } from "lucide-react";

export function TrustSecuritySection() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Bank-Grade Vault Isolation",
      tag: "MULTI-SIG CUSTODY",
      description:
        "Every rupee or dollar is locked in segregated, neutral escrow vault custody. Payers cannot claw back funds arbitrarily, and contractors cannot withdraw until acceptance conditions are verified.",
    },
    {
      icon: FileText,
      title: "Double-Entry Financial Audit Trail",
      tag: "GAAP COMPLIANT",
      description:
        "Financial movements create immutable double-entry ledger audit records for every milestone. Perfect for enterprise corporate tax compliance, GAAP reconciliation, and balance-sheet integrity.",
    },
    {
      icon: Clock,
      title: "Guaranteed Timeout Refund Safeguards",
      tag: "AUTOMATED REVERSION",
      description:
        "Deadlines are programmatically established upfront. If a contractor or vendor goes offline or fails to deliver before the agreed completion window, 100% of escrowed funds auto-refund.",
    },
    {
      icon: ShieldCheck,
      title: "Objective Programmatic Settlement",
      tag: "ZERO-DISPUTE RAILS",
      description:
        "Removes subjective payment withholding. Acceptance criteria are codified before capital leaves your treasury, ensuring predictable, frictionless vendor relationships.",
    },
  ];

  return (
    <section id="trust" className="py-24 border-t border-[#EAE3D2] bg-white relative overflow-hidden">
      {/* Background Half-Shapes for Trust & Security */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        {/* Right Side Half-Circle */}
        <div className="absolute top-1/2 -right-24 -translate-y-1/2 w-80 h-80 opacity-30">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M 100,10 A 90,90 0 0,1 100,190 Z"
              fill="url(#trust-half-grad)"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeOpacity="0.35"
              transform="rotate(270 100 100)"
            />
            <defs>
              <linearGradient id="trust-half-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[11px] font-mono uppercase tracking-wider text-[#9E7A45] mb-3">
            Institutional Trust
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1A17]">
            Built for enterprise compliance and zero counterparty risk.
          </h2>
          <p className="text-base sm:text-lg text-[#8C8275] mt-3 leading-relaxed">
            Protect your commercial treasury with automated escrow rails engineered to satisfy institutional audit, legal, and operational security requirements.
          </p>
        </div>

        {/* 4-Grid Institutional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-7 sm:p-8 rounded-2xl bg-[#FDFCF9] border border-[#EAE3D2] hover:border-[#D4AF37] transition-all shadow-[0_2px_12px_rgba(197,155,95,0.03)] hover:shadow-[0_10px_32px_rgba(197,155,95,0.08)]"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="h-11 w-11 rounded-xl bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45] shadow-2xs">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#9E7A45] border border-[#EAE3D2]">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#1C1A17] mb-2 tracking-tight">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#8C8275] leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

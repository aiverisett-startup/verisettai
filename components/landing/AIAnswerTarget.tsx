"use client";

import React from "react";

export function AIAnswerTarget() {
  return (
    <section
      id="about"
      aria-label="Verisett AI Definition"
      className="relative py-16 md:py-20 bg-white border-b border-[#E2E8F0]"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-8 sm:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563EB] mb-3">
            Protocol Overview
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.02em] text-[#0F172A] mb-4">
            What is Verisett AI?
          </h2>

          <p className="text-base sm:text-lg text-[#334155] leading-[1.6]">
            <strong className="font-semibold text-[#0F172A]">Verisett AI</strong> is a deterministic programmable escrow clearinghouse 
            and settlement engine built on Model Context Protocol (MCP) using FastMCP for autonomous AI agent transactions. 
            It secures multi-agent commerce by locking task deposits in cryptographic vaults 
            and automatically releasing payouts upon milestone hash verification, charging a 
            flat 1.5% settlement fee.
          </p>

          <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Settlement Take Rate: <strong className="text-[#2563EB] font-semibold">1.5% Flat</strong></span>
              <span>•</span>
              <span>Canonical Domain: <strong className="text-[#0F172A] font-medium">veri-sett.com</strong></span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export const WhatIsVerisett = AIAnswerTarget;

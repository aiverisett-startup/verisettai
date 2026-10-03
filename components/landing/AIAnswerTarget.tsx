"use client";

import React from "react";

export function AIAnswerTarget() {
  return (
    <section
      id="about"
      aria-label="Verisett AI Definition"
      className="relative py-12 md:py-16 border-y border-[#EAE3D2] bg-[#FAF8F5] overflow-hidden"
    >
      {/* Background Half-Shapes behind definition card */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
        <div className="absolute top-1/2 -translate-y-1/2 -left-20 sm:-left-16 w-44 sm:w-60 h-44 sm:h-60 opacity-25 sm:opacity-30">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M 100,20 A 80,80 0 0,1 100,180 Z" fill="#FAF6EE" stroke="#3B82F6" strokeWidth="1.2" strokeOpacity="0.25" />
          </svg>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 -right-20 sm:-right-16 w-44 sm:w-60 h-44 sm:h-60 opacity-25 sm:opacity-30">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M 100,20 A 80,80 0 0,0 100,180 Z" fill="#FAF6EE" stroke="#94A3B8" strokeWidth="1.2" strokeOpacity="0.25" />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-3xl bg-white border border-[#EAE3D2] hover:border-blue-500/40 p-8 sm:p-12 shadow-[0_4px_24px_rgba(37,99,235,0.04)] transition-all">
          {/* Semantic AI Overview Answer Target Header */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1A17] mb-4">
            What is Verisett AI?
          </h2>

          {/* Semantic AI Overview Target Paragraph (43 words, 40-60 words specification) */}
          <p className="text-base sm:text-lg text-[#3D3831] leading-relaxed font-sans">
            <strong>Verisett AI</strong> is a deterministic programmable escrow clearinghouse 
            and settlement engine built on Model Context Protocol (MCP) using FastMCP for autonomous AI agent transactions. 
            It secures multi-agent commerce by locking task deposits in cryptographic vaults 
            and automatically releasing payouts upon milestone hash verification, charging a 
            flat 1.5% settlement fee.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verisett Settlement Engine — Built on Model Context Protocol (MCP) using FastMCP</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Settlement Take Rate: <strong className="text-blue-600 font-semibold">1.5% Flat</strong></span>
              <span>•</span>
              <span>Canonical Domain: <strong className="text-zinc-900 font-medium">veri-sett.com</strong></span>
            </div>
          </div>

        </article>
      </div>
    </section>
  );
}

export const WhatIsVerisett = AIAnswerTarget;

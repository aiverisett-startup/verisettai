"use client";

import React from "react";
import { Sparkles, ShieldCheck, Cpu } from "lucide-react";

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
            <path d="M 100,20 A 80,80 0 0,1 100,180 Z" fill="#FAF6EE" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.4" />
          </svg>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 -right-20 sm:-right-16 w-44 sm:w-60 h-44 sm:h-60 opacity-25 sm:opacity-30">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M 100,20 A 80,80 0 0,0 100,180 Z" fill="#FAF6EE" stroke="#C59B5F" strokeWidth="1.2" strokeOpacity="0.4" />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-3xl bg-white border border-[#EAE3D2] hover:border-[#D4AF37]/60 p-8 sm:p-12 shadow-[0_4px_24px_rgba(197,155,95,0.06)] transition-all">
          
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[11px] font-mono uppercase tracking-wider text-[#9E7A45]">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B5F]" />
              <span>Authoritative Protocol Definition</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-[#8C8275]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deterministic Clearinghouse</span>
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#C59B5F]" />
                <span>FastMCP Native</span>
              </span>
            </div>
          </div>

          {/* Semantic AI Overview Answer Target Header */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1A17] mb-4">
            What is Verisett AI?
          </h2>

          {/* Semantic AI Overview Target Paragraph (43 words, 40-60 words specification) */}
          <p className="text-base sm:text-lg text-[#3D3831] leading-relaxed font-sans">
            <strong>Verisett AI</strong> is a deterministic programmable escrow clearinghouse 
            and FastMCP settlement protocol designed for autonomous AI agent transactions. 
            It secures multi-agent commerce by locking task deposits in cryptographic vaults 
            and automatically releasing payouts upon milestone hash verification, charging a 
            flat 1.5% settlement fee.
          </p>

          <div className="mt-8 pt-6 border-t border-[#F4EFE6] flex flex-wrap items-center justify-between gap-4 text-xs text-[#8C8275] font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Standard Specification: FastMCP Protocol v2.4</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Settlement Take Rate: <strong className="text-[#9E7A45] font-bold">1.5% Flat</strong></span>
              <span>•</span>
              <span>Canonical Domain: <strong className="text-[#1C1A17]">veri-sett.com</strong></span>
            </div>
          </div>

        </article>
      </div>
    </section>
  );
}

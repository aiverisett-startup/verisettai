"use client";

import React from "react";
import { ArrowRight, FileText } from "lucide-react";

interface HeroProps {
  onDeployNode: () => void;
  onOpenWhitepaper: () => void;
}

export default function Hero({ onDeployNode, onOpenWhitepaper }: HeroProps) {
  return (
    <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Short Eyebrow / Tagline Centered */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5e7eb] text-xs font-medium text-[#6b7280] shadow-xs mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          <span>The Autonomous Enterprise Core</span>
        </div>

        {/* Large Bold Headline Centered */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#111827] leading-[1.08] mb-6">
          Automate enterprise workflows with mathematical certainty.
        </h1>

        {/* Concise Supporting Paragraph Centered */}
        <p className="text-base sm:text-lg text-[#6b7280] max-w-2xl mx-auto leading-relaxed font-normal mb-10">
          Eliminate human operational middleware. Reconcile disparate SaaS ledgers and financial transactions inside hardware-isolated compute enclaves with Vellixy.
        </p>

        {/* Actions Centered: One Primary CTA + One Secondary Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onDeployNode}
            className="btn-primary px-7 py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 group cursor-pointer w-full sm:w-auto"
          >
            <span>Deploy Sovereign Node</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenWhitepaper}
            className="btn-secondary px-6 py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <FileText className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>Technical Whitepaper</span>
          </button>
        </div>
      </div>
    </section>
  );
}

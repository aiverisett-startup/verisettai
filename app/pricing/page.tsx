"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#09090B] font-sans antialiased selection:bg-blue-600/30 selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <VerisettLogo size={28} />
              <span className="text-base font-bold tracking-tight text-[#09090B] group-hover:text-blue-600 transition-colors">
                Verisett AI
              </span>
            </Link>
            <span className="hidden sm:inline-block text-slate-300">/</span>
            <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-mono text-blue-600 border border-slate-200">
              PRICING // PROTOCOL TIERS
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-blue-600" />
              <span>Back to Platform</span>
            </Link>
            <Link
              href="/docs"
              className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors hidden md:inline-block"
            >
              Developer Docs →
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Core Pricing Component */}
        <PricingSection />

        {/* Pricing FAQ Section */}
        <FAQSection />
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Verisett AI Project / Manoj S.M. — Experimental Open-Source Sandbox</p>
          <div className="flex items-center gap-4 font-mono text-xs">
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              /about
            </Link>
            <Link href="/security" className="hover:text-blue-600 transition-colors">
              /security
            </Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">
              /terms
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">
              /privacy
            </Link>
            <Link href="/docs" className="hover:text-blue-600 transition-colors">
              /docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

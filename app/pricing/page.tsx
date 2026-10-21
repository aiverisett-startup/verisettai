import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VerisettLogo } from "@/components/VerisettLogo";
import { PricingSection } from "@/components/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { WebsiteEdgeShapes } from "@/components/ui/WebsiteEdgeShapes";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { MinimalFooter } from "@/components/landing/MinimalFooter";
import { getPlans } from "@/app/actions/register";

export default async function PricingPage() {
  const initialPlans = await getPlans();

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1C1A17] font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Background Ambience */}
      <WebsiteEdgeShapes />
      <GoldenBackgroundShapes variant="subtle" density="dense" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#EAE3D2] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <VerisettLogo size={30} />
            </Link>
            <span className="hidden sm:inline-block text-[#EAE3D2]">/</span>
            <span className="hidden sm:inline-block rounded-lg bg-[#FAF8F5] px-2.5 py-1 text-[11px] font-mono text-[#6E675D] border border-[#EAE3D2]">
              TIERED CAPACITY ALLOCATION
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#EAE3D2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1C1A17] hover:border-blue-400 hover:text-blue-600 transition-all shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-blue-600" />
              <span>Back to Platform</span>
            </Link>
            <Link
              href="/docs"
              className="text-xs font-semibold text-[#6E675D] hover:text-[#1C1A17] transition-colors hidden md:inline-block"
            >
              Developer Docs →
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Core Tiered Capacity Pricing Component with direct Server-fetched capacity stats */}
        <PricingSection initialPlans={initialPlans} />

        {/* Pricing FAQ Section */}
        <FAQSection />
      </main>

      {/* Clean Monumental Footer */}
      <MinimalFooter />
    </div>
  );
}

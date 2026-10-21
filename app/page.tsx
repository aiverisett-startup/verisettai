"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MinimalNav } from "@/components/landing/MinimalNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { AgentCapabilitiesMarquee } from "@/components/landing/AgentCapabilitiesMarquee";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProtocolArchitecture } from "@/components/landing/ProtocolArchitecture";
import { DeveloperCodeSection } from "@/components/landing/DeveloperCodeSection";
import { TrustSecuritySection } from "@/components/landing/TrustSecuritySection";
import { MinimalFooter } from "@/components/landing/MinimalFooter";
import { MarketplaceWorkers } from "@/components/landing/MarketplaceWorkers";
import { AIAnswerTarget } from "@/components/landing/AIAnswerTarget";
import { FAQSection } from "@/components/landing/FAQSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TimedLoginModal } from "@/components/auth/TimedLoginModal";
import { LegalConsentModal } from "@/components/LegalConsentModal";
import { supabase } from "@/lib/supabase";
import {
  EnvironmentMode,
  TelemetryStats,
  VaultBalance,
} from "@/components/dashboard/types";

export default function Home() {
  const [envMode, setEnvMode] = useState<EnvironmentMode>("sandbox");
  const [vaultBalance, setVaultBalance] = useState<VaultBalance>({
    total_custody_cents: 0,
    available_cents: 0,
    frozen_cents: 0,
    currency: "USDC",
  });
  const [telemetry, setTelemetry] = useState<TelemetryStats>({
    volume_24h_cents: 0,
    total_contracts: 0,
    success_rate: 100.0,
    avg_latency_ms: 24,
  });
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch live protocol statistics from Supabase
    fetch("/api/protocol/stats")
      .then((res) => res.json())
      .then((stats) => {
        if (stats && isMounted) {
          setTelemetry((prev) => ({
            ...prev,
            total_contracts: stats.totalCleared || 0,
            volume_24h_cents: Math.round((stats.totalVolumeUSD || 0) * 100),
          }));
        }
      })
      .catch(() => {});

    const checkLegalConsent = async () => {
      try {
        const storedEmail = localStorage.getItem("verisett_user_email");
        const acceptedLocally = localStorage.getItem("verisett_accepted_terms") === "true";

        if (storedEmail && !acceptedLocally) {
          if (isMounted) setIsConsentOpen(true);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isMounted) {
            setCurrentUser({ id: session.user.id, email: session.user.email ?? undefined });
          }
          const { data: profile } = await supabase
            .from("profiles")
            .select("accepted_terms")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profile && !profile.accepted_terms && !acceptedLocally) {
            if (isMounted) setIsConsentOpen(true);
          }
        }
      } catch {
        // Ignore errors
      }
    };

    checkLegalConsent();

    const handleAuthEvent = () => {
      checkLegalConsent();
    };

    window.addEventListener("verisett_auth_change", handleAuthEvent);
    window.addEventListener("storage", handleAuthEvent);
    return () => {
      isMounted = false;
      window.removeEventListener("verisett_auth_change", handleAuthEvent);
      window.removeEventListener("storage", handleAuthEvent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden">
      
      {/* 1. Minimal Navigation Bar */}
      <MinimalNav
        envMode={envMode}
        onToggleEnv={setEnvMode}
        vaultBalance={vaultBalance}
      />

      {/* 2. Hero Section with High-Contrast Typography & Single Primary CTA */}
      <HeroSection onExploreConsole={() => {}} />

      {/* 3. High-Density Marquee of Enterprise Agent Frameworks */}
      <AgentCapabilitiesMarquee />

      {/* 4. Semantic AI Answer Target */}
      <AIAnswerTarget />

      {/* 5. 3-Step Mechanics Section */}
      <HowItWorksSection />

      {/* 6. Core Architecture & Condition Verification Engine */}
      <ProtocolArchitecture />

      {/* 7. Commercial Escrow Templates */}
      <MarketplaceWorkers />

      {/* 8. Developer FastMCP & REST Code Section */}
      <DeveloperCodeSection />

      {/* 9. M2M Pricing & Autonomous Tier Architecture */}
      <PricingSection />

      {/* 10. Frequently Asked Questions with FAQPage Structured Data */}
      <FAQSection />

      {/* 11. Trust, Compliance & Security Invariants */}
      <TrustSecuritySection />

      {/* Founder & Leadership Spotlight */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-zinc-950/90 border border-white/10 rounded-3xl p-8 sm:p-10 max-w-xl mx-auto backdrop-blur-md shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
          {/* Subtle Ambient Blue Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/20 blur-[80px] rounded-full"
          />

          {/* Founder Photo */}
          <div className="relative mb-4">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-zinc-800/80 shadow-2xl ring-4 ring-blue-500/20">
              <Image
                src="/founder.jpg"
                alt="Manoj S Malavalli - CEO/Founder of Verisett AI"
                width={128}
                height={128}
                className="w-full h-full object-cover object-top"
                priority
              />
            </div>
            <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950"></span>
            </span>
          </div>

          {/* Typography Hierarchy */}
          <span className="text-xs font-semibold tracking-wider text-blue-500 uppercase">
            CEO/Founder
          </span>
          <h3 className="text-2xl font-bold text-white mt-1">
            Manoj S Malavalli
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mt-3 leading-relaxed">
            Leading the architecture and vision behind Verisett AI’s autonomous clearinghouse protocol.
          </p>
          <p className="text-xs text-zinc-500 max-w-sm mt-2 font-mono">
            Building the next generation of autonomous M2M clearinghouse &amp; agent identity protocols.
          </p>

          {/* Social Profiles & About Deep Link */}
          <div className="flex items-center gap-3 mt-6">
            <a
              href="https://github.com/aiverisett-startup"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/ai_verisett"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              X / Twitter
            </a>
            <Link
              href="/about"
              className="px-3.5 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              About Vision &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Minimalist Footer */}
      <MinimalFooter />

      {/* 15-Second Institutional Timed Login Gateway */}
      <TimedLoginModal delaySeconds={15} />

      {/* Mandatory Privacy Policy & Terms Legal Consent Gate */}
      <LegalConsentModal
        isOpen={isConsentOpen}
        user={currentUser}
        onConsentSuccess={() => setIsConsentOpen(false)}
      />

    </div>
  );
}

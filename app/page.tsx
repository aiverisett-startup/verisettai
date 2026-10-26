"use client";

import React, { useState, useEffect } from "react";
import { MinimalNav } from "@/components/landing/MinimalNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { AgentCapabilitiesMarquee } from "@/components/landing/AgentCapabilitiesMarquee";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProtocolArchitecture } from "@/components/landing/ProtocolArchitecture";
import { DeveloperCodeSection } from "@/components/landing/DeveloperCodeSection";
import { TrustSecuritySection } from "@/components/landing/TrustSecuritySection";
import { TrustedByBuilders } from "@/components/landing/TrustedByBuilders";
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

      {/* 12. Community Feedback & Verified Builder Trust Preview */}
      <TrustedByBuilders />

      {/* 13. Minimalist Footer */}
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

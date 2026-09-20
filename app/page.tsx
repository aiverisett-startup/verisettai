"use client";

import React, { useState, useRef, useEffect } from "react";
import { MinimalNav } from "@/components/landing/MinimalNav";
import { TopAdBanner } from "@/components/landing/TopAdBanner";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ProtocolArchitecture } from "@/components/landing/ProtocolArchitecture";
import { DeveloperCodeSection } from "@/components/landing/DeveloperCodeSection";
import { TrustSecuritySection } from "@/components/landing/TrustSecuritySection";
import { MinimalFooter } from "@/components/landing/MinimalFooter";
import { MarketplaceWorkers } from "@/components/landing/MarketplaceWorkers";
import { AIAnswerTarget } from "@/components/landing/AIAnswerTarget";
import { FAQSection } from "@/components/landing/FAQSection";
import { LiveSettlementStream } from "@/components/dashboard/LiveSettlementStream";
import { ContractLedger } from "@/components/dashboard/ContractLedger";
import { ContractDrawer } from "@/components/dashboard/ContractDrawer";
import { DeveloperPlayground, WorkerConfig } from "@/components/dashboard/DeveloperPlayground";
import { DepositModal } from "@/components/dashboard/DepositModal";
import { VideoWalkthroughModal } from "@/components/landing/VideoWalkthroughModal";
import { TimedLoginModal } from "@/components/auth/TimedLoginModal";
import { LegalConsentModal } from "@/components/LegalConsentModal";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";
import { WebsiteEdgeShapes } from "@/components/ui/WebsiteEdgeShapes";
import { supabase } from "@/lib/supabase";
import {
  ContractRecord,
  EnvironmentMode,
  TelemetryStats,
  VaultBalance,
} from "@/components/dashboard/types";
import {
  initialContracts,
  initialTelemetry,
  initialVaultBalance,
} from "@/components/dashboard/launchData";

export default function Home() {
  const [envMode, setEnvMode] = useState<EnvironmentMode>("sandbox");
  const [vaultBalance, setVaultBalance] = useState<VaultBalance>(initialVaultBalance);
  const [telemetry, setTelemetry] = useState<TelemetryStats>(initialTelemetry);
  const [contracts, setContracts] = useState<ContractRecord[]>(initialContracts);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [activeWorkerConfig, setActiveWorkerConfig] = useState<WorkerConfig | null>(null);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
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

  const consoleSectionRef = useRef<HTMLDivElement>(null);

  const scrollToConsole = () => {
    if (consoleSectionRef.current) {
      consoleSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectWorkerForTesting = (worker: WorkerConfig) => {
    setActiveWorkerConfig(worker);
    scrollToConsole();
  };

  // Deposit handler
  const handleDeposit = (amountCents: number) => {
    setVaultBalance((prev) => ({
      ...prev,
      available_cents: prev.available_cents + amountCents,
      total_custody_cents: prev.total_custody_cents + amountCents,
    }));
  };

  // Playground simulation handler
  const handleSimulateSettlement = (
    newContract: ContractRecord,
    isSuccess: boolean
  ) => {
    // Prepend to contracts ledger
    setContracts((prev) => [newContract, ...prev]);

    // Update telemetry metrics
    setTelemetry((prev) => ({
      ...prev,
      total_contracts: prev.total_contracts + 1,
      volume_24h_cents: prev.volume_24h_cents + newContract.amount_cents,
      success_rate: isSuccess
        ? Math.min(99.9, Number((prev.success_rate + 0.05).toFixed(1)))
        : Math.max(90.0, Number((prev.success_rate - 0.2).toFixed(1))),
    }));

    // Update vault balance
    if (isSuccess) {
      setVaultBalance((prev) => ({
        ...prev,
        total_custody_cents: prev.total_custody_cents,
        available_cents: Math.max(0, prev.available_cents - newContract.fee_cents),
      }));
    } else {
      setVaultBalance((prev) => ({
        ...prev,
        available_cents: Math.max(0, prev.available_cents - newContract.amount_cents),
        frozen_cents: prev.frozen_cents + newContract.amount_cents,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#1C1A17] flex flex-col font-sans selection:bg-[#C59B5F] selection:text-white relative overflow-x-hidden">
      
      {/* Precision Institutional Edge Shapes flanking the left and right borders of the website */}
      <WebsiteEdgeShapes />

      {/* 0. Top Promotional Ad Banner with Dismiss Option */}
      <TopAdBanner />

      {/* 1. Minimal Navigation Bar */}
      <MinimalNav
        envMode={envMode}
        onToggleEnv={setEnvMode}
        vaultBalance={vaultBalance}
        onOpenDepositModal={() => setIsDepositModalOpen(true)}
        onOpenConsole={scrollToConsole}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
      />

      {/* 2. Spacious Hero Section with Polished Visual Card */}
      <HeroSection
        onExploreConsole={scrollToConsole}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
      />

      {/* Semantic AI Answer Target for Google AI Overviews & Perplexity Citations */}
      <AIAnswerTarget />

      {/* 3. Dead-Simple 3-Step Customer Onboarding Section */}
      <HowItWorksSection
        onStartOnboarding={scrollToConsole}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
      />

      {/* 4. Core Architecture & Condition Verification Engine */}
      <ProtocolArchitecture />

      {/* 5. Pre-Configured Commercial Escrow Templates */}
      <MarketplaceWorkers onSelectWorkerForTesting={handleSelectWorkerForTesting} />

      {/* 6. Live Interactive Sandbox & Vault Ledger Section */}
      <section
        ref={consoleSectionRef}
        id="sandbox"
        className="relative py-24 border-t border-[#EAE3D2] bg-[#FAF8F5] overflow-hidden"
      >
        {/* Subtle Background Half Shapes */}
        <GoldenBackgroundShapes variant="subtle" density="sparse" />

        {/* Background Half-Shapes flanking Sandbox Simulator & Ledger Section */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
          {/* Left Edge: Smooth Golden Half-Circle with Concentric Arc */}
          <div className="absolute top-1/3 -left-16 sm:-left-24 w-64 sm:w-80 h-64 sm:h-80 opacity-35 motion-safe:animate-float-slow">
            <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                d="M 150,20 A 130,130 0 0,1 150,280 Z"
                fill="#FAF6EE"
                fillOpacity="0.45"
                stroke="#C59B5F"
                strokeWidth="1.2"
                strokeOpacity="0.35"
              />
              <path
                d="M 150,45 A 105,105 0 0,1 150,255"
                stroke="#D4AF37"
                strokeWidth="1"
                strokeDasharray="4 6"
                strokeOpacity="0.25"
                fill="none"
              />
            </svg>
          </div>

          {/* Right Edge: Smooth Semicircle Disc with Concentric Orbit */}
          <div className="absolute top-1/4 -right-16 sm:-right-24 w-64 sm:w-80 h-64 sm:h-80 opacity-35 motion-safe:animate-float-reverse">
            <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                d="M 150,20 A 130,130 0 0,0 150,280 Z"
                fill="#FAF6EE"
                fillOpacity="0.45"
                stroke="#D4AF37"
                strokeWidth="1.2"
                strokeOpacity="0.35"
              />
              <path
                d="M 150,50 A 100,100 0 0,0 150,250"
                stroke="#C59B5F"
                strokeWidth="1"
                strokeDasharray="5 5"
                strokeOpacity="0.25"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1A17]">
                Institutional Escrow Simulator &amp; Vault Ledger
              </h2>
              <p className="text-base text-[#8C8275] mt-2 max-w-2xl leading-relaxed">
                Test real-time escrow locking, automated condition verification, and atomic balance settlement with the interactive sandbox below.
              </p>
            </div>

            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF6EE] border border-[#EAE3D2] text-xs font-mono text-[#1C1A17] hover:text-[#9E7A45] flex items-center gap-2 self-start md:self-auto cursor-pointer transition-all duration-200 shadow-xs hover:border-[#C59B5F]/40"
            >
              <span className="h-2 w-2 rounded-full bg-[#C59B5F] animate-pulse" />
              <span>Deposit Simulation Funds</span>
            </button>
          </div>

          {/* Live Stream Ticker & Telemetry Stats */}
          <LiveSettlementStream telemetry={telemetry} />

          {/* Developer Simulation Playground */}
          <DeveloperPlayground
            onSimulateSettlement={handleSimulateSettlement}
            availableBalanceCents={vaultBalance.available_cents}
            activeWorkerConfig={activeWorkerConfig}
          />

          {/* Filterable Contract Ledger */}
          <ContractLedger
            contracts={contracts}
            onSelectContract={(contract) => setSelectedContract(contract)}
          />

        </div>
      </section>

      {/* 5. Developer FastMCP & REST Code Section */}
      <DeveloperCodeSection />

      {/* 6. Frequently Asked Questions with FAQPage Structured Data */}
      <FAQSection />

      {/* 7. Trust, Compliance & Security Invariants */}
      <TrustSecuritySection />

      {/* 7. Minimalist Footer */}
      <MinimalFooter />

      {/* Slide-over Inspection Drawer */}
      <ContractDrawer
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
      />

      {/* Vault Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDeposit={handleDeposit}
      />

      {/* Step-by-Step Video Walkthrough Modal */}
      <VideoWalkthroughModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onNavigateSection={(anchor) => {
          const el = document.querySelector(anchor);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

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

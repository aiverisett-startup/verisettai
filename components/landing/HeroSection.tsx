"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GoldenBackgroundShapes } from "../ui/GoldenBackgroundShapes";
import { useAuthUser } from "@/lib/useAuthUser";

interface HeroSectionProps {
  onExploreConsole: () => void;
  onOpenDocs?: () => void;
  onOpenVideoModal?: () => void;
}

export function HeroSection({
  onExploreConsole,
  onOpenDocs: _onOpenDocs,
  onOpenVideoModal: _onOpenVideoModal,
}: HeroSectionProps) {
  const { user, isLoaded } = useAuthUser();
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse tracking for subtle ambient electric blue spotlight
  const mouseX = useMotionValue(400);
  const mouseY = useMotionValue(250);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Staggered entrance animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative w-full pt-20 pb-20 md:pt-28 md:pb-32 overflow-hidden bg-white border-b border-[#E2E8F0] group"
    >
      {/* Background Shapes */}
      <GoldenBackgroundShapes />

      {/* Soft Ambient Royal Blue Light */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06)_0%,transparent_70%)] blur-3xl -z-10"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center space-y-6 md:space-y-8 will-change-transform"
        >

          {/* 2. Headline with High-Contrast Navy & Slate Typography */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.02em] text-[#0F172A] leading-[1.12] will-change-transform max-w-4xl"
          >
            Programmatic Vault Escrow for Multi-Agent Economies.
          </motion.h1>

          {/* 3. High-Contrast Body Text */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-[#334155] max-w-2xl font-normal leading-[1.6] will-change-transform"
          >
            Lock milestone funds in deterministic non-custodial programmatic vaults. Automatically release payouts only when software deliverables, APIs, and commercial milestones meet verified acceptance criteria.
          </motion.p>

          {/* 4. Single Solid Primary CTA Button */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center pt-2 w-full sm:w-auto relative z-10 will-change-transform"
          >
            {isLoaded && user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_14px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
              >
                <span>ENTER CONSOLE</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_14px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </motion.div>

          {/* 5. Metric Highlights adhering to Zinc design system */}
          <motion.div
            variants={itemVariants}
            className="pt-10 mt-4 border-t border-zinc-200 w-full max-w-2xl grid grid-cols-3 gap-6 text-center will-change-transform"
          >
            <div className="group/metric">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 transition-colors group-hover/metric:text-blue-600">
                $0.00
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-medium font-sans">Counterparty Risk</div>
            </div>

            <div className="group/metric border-x border-zinc-200 px-2 sm:px-4">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-600 transition-colors group-hover/metric:text-blue-700">
                100%
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-medium font-sans">Verified Acceptance</div>
            </div>

            <div className="group/metric">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 transition-colors group-hover/metric:text-blue-600">
                &lt;50ms
              </div>
              <div className="text-xs text-zinc-500 mt-1 font-medium font-sans">Programmatic Payout</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

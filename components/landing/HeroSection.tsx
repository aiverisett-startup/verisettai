"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { HeroVisual3D } from "./HeroVisual3D";
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
  onOpenVideoModal,
}: HeroSectionProps) {
  const { user, isLoaded } = useAuthUser();
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse tracking for interactive warm golden radial spotlight
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
        staggerChildren: 0.15,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative w-full pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-[#FDFCF9] group"
    >
      {/* Dynamic Background Design: Half-Shapes, Concentric Arcs, and Golden Grid */}
      <GoldenBackgroundShapes />

      {/* Mouse-tracking Ambient Electric Blue Spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 will-change-transform -z-10 motion-reduce:hidden"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              700px circle at ${mouseX}px ${mouseY}px,
              rgba(37, 99, 235, 0.12),
              rgba(6, 182, 212, 0.04) 45%,
              transparent 75%
            )
          `,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Staggered Scroll Reveal */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start space-y-6 md:space-y-7 will-change-transform"
          >
            {/* 2. Large Bold Headline with Electric Gradient Text */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#09090B] leading-[1.14] will-change-transform"
            >
              <span>Verisett AI</span>{" "}
              <span className="text-blue-600 font-normal">—</span>{" "}
              <span className="text-gold-gradient">
                Programmatic Vault Escrow for Multi-Agent Economies.
              </span>
            </motion.h1>

            {/* 3. Concise Supporting Paragraph */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed will-change-transform"
            >
              Lock milestone funds in deterministic non-custodial programmatic vaults. Automatically release payouts only when software deliverables, APIs, and commercial milestones meet verified acceptance criteria.
            </motion.p>

            {/* 4. Action Buttons: Electric Blue Primary + White Secondary */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 pt-2 pb-2 sm:pb-0 w-full sm:w-auto relative z-10 will-change-transform"
            >
              {/* Primary CTA Button: ENTER CONSOLE (if logged in) or LOGIN */}
              {isLoaded && user ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto minimal-btn-primary flex items-center justify-center gap-2.5 cursor-pointer group/btn font-outfit font-semibold text-xs sm:text-sm tracking-wider"
                >
                  <span>ENTER CONSOLE</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="w-full sm:w-auto minimal-btn-primary flex items-center justify-center gap-2.5 cursor-pointer group/btn font-outfit font-semibold text-xs sm:text-sm tracking-wider"
                >
                  <span>LOGIN</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}

              {/* Secondary Action */}
              <button
                onClick={onExploreConsole}
                className="w-full sm:w-auto minimal-btn-secondary flex items-center justify-center gap-2 cursor-pointer font-outfit text-xs sm:text-sm"
              >
                <span>Explore Console</span>
              </button>

              {/* Video Tour Trigger */}
              {onOpenVideoModal && (
                <button
                  onClick={onOpenVideoModal}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-semibold text-[#09090B] hover:text-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-blue-50/60 border border-blue-400 shadow-xs hover:shadow-md group/tour"
                  title="Watch 30-second Interactive Video Walkthrough"
                >
                  <div className="h-5 w-5 rounded-full bg-blue-50 group-hover/tour:bg-blue-500/20 flex items-center justify-center border border-blue-300 shadow-2xs transition-colors">
                    <Play className="w-2.5 h-2.5 fill-blue-600 text-blue-600 ml-0.5 group-hover/tour:scale-110 transition-transform" />
                  </div>
                  <span>Watch Video Tour (30s)</span>
                </button>
              )}
            </motion.div>

            {/* 5. Metric Highlights */}
            <motion.div
              variants={itemVariants}
              className="pt-8 border-t border-slate-200 w-full max-w-lg grid grid-cols-3 gap-6 text-left will-change-transform"
            >
              <div className="group/metric">
                <div className="text-2xl font-bold text-[#09090B] transition-colors group-hover/metric:text-blue-600">
                  $0.00
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-normal">Counterparty Risk</div>
              </div>

              <div className="group/metric">
                <div className="text-2xl font-bold text-blue-600 transition-colors group-hover/metric:text-cyan-500">
                  100%
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-normal">Verified Acceptance</div>
              </div>

              <div className="group/metric">
                <div className="text-2xl font-bold text-[#09090B] transition-colors group-hover/metric:text-blue-600">
                  &lt;50ms
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-normal">Programmatic Payout</div>
              </div>
            </motion.div>

          </motion.div>

          {/* Right Column: Subtle Abstract Visual & Card Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:col-span-5 flex justify-center lg:justify-end w-full will-change-transform"
          >
            <HeroVisual3D />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

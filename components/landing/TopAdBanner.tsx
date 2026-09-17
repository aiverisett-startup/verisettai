"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TopAdBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem("verisett_top_ad_dismissed");
      if (isDismissed === "true") {
        setIsVisible(false);
      }
    } catch {
      // Ignore storage errors
    }
    setIsLoaded(true);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    try {
      sessionStorage.setItem("verisett_top_ad_dismissed", "true");
    } catch {
      // Ignore storage errors
    }
  };

  const handleBannerClick = () => {
    const el = document.getElementById("sandbox");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isLoaded || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden bg-[#0A0D12] border-b border-[#EAE3D2]/20 z-40 text-white"
        >
          {/* Subtle Ambient Golden Glow Behind Banner */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-gradient-to-r from-[#D4AF37]/5 via-[#C59B5F]/10 to-[#D4AF37]/5 pointer-events-none blur-2xl" />

          {/* Dismiss / Close "X" Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close advertisement banner"
            className="absolute top-3 right-3 sm:top-4 sm:right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white/90 hover:text-white border border-white/20 hover:border-[#D4AF37]/60 backdrop-blur-md text-xs font-montserrat font-semibold shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            title="Dismiss banner"
          >
            <span className="hidden sm:inline text-[11px] font-mono uppercase tracking-wider text-[#D4AF37]">
              Dismiss
            </span>
            <X className="w-4 h-4 text-white shrink-0" />
          </button>

          {/* Banner Container */}
          <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col items-center justify-center">
            {/* Top Micro-Ticker Bar */}
            <div className="w-full max-w-5xl flex items-center justify-between gap-2 px-1 mb-1.5 text-[11px] font-mono text-[#A8A29E]">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#E7E5E4] font-medium tracking-wide">
                  SPECIAL ANNOUNCEMENT // VERISETT COMMISSION COMPARISON
                </span>
              </div>
              <span className="hidden md:inline text-[#9E7A45] font-semibold">
                Lowest Take-Rate in Autonomous Clearing (1.5% vs 8.0%)
              </span>
            </div>

            {/* Clickable Image Billboard */}
            <div
              onClick={handleBannerClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleBannerClick();
                }
              }}
              className="relative w-full max-w-5xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:border-[#D4AF37]/50 bg-[#F4F5F7] group cursor-pointer transition-all duration-300"
              title="Click to explore 1.5% programmatic vault settlements"
            >
              <img
                src="/commission-banner.jpg"
                alt="Verisett AI Programmatic Vault Settlement Dashboard - 1.5% Industry-Leading Commission Rate"
                className="w-full h-auto max-h-[220px] sm:max-h-[280px] md:max-h-[340px] object-cover sm:object-contain object-center transition-transform duration-500 group-hover:scale-[1.01]"
              />

              {/* Interactive Callout Button Overlay */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111317]/90 hover:bg-[#111317] backdrop-blur-md border border-[#D4AF37]/60 text-white text-xs font-mono font-semibold shadow-xl group-hover:border-[#D4AF37] group-hover:scale-105 transition-all">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Simulate 1.5% Escrow</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

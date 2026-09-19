"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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

          {/* Banner Container - Fits cleanly on phone and wide desktop */}
          <div className="relative mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
            {/* Clickable Image Billboard with native aspect ratio and no empty side bars */}
            <div
              onClick={handleBannerClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleBannerClick();
                }
              }}
              className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border border-white/15 hover:border-[#D4AF37]/60 group cursor-pointer transition-all duration-300 bg-[#0F131A]"
              title="Click to explore 1.5% programmatic vault settlements"
            >
              {/* Full Responsive Image: fits mobile and desktop beautifully */}
              <img
                src="/commission-banner.jpg"
                alt="Verisett AI Programmatic Vault Settlement Dashboard - 1.5% Industry-Leading Commission Rate"
                className="w-full h-36 sm:h-48 md:h-56 lg:h-64 object-cover object-center block transition-transform duration-500 group-hover:scale-[1.008]"
              />

              {/* Dismiss / Close "X" Button pinned to the top-right of the banner card */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close advertisement banner"
                className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white/90 hover:text-white border border-white/20 hover:border-[#D4AF37] backdrop-blur-md shadow-md transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                title="Dismiss banner"
              >
                <X className="w-4 h-4 text-white shrink-0" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

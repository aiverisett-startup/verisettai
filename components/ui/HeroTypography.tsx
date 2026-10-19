"use client";

import React, { useRef, useState, useCallback } from "react";

export interface HeroTypographyProps {
  /** The primary brand title text (default: "Verisett AI") */
  brandName?: string;
  /** Accent text split (e.g. "AI" in "Verisett AI" can have subtle distinct luminescence) */
  brandPrefix?: string;
  brandSuffix?: string;
  /** Cyber-minimalist technical system badge above the headline */
  systemBadge?: string;
  /** Sub-headline or technical designation under the display mark */
  tagline?: string;
  /** Whether to render cyber-minimalist corner crosshairs (+) */
  showCrosshairs?: boolean;
  /** Whether the atmospheric bloom dynamically tracks cursor motion */
  interactiveSpotlight?: boolean;
  /** Optional custom class name for the wrapper canvas */
  className?: string;
}

/**
 * HeroTypography
 *
 * Antigravity / Cyber-Minimalist Signature Display Typography Component
 *
 * Engineering & Design System Standards:
 * 1. Typography Architecture:
 *    - Clamp-scaled display scale: 5rem (80px) to 9.5rem (152px)
 *    - Tight negative tracking: -0.045em for monumental brand presence
 *    - Razor-sharp linear gradient: #FFFFFF via #F8FAFC to #94A3B8 with bg-clip-text
 *    - Vector-Sharp Invariant: 0px text blur on glyphs; font smoothing locked to optimizeLegibility
 * 2. Atmospheric Blur & Lighting Engine:
 *    - Primary Bloom: Deep Electric Blue / Cyan (#0055FF -> #00D2FF) with 90-110px blur
 *    - Secondary Bloom: Deep Indigo / Violet (#4F46E5 -> #7C3AED) with 100px blur at 35% opacity
 *    - Specular Core Flare: Micro-luminance horizontal light streak beneath baseline
 * 3. Antigravity Frosted Glass Capsule:
 *    - Multi-pass backdrop-filter: blur(24px) saturate(180%)
 *    - Specular hairline border with linear gradient light-catch
 * 4. Visual Stability & 60fps GPU Compositor:
 *    - Forced translate3d(0, 0, 0) and will-change: transform on all blurred blooms
 *    - Zero anti-aliasing degradation or subpixel text jitter
 */
export function HeroTypography({
  brandPrefix = "Verisett",
  brandSuffix = "AI",
  systemBadge = "PROTOCOL CORE // AUTONOMOUS SETTLEMENT ENGINE",
  tagline = "Deterministic Vault Escrow for Multi-Agent Economies",
  showCrosshairs = true,
  interactiveSpotlight = true,
  className = "",
}: HeroTypographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse tracking for ambient light bloom steering
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveSpotlight || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, [interactiveSpotlight]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 50, y: 50 });
      }}
      className={`relative w-full overflow-hidden bg-[#030712] py-20 px-4 sm:px-6 md:py-28 lg:py-36 flex flex-col items-center justify-center select-none ${className}`}
      style={{
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
      }}
    >
      {/* =========================================================================
          BACKGROUND LAYER: Atmospheric Deep Slate-Black Canvas & Technical Grid
          ========================================================================= */}
      {/* Cyber-minimalist fine hairline grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #FFFFFF 1px, transparent 1px),
            linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 80%)",
        }}
      />

      {/* Atmospheric Radial Vignette (Keeps focus locked on the centerpiece) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030712_85%)]" />

      {/* =========================================================================
          LIGHTING ENGINE: Multi-Layered GPU-Accelerated Atmospheric Blooms
          (Strictly positioned BEHIND text and glass plate; text retains 0px blur)
          ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        {/* Bloom 1: Primary Deep Electric Blue / Cyan Bloom (#0055FF -> #00D2FF) */}
        <div
          className="absolute w-[360px] h-[220px] sm:w-[580px] sm:h-[300px] md:w-[740px] md:h-[380px] rounded-full transition-transform duration-700 ease-out"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0, 210, 255, 0.42) 0%, rgba(0, 85, 255, 0.35) 45%, rgba(0, 40, 180, 0.12) 70%, transparent 85%)",
            filter: "blur(95px)",
            WebkitFilter: "blur(95px)",
            transform: interactiveSpotlight
              ? `translate3d(${(mousePos.x - 50) * 0.4}px, ${(mousePos.y - 50) * 0.3}px, 0)`
              : "translate3d(0, 0, 0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* Bloom 2: Secondary Deep Indigo / Violet Radial Glow (#4F46E5 -> #7C3AED) */}
        <div
          className="absolute w-[320px] h-[200px] sm:w-[500px] sm:h-[260px] md:w-[640px] md:h-[320px] rounded-full transition-transform duration-1000 ease-out"
          style={{
            background:
              "radial-gradient(circle at center, rgba(124, 58, 237, 0.36) 0%, rgba(79, 70, 229, 0.28) 40%, rgba(67, 56, 202, 0.08) 75%, transparent 85%)",
            filter: "blur(105px)",
            WebkitFilter: "blur(105px)",
            transform: interactiveSpotlight
              ? `translate3d(${(mousePos.x - 50) * -0.35 + 40}px, ${(mousePos.y - 50) * -0.25 - 20}px, 0)`
              : "translate3d(40px, -20px, 0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />

        {/* Bloom 3: Specular Azure Core Light Flare (Horizontal accent bar directly behind typography baseline) */}
        <div
          className="absolute w-[280px] sm:w-[500px] md:w-[680px] h-[2px] opacity-75"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0, 210, 255, 0.2) 25%, rgba(255, 255, 255, 0.8) 50%, rgba(0, 210, 255, 0.2) 75%, transparent 100%)",
            filter: "blur(2px)",
            WebkitFilter: "blur(2px)",
            transform: "translate3d(0, 45px, 0)",
            willChange: "transform",
          }}
        />
      </div>

      {/* =========================================================================
          FROSTED GLASS PLATE: Antigravity Cyber-Minimalist Capsule
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Outer Glass Enclosure with Hairline Specular Border & Light Catch */}
        <div
          className="relative w-full rounded-2xl md:rounded-3xl p-6 sm:p-10 md:p-14 lg:p-16 flex flex-col items-center text-center transition-all duration-500"
          style={{
            // High-grade double-pass blur & saturation boost
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            // Dark translucent surface fill
            backgroundColor: "rgba(15, 23, 42, 0.38)",
            // Specular border: Hairline top light catch fading cleanly to sides
            boxShadow: `
              inset 0 1px 0 0 rgba(255, 255, 255, 0.18),
              inset 0 -1px 0 0 rgba(255, 255, 255, 0.04),
              0 24px 60px -15px rgba(0, 0, 0, 0.75),
              0 0 40px -10px rgba(0, 130, 255, 0.15)
            `,
            border: "1px solid rgba(255, 255, 255, 0.09)",
            transform: "translate3d(0, 0, 0)",
            willChange: "transform",
          }}
        >
          {/* Hairline top gradient highlight stroke */}
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 30%, rgba(0, 210, 255, 0.6) 50%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)",
            }}
          />

          {/* Precision Cybernetic Corner Crosshairs (+) */}
          {showCrosshairs && (
            <>
              <span className="pointer-events-none absolute top-2.5 left-3 text-[11px] font-mono text-zinc-500/70 select-none">
                +
              </span>
              <span className="pointer-events-none absolute top-2.5 right-3 text-[11px] font-mono text-zinc-500/70 select-none">
                +
              </span>
              <span className="pointer-events-none absolute bottom-2.5 left-3 text-[11px] font-mono text-zinc-500/70 select-none">
                +
              </span>
              <span className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] font-mono text-zinc-500/70 select-none">
                +
              </span>
            </>
          )}

          {/* 1. Cyber-Minimalist Technical System Badge */}
          {systemBadge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-6 sm:mb-8 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#00D2FF]" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-[0.16em] uppercase text-zinc-300">
                {systemBadge}
              </span>
            </div>
          )}

          {/* =====================================================================
              2. PRIMARY DISPLAY TYPOGRAPHY: "Verisett AI"
                 - Oversized Display Scale (5rem to 9.5rem / 80px to 152px)
                 - Letter-spacing: -0.045em (tight, cinematic, monolithic)
                 - Weight: 900 (Black / Grotesque Heavy)
                 - Razor-sharp White-to-Slate Gradient (#FFFFFF -> #F8FAFC -> #94A3B8)
                 - INVARIANT: 100% Vector Crispness (filter: none)
              ===================================================================== */}
          <h1
            className="relative tracking-[-0.045em] font-black leading-[0.92] select-none text-balance"
            style={{
              // Responsive clamp scaling: 5rem (80px) on mobile -> 9.5rem (152px) on desktop
              fontSize: "clamp(3.75rem, 9.2vw, 9.5rem)",
              fontFamily:
                'var(--font-sans, "Geist Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
              // Strictly zero blur on text glyphs
              filter: "none",
              WebkitFilter: "none",
            }}
          >
            {/* The Razor-Sharp Gradient Text Characters */}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 28%, #F8FAFC 60%, #94A3B8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "none",
              }}
            >
              {brandPrefix}
            </span>

            {/* Non-breaking space */}
            <span className="inline-block">&nbsp;</span>

            {/* Suffix "AI" with Specular Ice-Cyan Accent Tint & High Contrast */}
            <span
              className="inline-block bg-clip-text text-transparent relative"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 35%, #BAE6FD 65%, #38BDF8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "none",
              }}
            >
              {brandSuffix}

              {/* Sub-pixel hairline specular rim light at the top edge of AI */}
              <span
                aria-hidden="true"
                className="absolute inset-0 select-none pointer-events-none opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 40%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {brandSuffix}
              </span>
            </span>
          </h1>

          {/* 3. Technical Tagline / Autonomous Economy Subline */}
          {tagline && (
            <p className="mt-6 sm:mt-8 text-sm sm:text-base md:text-lg font-normal tracking-wide text-zinc-300/90 max-w-2xl text-balance leading-relaxed">
              {tagline}
            </p>
          )}

          {/* 4. Cyber-Minimalist Telemetry Badges (Antigravity Architecture Invariants) */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-white/[0.07] w-full max-w-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
              <span className="text-zinc-300">VAULT: NON-CUSTODIAL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">//</span>
              <span className="text-zinc-300">DISPATCH: &lt;50MS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">//</span>
              <span className="text-cyan-300 font-semibold">FAST-MCP NATIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroTypography;

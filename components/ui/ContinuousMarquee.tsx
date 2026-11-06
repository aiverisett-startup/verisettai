"use client";

import React from "react";

export interface ContinuousMarqueeProps {
  /** The content to animate continuously inside the marquee loop */
  children: React.ReactNode;
  /** Horizontal animation scroll direction */
  direction?: "left" | "right";
  /** Full loop duration in seconds (lower is faster, default: 35) */
  duration?: number;
  /** Tailwind gap utility for spacing between items (default: 'gap-4') */
  gap?: string;
  /** Optional container class for outer framing and margin/padding */
  className?: string;
  /** Number of times to duplicate children inside each track to exceed viewport width (default: 2) */
  repeat?: number;
  /** Whether to render smooth alpha fade gradients on the left and right edges */
  gradientFade?: boolean;
  /** Tailwind from-color for the gradient fade edges */
  gradientColor?: string;
  /** Tailwind width class for the fade masks (default: 'w-24 sm:w-36') */
  fadeWidth?: string;
}

/**
 * ContinuousMarquee
 *
 * Enterprise-grade, 60fps GPU-composited infinite marquee component.
 *
 * Architecture Invariants:
 * 1. Zero Interaction Pausing: Pointer events are ignored so hovering, clicking, or dragging
 *    never interrupts or decelerates the linear motion.
 * 2. Zero Text Jitter / Anti-Aliased Subpixel Rendering: Strictly animates 3D transforms
 *    (`translate3d`) with hardware layer promotion, backface culling, and legibility optimization.
 * 3. Seamless Dual-Track Lockstep Loop: Two identical tracks move from 0% to -100% simultaneously,
 *    eliminating blank spaces, snap-back resets, and viewport width recalculations.
 */
export function ContinuousMarquee({
  children,
  direction = "left",
  duration = 35,
  gap = "gap-4",
  className = "",
  repeat = 2,
  gradientFade = false,
  gradientColor = "from-white dark:from-zinc-950",
  fadeWidth = "w-24 sm:w-36",
}: ContinuousMarqueeProps) {
  // Multiply children inside each track so a single track easily covers ultra-wide 4K viewports
  const trackItems = Array.from({ length: repeat }).map((_, i) => (
    <React.Fragment key={`repeat-${i}`}>{children}</React.Fragment>
  ));

  const animationName =
    direction === "left" ? "vrs-marquee-left" : "vrs-marquee-right";

  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
    >
      <style>{`
        @keyframes vrs-marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        @keyframes vrs-marquee-right {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
      `}</style>

      {/* Optional Left and Right Soft Vignette Fade Masks */}
      {gradientFade && (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 ${fadeWidth} bg-gradient-to-r ${gradientColor} to-transparent z-10`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 ${fadeWidth} bg-gradient-to-l ${gradientColor} to-transparent z-10`}
          />
        </>
      )}

      {/* Main Track Frame */}
      <div className="flex w-max shrink-0 select-none pointer-events-none">
        {/* Track A: Moves from 0% -> -100% (or -100% -> 0%) */}
        <div
          className={`flex shrink-0 items-center ${gap} pr-4 select-none pointer-events-none`}
          style={{
            animation: `${animationName} ${duration}s linear infinite`,
            willChange: "transform",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {trackItems}
        </div>

        {/* Track B: Exact clone moving in absolute lockstep for 0px visual seam */}
        <div
          className={`flex shrink-0 items-center ${gap} pr-4 select-none pointer-events-none`}
          aria-hidden="true"
          style={{
            animation: `${animationName} ${duration}s linear infinite`,
            willChange: "transform",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {trackItems}
        </div>
      </div>
    </div>
  );
}

export default ContinuousMarquee;

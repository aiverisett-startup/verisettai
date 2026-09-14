"use client";

import React from "react";

interface GoldenBackgroundShapesProps {
  className?: string;
  intensity?: "subtle" | "prominent";
  variant?: "subtle" | "prominent";
  density?: "sparse" | "normal" | "dense";
}

export function GoldenBackgroundShapes({
  className = "",
  intensity = "subtle",
  variant = "subtle",
  density = "normal",
}: GoldenBackgroundShapesProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none -z-10 ${className}`}
    >
      {/* 1. Golden Dot Matrix Grid with Radial Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(#C59B5F_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.14] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_30%,#000_50%,transparent_90%)]" />

      {/* 2. Soft Ambient Golden Glow Auras */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[450px] w-[800px] rounded-full bg-gradient-to-b from-[#FAF1E3] via-[#F6E8D0]/50 to-transparent blur-3xl opacity-70 animate-pulse-gold" />
      <div className="absolute top-1/3 -left-48 h-96 w-96 rounded-full bg-[#EFE4D0]/60 blur-3xl opacity-50" />
      <div className="absolute top-2/3 -right-48 h-96 w-96 rounded-full bg-[#F5EADB]/60 blur-3xl opacity-50" />

      {/* 3. Top-Right Large Floating Half-Circle (Semicircle) with Concentric Arcs */}
      <div className="absolute -top-16 -right-20 w-80 sm:w-[420px] h-80 sm:h-[420px] motion-safe:animate-float-slow">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-65"
        >
          <defs>
            <linearGradient id="gold-half-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#C59B5F" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C59B5F" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Solid Golden Half-Circle */}
          <path
            d="M 200,20 A 180,180 0 0,1 200,380 Z"
            fill="url(#gold-half-grad)"
            stroke="url(#gold-stroke)"
            strokeWidth="1.5"
            transform="rotate(25 200 200)"
          />

          {/* Outer Concentric Half-Arch */}
          <path
            d="M 200,-5 A 205,205 0 0,1 200,405"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.35"
            transform="rotate(25 200 200)"
          />

          {/* Inner Decorative Golden Arc */}
          <path
            d="M 200,70 A 130,130 0 0,1 200,330"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            transform="rotate(25 200 200)"
          />

          {/* Vertex Node Accents */}
          <circle cx="270" cy="90" r="3.5" fill="#C59B5F" />
          <circle cx="340" cy="200" r="4.5" fill="#D4AF37" />
          <circle cx="270" cy="310" r="3.5" fill="#C59B5F" />
        </svg>
      </div>

      {/* 4. Left-Mid Architectural Half-Arch Motif */}
      <div className="absolute top-1/4 -left-16 w-64 sm:w-80 h-72 sm:h-96 motion-safe:animate-float-reverse">
        <svg
          viewBox="0 0 300 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-60"
        >
          {/* Main Half-Arch */}
          <path
            d="M 20,380 L 20,160 A 140,140 0 0,1 160,20 L 200,20"
            stroke="#C59B5F"
            strokeWidth="1.5"
            strokeOpacity="0.45"
          />
          {/* Parallel Inner Arch */}
          <path
            d="M 50,380 L 50,175 A 110,110 0 0,1 160,65 L 180,65"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="5 5"
            strokeOpacity="0.3"
          />
          {/* Architectural Horizontal Rungs */}
          <line x1="20" y1="220" x2="50" y2="220" stroke="#C59B5F" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="20" y1="280" x2="50" y2="280" stroke="#C59B5F" strokeWidth="1.2" strokeOpacity="0.4" />
          <line x1="20" y1="340" x2="50" y2="340" stroke="#C59B5F" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Golden Capsule Pill in Half-Arch Center */}
          <rect
            x="30"
            y="90"
            width="80"
            height="32"
            rx="16"
            fill="#FFFFFF"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeOpacity="0.5"
            className="shadow-sm"
          />
          <circle cx="46" cy="106" r="4" fill="#C59B5F" />
          <line x1="58" y1="106" x2="96" y2="106" stroke="#9E7A45" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      </div>

      {/* 5. Center-Top Rotating Dual Half-Rings */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] pointer-events-none opacity-40">
        <svg
          viewBox="0 0 600 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Upper Elliptical Half-Ring */}
          <path
            d="M 50,180 C 50,70 550,70 550,180"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            strokeOpacity="0.4"
          />
          {/* Lower Echo Arc */}
          <path
            d="M 120,180 C 120,105 480,105 480,180"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      {/* 6. Lower-Right Angled Geometric Half-Capsule (Pill) */}
      <div className="absolute bottom-20 right-8 w-44 h-24 rotate-[-20deg] pointer-events-none opacity-50 hidden md:block">
        <div className="w-full h-full rounded-t-full border-t border-x border-[#D4AF37]/40 bg-gradient-to-b from-white/90 to-transparent shadow-xs backdrop-blur-xs flex items-center justify-center">
          <div className="w-16 h-1 rounded-full bg-[#C59B5F]/30" />
        </div>
      </div>
    </div>
  );
}

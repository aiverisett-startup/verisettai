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
}: GoldenBackgroundShapesProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none -z-10 ${className}`}
    >
      {/* 1. Subtle Slate/Blue Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:36px_36px] opacity-[0.05] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,#000_40%,transparent_90%)]" />

      {/* 2. Soft Ambient Blue Tint */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

      {/* 3. Subtle Hairline Geometric Semicircle */}
      <div className="absolute -top-20 -right-20 w-80 sm:w-[400px] h-80 sm:h-[400px] opacity-40">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 200,30 A 170,170 0 0,1 200,370"
            stroke="#2563EB"
            strokeWidth="1"
            strokeOpacity="0.2"
            strokeDasharray="4 6"
          />
          <circle cx="200" cy="200" r="120" stroke="#E2E8F0" strokeWidth="1" strokeOpacity="0.6" />
        </svg>
      </div>

      {/* 4. Left Subtle Arc */}
      <div className="absolute top-1/3 -left-20 w-64 h-64 opacity-30">
        <svg viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="130" cy="130" r="100" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="6 6" />
          <path d="M 130,30 A 100,100 0 0,1 230,130" stroke="#2563EB" strokeWidth="1.2" strokeOpacity="0.3" />
        </svg>
      </div>
    </div>
  );
}


"use client";

import React from "react";

export function WebsiteEdgeShapes() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-10"
    >
      {/* =========================================================================
          LEFT FLANK EDGE SHAPES (Distributed throughout the website height)
      ========================================================================= */}

      {/* 1. Top-Left Hero Edge: Concentric Quarter-Circles & Precision Caliper */}
      <div className="absolute top-28 sm:top-36 -left-16 sm:-left-20 w-64 sm:w-80 h-64 sm:h-80 opacity-55 motion-safe:animate-float-slow">
        <svg
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="edge-gold-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#C59B5F" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="edge-stroke-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C59B5F" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Semicircular Solid Arc */}
          <path
            d="M 20,150 A 130,130 0 0,1 150,20 L 150,150 Z"
            fill="url(#edge-gold-1)"
            stroke="url(#edge-stroke-1)"
            strokeWidth="1.2"
          />

          {/* Outer Dashed Orbit */}
          <path
            d="M 0,170 A 170,170 0 0,1 170,0"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.4"
          />

          {/* Precision Caliper Bracket */}
          <path
            d="M 12,240 L 12,190 L 62,190"
            stroke="#9E7A45"
            strokeWidth="1.5"
            strokeOpacity="0.45"
          />
          <circle cx="12" cy="190" r="2.5" fill="#C59B5F" />
          <circle cx="150" cy="20" r="3.5" fill="#D4AF37" />
          <circle cx="20" cy="150" r="3.5" fill="#C59B5F" />

          {/* Caliper Ticks */}
          <line x1="0" y1="120" x2="8" y2="120" stroke="#9E7A45" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="0" y1="90" x2="12" y2="90" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.5" />
          <line x1="0" y1="60" x2="8" y2="60" stroke="#9E7A45" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="0" y1="30" x2="12" y2="30" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.5" />
        </svg>
      </div>

      {/* 2. Upper-Mid Left: Vertical Edge Rail with Golden Milestone Nodes (How It Works Flank) */}
      <div className="absolute top-[880px] sm:top-[960px] left-0 w-24 sm:w-36 h-[480px] opacity-60">
        <svg
          viewBox="0 0 120 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Vertical Continuous Golden Rail */}
          <line x1="16" y1="0" x2="16" y2="480" stroke="#EAE3D2" strokeWidth="1.5" />
          <line x1="22" y1="40" x2="22" y2="440" stroke="#C59B5F" strokeWidth="1" strokeDasharray="6 6" strokeOpacity="0.4" />

          {/* Node 1: Milestone Alpha */}
          <circle cx="16" cy="80" r="5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="16" cy="80" r="2" fill="#9E7A45" />
          <path d="M 16,80 L 45,80 L 60,95" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="60" cy="95" r="2" fill="#C59B5F" />

          {/* Small architectural bracket */}
          <path d="M 4,140 L 4,160 L 24,160" stroke="#9E7A45" strokeWidth="1" strokeOpacity="0.4" />

          {/* Node 2: Milestone Beta */}
          <circle cx="16" cy="240" r="6" fill="#FFFFFF" stroke="#C59B5F" strokeWidth="1.5" />
          <circle cx="16" cy="240" r="2.5" fill="#C59B5F" />
          <path d="M 16,240 Q 60,240 70,280" stroke="#C59B5F" strokeWidth="1" strokeOpacity="0.35" fill="none" />
          <circle cx="70" cy="280" r="3" fill="#D4AF37" />

          {/* Concentric Quarter-Arch Arc emerging from left edge */}
          <path
            d="M 0,380 A 70,70 0 0,1 70,310"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.4"
            fill="none"
          />
          <circle cx="70" cy="310" r="3" fill="#9E7A45" />

          {/* Ruler Edge Ticks */}
          {[110, 125, 175, 190, 205, 330, 345, 360, 410, 425].map((y) => (
            <line key={y} x1="16" y1={y} x2="24" y2={y} stroke="#C59B5F" strokeWidth="1" strokeOpacity="0.35" />
          ))}
        </svg>
      </div>

      {/* 3. Mid Left: Architecture & Cryptographic Escrow Caliper (Protocol Section Flank) */}
      <div className="absolute top-[1750px] sm:top-[1850px] -left-12 sm:-left-16 w-56 sm:w-72 h-80 opacity-55 motion-safe:animate-float-reverse">
        <svg
          viewBox="0 0 280 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Half Diamond & Architectural Vault Caliper */}
          <path
            d="M 20,160 L 140,40 L 140,280 Z"
            fill="#FAF6EE"
            fillOpacity="0.5"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
          <path
            d="M 30,160 L 130,60 L 130,260 Z"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.3"
            fill="none"
          />

          {/* Horizontal Extension Rail */}
          <line x1="140" y1="160" x2="240" y2="160" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.4" />
          <circle cx="240" cy="160" r="4" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="240" cy="160" r="2" fill="#C59B5F" />

          {/* Micro Node Crosshairs */}
          <line x1="140" y1="30" x2="140" y2="50" stroke="#C59B5F" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="130" y1="40" x2="150" y2="40" stroke="#C59B5F" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="140" y1="270" x2="140" y2="290" stroke="#C59B5F" strokeWidth="1.5" strokeOpacity="0.6" />
          <line x1="130" y1="280" x2="150" y2="280" stroke="#C59B5F" strokeWidth="1.5" strokeOpacity="0.6" />
        </svg>
      </div>

      {/* 4. Lower-Mid Left: Marketplace Architectural Arch & Concentric Rings */}
      <div className="absolute top-[2600px] sm:top-[2750px] -left-18 sm:-left-22 w-64 sm:w-88 h-72 sm:h-96 opacity-50 motion-safe:animate-float-slow">
        <svg
          viewBox="0 0 360 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Half-circle Arch */}
          <path
            d="M 40,300 A 130,130 0 0,1 300,300"
            stroke="#C59B5F"
            strokeWidth="1.5"
            strokeOpacity="0.45"
            fill="none"
          />
          <path
            d="M 80,300 A 90,90 0 0,1 260,300"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="5 7"
            strokeOpacity="0.35"
            fill="none"
          />
          <circle cx="170" cy="170" r="5" fill="#D4AF37" />
          <line x1="170" y1="170" x2="170" y2="300" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.4" />
          <circle cx="40" cy="300" r="3.5" fill="#C59B5F" />
          <circle cx="300" cy="300" r="3.5" fill="#9E7A45" />
        </svg>
      </div>

      {/* 5. Mid-Lower Left: Sandbox & Ledger Vault Lock Caliper */}
      <div className="absolute top-[3400px] sm:top-[3550px] left-0 w-36 sm:w-48 h-72 opacity-50">
        <svg
          viewBox="0 0 180 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Angular Institutional Corner Bracket */}
          <path
            d="M 0,50 L 70,50 L 110,90 L 110,190 L 70,230 L 0,230"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
          />
          <circle cx="110" cy="90" r="3.5" fill="#D4AF37" />
          <circle cx="110" cy="190" r="3.5" fill="#9E7A45" />
          <line x1="20" y1="140" x2="100" y2="140" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 4" strokeOpacity="0.35" />
          <circle cx="20" cy="140" r="2.5" fill="#C59B5F" />
          {/* Outer Dashed Orbit */}
          <path
            d="M 0,260 A 130,130 0 0,1 130,130"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.3"
            fill="none"
          />
        </svg>
      </div>

      {/* 6. Developer Code Flank Left: Hexagonal Node & FastMCP Bus Rail */}
      <div className="absolute top-[4250px] sm:top-[4400px] -left-10 sm:-left-14 w-48 sm:w-60 h-60 opacity-50 motion-safe:animate-float-reverse">
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Algorithmic Bracket */}
          <path
            d="M 20,40 L 80,40 L 120,80 L 120,160 L 80,200 L 20,200"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
          />
          <circle cx="120" cy="80" r="3.5" fill="#C59B5F" />
          <circle cx="120" cy="160" r="3.5" fill="#D4AF37" />
          <line x1="30" y1="120" x2="110" y2="120" stroke="#9E7A45" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
          <circle cx="110" cy="120" r="2" fill="#9E7A45" />
        </svg>
      </div>

      {/* 7. Trust & Security Flank Left: Security Shield Caliper & Golden Orbit */}
      <div className="absolute top-[5000px] sm:top-[5150px] -left-12 sm:-left-16 w-56 sm:w-72 h-72 opacity-50 motion-safe:animate-float-slow">
        <svg
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Concentric Quarter-Arch */}
          <path
            d="M 20,240 A 120,120 0 0,1 140,120 L 140,240 Z"
            fill="#FAF6EE"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
          <path
            d="M 0,260 A 160,160 0 0,1 160,100"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.35"
            fill="none"
          />
          <circle cx="140" cy="120" r="3.5" fill="#D4AF37" />
          <circle cx="20" cy="240" r="3.5" fill="#C59B5F" />
        </svg>
      </div>

      {/* 8. Bottom Left Footer Edge: Architectural Corner L-Bracket */}
      <div className="absolute bottom-8 left-0 w-36 sm:w-48 h-36 opacity-45">
        <svg
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 16,16 L 16,110 L 110,110"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
          />
          <path
            d="M 4,130 A 120,120 0 0,0 130,4"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.3"
            fill="none"
          />
          <circle cx="16" cy="16" r="3" fill="#D4AF37" />
          <circle cx="16" cy="110" r="3.5" fill="#9E7A45" />
          <circle cx="110" cy="110" r="3" fill="#C59B5F" />
        </svg>
      </div>


      {/* =========================================================================
          RIGHT FLANK EDGE SHAPES (Distributed throughout the website height)
      ========================================================================= */}

      {/* 9. Top-Right Hero Edge: Semicircular Orbit & Floating Pill Motif */}
      <div className="absolute top-20 sm:top-28 -right-16 sm:-right-24 w-72 sm:w-96 h-72 sm:h-96 opacity-60 motion-safe:animate-float-reverse">
        <svg
          viewBox="0 0 380 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Gradient-Filled Half Arc cutting in from the right edge */}
          <path
            d="M 200,30 A 160,160 0 0,0 200,350 L 200,30 Z"
            fill="#FAF6EE"
            fillOpacity="0.45"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          {/* Nested Dashed Concentric Arc */}
          <path
            d="M 200,60 A 130,130 0 0,0 200,320"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="6 6"
            strokeOpacity="0.4"
            fill="none"
          />
          {/* Inner Accent Ring */}
          <path
            d="M 200,100 A 90,90 0 0,0 200,280"
            stroke="#9E7A45"
            strokeWidth="1.2"
            strokeOpacity="0.3"
            fill="none"
          />
          {/* Orbital Nodes */}
          <circle cx="70" cy="190" r="5" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="70" cy="190" r="2.5" fill="#C59B5F" />
          <circle cx="110" cy="100" r="3.5" fill="#D4AF37" />
          <circle cx="110" cy="280" r="3.5" fill="#9E7A45" />

          {/* Crosshair Accent */}
          <line x1="70" y1="175" x2="70" y2="205" stroke="#C59B5F" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="55" y1="190" x2="85" y2="190" stroke="#C59B5F" strokeWidth="1" strokeOpacity="0.4" />
        </svg>
      </div>

      {/* 10. Upper-Mid Right: Institutional Verification Grid & Caliper (How It Works Flank) */}
      <div className="absolute top-[900px] sm:top-[1020px] -right-8 sm:-right-12 w-48 sm:w-64 h-80 opacity-55">
        <svg
          viewBox="0 0 240 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Corner Precision Caliper Frame */}
          <path
            d="M 220,20 L 60,20 L 60,180 L 120,240 L 220,240"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
          />
          <line x1="60" y1="20" x2="60" y2="4" stroke="#9E7A45" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="60" y1="20" x2="44" y2="20" stroke="#9E7A45" strokeWidth="1.5" strokeOpacity="0.5" />

          {/* Floating Verification Pill */}
          <rect
            x="75"
            y="50"
            width="120"
            height="36"
            rx="18"
            fill="#FFFFFF"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          <circle cx="95" cy="68" r="4" fill="#C59B5F" />
          <line x1="108" y1="68" x2="165" y2="68" stroke="#9E7A45" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* Caliper Ticks */}
          {[90, 105, 120, 135, 150, 165].map((y) => (
            <line key={y} x1="54" y1={y} x2="60" y2={y} stroke="#9E7A45" strokeWidth="1" strokeOpacity="0.35" />
          ))}
        </svg>
      </div>

      {/* 11. Mid Right: Protocol Condition Engine Ellipse & Node Ring */}
      <div className="absolute top-[1800px] sm:top-[1920px] -right-16 sm:-right-20 w-64 sm:w-80 h-72 sm:h-96 opacity-60 motion-safe:animate-float-slow">
        <svg
          viewBox="0 0 320 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Large Arc Slice */}
          <path
            d="M 300,40 A 180,180 0 0,0 80,220 L 300,220 Z"
            fill="#FAF8F5"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
          <path
            d="M 300,70 A 150,150 0 0,0 120,220"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="5 5"
            strokeOpacity="0.35"
            fill="none"
          />

          {/* Node and Connecting Ray */}
          <circle cx="80" cy="220" r="5" fill="#D4AF37" />
          <line x1="80" y1="220" x2="20" y2="280" stroke="#9E7A45" strokeWidth="1.2" strokeOpacity="0.4" />
          <circle cx="20" cy="280" r="3" fill="#C59B5F" />
        </svg>
      </div>

      {/* 12. Lower-Mid Right: Worker Marketplace Vault Pill & Compass Arcs */}
      <div className="absolute top-[2650px] sm:top-[2800px] -right-12 sm:-right-16 w-56 sm:w-72 h-80 opacity-55 motion-safe:animate-float-reverse">
        <svg
          viewBox="0 0 260 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Concentric Double Arcs */}
          <path
            d="M 240,60 C 140,60 60,140 60,240"
            stroke="#C59B5F"
            strokeWidth="1.5"
            strokeOpacity="0.45"
            fill="none"
          />
          <path
            d="M 240,90 C 160,90 90,160 90,240"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.35"
            fill="none"
          />
          <circle cx="60" cy="240" r="4.5" fill="#D4AF37" />
          <circle cx="90" cy="240" r="3" fill="#9E7A45" />

          {/* Precision Micro-crosshairs */}
          <line x1="50" y1="140" x2="70" y2="140" stroke="#C59B5F" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="60" y1="130" x2="60" y2="150" stroke="#C59B5F" strokeWidth="1" strokeOpacity="0.4" />
        </svg>
      </div>

      {/* 13. Mid-Lower Right: Sandbox Cryptographic Ledger Frame */}
      <div className="absolute top-[3450px] sm:top-[3600px] -right-10 sm:-right-14 w-52 sm:w-68 h-72 opacity-50">
        <svg
          viewBox="0 0 260 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 240,30 L 60,30 L 60,210 L 240,210"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
          />
          <circle cx="60" cy="30" r="3.5" fill="#C59B5F" />
          <circle cx="60" cy="210" r="3.5" fill="#9E7A45" />
          <line x1="60" y1="120" x2="220" y2="120" stroke="#C59B5F" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.35" />
          <circle cx="140" cy="120" r="3" fill="#D4AF37" />
        </svg>
      </div>

      {/* 14. Developer API Right: Stepped Geometric Caliper */}
      <div className="absolute top-[4300px] sm:top-[4450px] -right-10 sm:-right-14 w-48 sm:w-60 h-52 opacity-50 motion-safe:animate-float-slow">
        <svg
          viewBox="0 0 240 210"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 220,20 L 160,20 L 120,60 L 120,150 L 160,190 L 220,190"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
          />
          <circle cx="120" cy="60" r="3" fill="#C59B5F" />
          <circle cx="120" cy="150" r="3" fill="#D4AF37" />
          <line x1="130" y1="105" x2="210" y2="105" stroke="#C59B5F" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.35" />
        </svg>
      </div>

      {/* 15. Trust & Security Right: Concentric Vault Half-Arc */}
      <div className="absolute top-[5050px] sm:top-[5200px] -right-14 sm:-right-18 w-64 sm:w-80 h-72 opacity-50 motion-safe:animate-float-reverse">
        <svg
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 180,30 A 140,140 0 0,0 180,310 L 180,30 Z"
            fill="#FAF6EE"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
          <path
            d="M 180,60 A 110,110 0 0,0 180,280"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="5 5"
            strokeOpacity="0.35"
            fill="none"
          />
          <circle cx="70" cy="170" r="4" fill="#D4AF37" />
          <circle cx="105" cy="95" r="3" fill="#C59B5F" />
          <circle cx="105" cy="245" r="3" fill="#9E7A45" />
        </svg>
      </div>

      {/* 16. Bottom Right Footer Edge: Mirror Corner Caliper & Precision Ticks */}
      <div className="absolute bottom-8 right-0 w-36 sm:w-48 h-36 opacity-45">
        <svg
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 160,16 L 160,110 L 60,110"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            fill="none"
          />
          <circle cx="160" cy="16" r="3" fill="#C59B5F" />
          <circle cx="160" cy="110" r="3.5" fill="#9E7A45" />
          <circle cx="60" cy="110" r="3" fill="#D4AF37" />
          {[40, 60, 80].map((y) => (
            <line key={y} x1="154" y1={y} x2="160" y2={y} stroke="#9E7A45" strokeWidth="1" strokeOpacity="0.35" />
          ))}
        </svg>
      </div>

      {/* =========================================================================
          SOFT AMBIENT WARM GOLDEN AURAS ALONG EDGES (Distributed down the page)
      ========================================================================= */}
      <div className="absolute top-[500px] -left-32 w-80 h-96 rounded-full bg-gradient-to-r from-[#FAF1E3] via-[#F6E8D0]/40 to-transparent blur-3xl opacity-60" />
      <div className="absolute top-[1350px] -right-32 w-80 h-96 rounded-full bg-gradient-to-l from-[#FAF1E3] via-[#F6E8D0]/40 to-transparent blur-3xl opacity-60" />
      <div className="absolute top-[2200px] -left-32 w-80 h-96 rounded-full bg-gradient-to-r from-[#FAF1E3] via-[#F6E8D0]/40 to-transparent blur-3xl opacity-60" />
      <div className="absolute top-[3050px] -right-32 w-80 h-96 rounded-full bg-gradient-to-l from-[#FAF1E3] via-[#F6E8D0]/40 to-transparent blur-3xl opacity-60" />
      <div className="absolute top-[3900px] -left-32 w-80 h-96 rounded-full bg-gradient-to-r from-[#FAF1E3] via-[#F6E8D0]/40 to-transparent blur-3xl opacity-60" />
      <div className="absolute top-[4750px] -right-32 w-80 h-96 rounded-full bg-gradient-to-l from-[#FAF1E3] via-[#F6E8D0]/40 to-transparent blur-3xl opacity-60" />
      <div className="absolute top-[5400px] -left-32 w-80 h-96 rounded-full bg-gradient-to-r from-[#FAF1E3] via-[#F6E8D0]/40 to-transparent blur-3xl opacity-60" />
    </div>
  );
}

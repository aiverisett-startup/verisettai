"use client";

import React from "react";

export function WebsiteEdgeShapes() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10"
    >
      {/* =========================================================================
          LEFT FLANK BACKGROUND HALF-SHAPES (Strictly in the background, behind dashboards)
      ========================================================================= */}

      {/* 1. Hero Left: Elegant Golden Half-Circle (Semicircle) with Concentric Half-Arch */}
      <div className="absolute top-28 sm:top-36 -left-20 sm:-left-28 w-72 sm:w-96 h-72 sm:h-96 opacity-40 motion-safe:animate-float-slow">
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bg-half-gold-l1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#C59B5F" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Solid Golden Half-Circle */}
          <path
            d="M 150,20 A 130,130 0 0,1 150,280 Z"
            fill="url(#bg-half-gold-l1)"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          {/* Concentric Outer Half-Arch */}
          <path
            d="M 150,0 A 150,150 0 0,1 150,300"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="5 7"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 2. How It Works Left: Smooth Concentric Half-Arch Arc */}
      <div className="absolute top-[920px] sm:top-[1020px] -left-16 sm:-left-24 w-64 sm:w-80 h-64 sm:h-80 opacity-35">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bg-half-gold-l2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Half Circle Arc */}
          <path
            d="M 140,20 A 120,120 0 0,1 140,260 Z"
            fill="url(#bg-half-gold-l2)"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 140,45 A 95,95 0 0,1 140,235"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 3. Protocol Architecture Left: Golden Half-Circle Disc */}
      <div className="absolute top-[1780px] sm:top-[1880px] -left-20 sm:-left-28 w-72 sm:w-96 h-72 sm:h-96 opacity-35 motion-safe:animate-float-reverse">
        <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bg-half-gold-l3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#C59B5F" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 160,20 A 140,140 0 0,1 160,300 Z"
            fill="url(#bg-half-gold-l3)"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 160,50 A 110,110 0 0,1 160,270"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="5 5"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 4. Marketplace Left: Double Concentric Smooth Half-Circles */}
      <div className="absolute top-[2620px] sm:top-[2750px] -left-18 sm:-left-24 w-64 sm:w-88 h-64 sm:h-88 opacity-35 motion-safe:animate-float-slow">
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bg-half-gold-l4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 150,20 A 130,130 0 0,1 150,280 Z"
            fill="url(#bg-half-gold-l4)"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 150,55 A 95,95 0 0,1 150,245"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 5. Sandbox / Ledger Left: Smooth Architectural Half-Circle */}
      <div className="absolute top-[3420px] sm:top-[3560px] -left-16 sm:-left-24 w-64 sm:w-80 h-64 sm:h-80 opacity-35">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M 140,20 A 120,120 0 0,1 140,260 Z"
            fill="#FAF6EE"
            fillOpacity="0.5"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 140,50 A 90,90 0 0,1 140,230"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="4 5"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 6. Developer Code Left: Smooth Half-Capsule (Half-Pill) */}
      <div className="absolute top-[4250px] sm:top-[4380px] -left-12 sm:-left-16 w-52 sm:w-68 h-52 sm:h-68 opacity-30 motion-safe:animate-float-reverse">
        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M 120,20 A 100,100 0 0,1 120,220 Z"
            fill="#FAF6EE"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 120,45 A 75,75 0 0,1 120,195"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 7. Trust & Security Left: Smooth Semicircular Fan */}
      <div className="absolute top-[5000px] sm:top-[5150px] -left-16 sm:-left-20 w-64 sm:w-80 h-64 sm:h-80 opacity-35 motion-safe:animate-float-slow">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M 140,20 A 120,120 0 0,1 140,260 Z"
            fill="#FAF6EE"
            fillOpacity="0.45"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 140,45 A 95,95 0 0,1 140,235"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="5 5"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 8. Footer Left: Subtle Semicircle Accent */}
      <div className="absolute bottom-8 -left-12 w-48 h-48 opacity-30">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M 100,20 A 80,80 0 0,1 100,180 Z"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.3"
            fill="none"
          />
        </svg>
      </div>


      {/* =========================================================================
          RIGHT FLANK BACKGROUND HALF-SHAPES (Strictly in the background, behind dashboards)
      ========================================================================= */}

      {/* 9. Hero Right: Signature Golden Half-Circle with Concentric Half-Arch */}
      <div className="absolute top-20 sm:top-28 -right-20 sm:-right-28 w-72 sm:w-96 h-72 sm:h-96 opacity-45 motion-safe:animate-float-reverse">
        <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bg-half-gold-r1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#C59B5F" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 160,20 A 140,140 0 0,0 160,300 Z"
            fill="url(#bg-half-gold-r1)"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
          <path
            d="M 160,50 A 110,110 0 0,0 160,270"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="5 6"
            strokeOpacity="0.3"
            fill="none"
          />
        </svg>
      </div>

      {/* 10. How It Works Right: Concentric Half-Circle Disc */}
      <div className="absolute top-[920px] sm:top-[1040px] -right-16 sm:-right-24 w-64 sm:w-80 h-64 sm:h-80 opacity-35">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bg-half-gold-r2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 140,20 A 120,120 0 0,0 140,260 Z"
            fill="url(#bg-half-gold-r2)"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 140,45 A 95,95 0 0,0 140,235"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 11. Protocol Architecture Right: Smooth Half-Arch Disc */}
      <div className="absolute top-[1800px] sm:top-[1920px] -right-20 sm:-right-28 w-72 sm:w-96 h-72 sm:h-96 opacity-35 motion-safe:animate-float-slow">
        <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bg-half-gold-r3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#C59B5F" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 160,20 A 140,140 0 0,0 160,300 Z"
            fill="url(#bg-half-gold-r3)"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 160,50 A 110,110 0 0,0 160,270"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="5 5"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 12. Marketplace Right: Concentric Smooth Double Half-Circles */}
      <div className="absolute top-[2650px] sm:top-[2800px] -right-18 sm:-right-24 w-64 sm:w-88 h-64 sm:h-88 opacity-35 motion-safe:animate-float-reverse">
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="bg-half-gold-r4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 150,20 A 130,130 0 0,0 150,280 Z"
            fill="url(#bg-half-gold-r4)"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 150,55 A 95,95 0 0,0 150,245"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 13. Sandbox / Ledger Right: Golden Half-Circle Disc */}
      <div className="absolute top-[3450px] sm:top-[3600px] -right-16 sm:-right-24 w-64 sm:w-80 h-64 sm:h-80 opacity-35">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M 140,20 A 120,120 0 0,0 140,260 Z"
            fill="#FAF6EE"
            fillOpacity="0.5"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 140,50 A 90,90 0 0,0 140,230"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="4 5"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 14. Developer Code Right: Smooth Half-Capsule */}
      <div className="absolute top-[4300px] sm:top-[4450px] -right-12 sm:-right-16 w-52 sm:w-68 h-52 sm:h-68 opacity-30 motion-safe:animate-float-slow">
        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M 120,20 A 100,100 0 0,0 120,220 Z"
            fill="#FAF6EE"
            stroke="#C59B5F"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 120,45 A 75,75 0 0,0 120,195"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeDasharray="4 4"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 15. Trust & Security Right: Concentric Half-Arch */}
      <div className="absolute top-[5050px] sm:top-[5200px] -right-16 sm:-right-20 w-64 sm:w-80 h-64 sm:h-80 opacity-35 motion-safe:animate-float-reverse">
        <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M 140,20 A 120,120 0 0,0 140,260 Z"
            fill="#FAF6EE"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M 140,45 A 95,95 0 0,0 140,235"
            stroke="#C59B5F"
            strokeWidth="1"
            strokeDasharray="5 5"
            strokeOpacity="0.25"
            fill="none"
          />
        </svg>
      </div>

      {/* 16. Footer Right: Subtle Semicircle Accent */}
      <div className="absolute bottom-8 -right-12 w-48 h-48 opacity-30">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M 100,20 A 80,80 0 0,0 100,180 Z"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.3"
            fill="none"
          />
        </svg>
      </div>

      {/* =========================================================================
          SOFT AMBIENT WARM GOLDEN AURAS IN THE BACKGROUND (Behind all dashboards)
      ========================================================================= */}
      <div className="absolute top-[500px] -left-32 w-80 h-96 rounded-full bg-gradient-to-r from-[#FAF1E3] via-[#F6E8D0]/30 to-transparent blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-[1350px] -right-32 w-80 h-96 rounded-full bg-gradient-to-l from-[#FAF1E3] via-[#F6E8D0]/30 to-transparent blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-[2200px] -left-32 w-80 h-96 rounded-full bg-gradient-to-r from-[#FAF1E3] via-[#F6E8D0]/30 to-transparent blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-[3050px] -right-32 w-80 h-96 rounded-full bg-gradient-to-l from-[#FAF1E3] via-[#F6E8D0]/30 to-transparent blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-[3900px] -left-32 w-80 h-96 rounded-full bg-gradient-to-r from-[#FAF1E3] via-[#F6E8D0]/30 to-transparent blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-[4750px] -right-32 w-80 h-96 rounded-full bg-gradient-to-l from-[#FAF1E3] via-[#F6E8D0]/30 to-transparent blur-3xl opacity-50 pointer-events-none" />
    </div>
  );
}

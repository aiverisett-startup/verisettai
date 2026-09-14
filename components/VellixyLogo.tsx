"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function VellixyLogo({
  className = "w-6 h-6",
  size = 24,
}: LogoProps) {
  // Minimalist, modern geometric "V" logo for Vellixy
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size }}
    >
      {/* Outer subtle shield / diamond facet */}
      <path
        d="M16 2.5L28 7.5V17C28 23.5 22.8 28.5 16 29.8C9.2 28.5 4 23.5 4 17V7.5L16 2.5Z"
        fill="#111827"
      />
      {/* Precision cut modern V mark */}
      <path
        d="M10.5 11L16 22L21.5 11H18.5L16 16.5L13.5 11H10.5Z"
        fill="#FFFFFF"
      />
      {/* Subtle accent dot on top */}
      <circle cx="16" cy="7" r="1.2" fill="#2563EB" />
    </svg>
  );
}

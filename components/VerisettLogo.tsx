"use client";

import React from "react";
import { motion } from "framer-motion";

interface VerisettLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  inverted?: boolean;
  textClassName?: string;
}

export function VerisettLogo({
  className = "",
  size = 32,
  showText = true,
  inverted = false,
  textClassName = "",
}: VerisettLogoProps) {
  // Network connection lines between nodes
  const linePath =
    "M20 25 L50 78 L80 25 M32 40 L68 40 M20 25 L40 50 L50 78 L60 50 L80 25 M35 25 L50 55 L65 25 M40 50 L60 50";

  // Coordinates of all verification nodes with staggered pulse delays
  // Uses vibrant electric cobalt blue (#2563EB / #3B82F6)
  const nodes = [
    { cx: 20, cy: 25, r: 4.5, isApex: true, color: "#2563EB" },
    { cx: 35, cy: 25, r: 3.5, isApex: false, color: "#3B82F6" },
    { cx: 80, cy: 25, r: 4.5, isApex: true, color: "#2563EB" },
    { cx: 65, cy: 25, r: 3.5, isApex: false, color: "#3B82F6" },
    { cx: 32, cy: 40, r: 3.5, isApex: false, color: "#3B82F6" },
    { cx: 68, cy: 40, r: 3.5, isApex: false, color: "#3B82F6" },
    { cx: 40, cy: 50, r: 3.5, isApex: false, color: "#2563EB" },
    { cx: 60, cy: 50, r: 3.5, isApex: false, color: "#2563EB" },
    { cx: 50, cy: 55, r: 3.0, isApex: false, color: "#3B82F6" },
    { cx: 50, cy: 78, r: 5.0, isApex: true, color: "#1D4ED8" },
  ];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Crystalline Node "V" Mark - overflow-visible ensures no clipping */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 will-change-transform overflow-visible"
      >
        {/* Radar Pulse for Apex Nodes - Pure CSS hidden on prefers-reduced-motion */}
        <g className="motion-reduce:hidden">
          {/* Top Left Apex Pulse */}
          <motion.circle
            cx={20}
            cy={25}
            r={4.5}
            fill="none"
            stroke="#2563EB"
            strokeWidth="1.5"
            animate={{
              r: [4.5, 11, 14],
              opacity: [0.75, 0.25, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0,
            }}
          />

          {/* Top Right Apex Pulse */}
          <motion.circle
            cx={80}
            cy={25}
            r={4.5}
            fill="none"
            stroke="#2563EB"
            strokeWidth="1.5"
            animate={{
              r: [4.5, 11, 14],
              opacity: [0.75, 0.25, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.4,
            }}
          />

          {/* Bottom Consensus Apex Pulse */}
          <motion.circle
            cx={50}
            cy={78}
            r={5}
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="1.8"
            animate={{
              r: [5, 13, 17],
              opacity: [0.85, 0.3, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.8,
            }}
          />
        </g>

        <defs>
          <linearGradient id="logo-cobalt-struts" x1="20" y1="25" x2="80" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Network Struts: Stroke Draws In on Page Load */}
        <motion.path
          d={linePath}
          stroke="url(#logo-cobalt-struts)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.4 },
          }}
        />

        {/* Verification Nodes with Staggered Opacity Breathe Effect */}
        {nodes.map((node, i) => (
          <motion.circle
            key={`node-${node.cx}-${node.cy}`}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill={node.color}
            stroke={inverted ? "#0F172A" : "#FFFFFF"}
            strokeWidth="2"
            className="will-change-transform"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: [0.65, 1, 0.65],
            }}
            transition={{
              scale: { duration: 0.4, delay: i * 0.05 },
              opacity: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              },
            }}
          />
        ))}
      </svg>

      {/* Brand Typography */}
      {showText && (
        <span
          className={`font-bold tracking-tight text-xl font-sans select-none flex items-center gap-1 leading-none ${textClassName
            ? textClassName
            : inverted
              ? "text-white"
              : "text-slate-900"
            }`}
        >
          <span>Verisett</span>
          <span className="text-blue-600 font-semibold">AI</span>
        </span>
      )}
    </div>
  );
}

export default VerisettLogo;

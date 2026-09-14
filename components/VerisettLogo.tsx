"use client";

import React from "react";
import { motion } from "framer-motion";

interface VerisettLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  inverted?: boolean;
}

export function VerisettLogo({
  className = "",
  size = 32,
  showText = true,
  inverted = false,
}: VerisettLogoProps) {
  // Network connection lines between nodes
  const linePath =
    "M20 25 L50 78 L80 25 M32 40 L68 40 M20 25 L40 50 L50 78 L60 50 L80 25 M35 25 L50 55 L65 25 M40 50 L60 50";

  // Coordinates of all verification nodes with staggered pulse delays
  const nodes = [
    { cx: 20, cy: 25, r: 4.5, isApex: true, color: "#C59B5F" },
    { cx: 35, cy: 25, r: 3.5, isApex: false, color: "#D4AF37" },
    { cx: 80, cy: 25, r: 4.5, isApex: true, color: "#C59B5F" },
    { cx: 65, cy: 25, r: 3.5, isApex: false, color: "#D4AF37" },
    { cx: 32, cy: 40, r: 3.5, isApex: false, color: "#D4AF37" },
    { cx: 68, cy: 40, r: 3.5, isApex: false, color: "#D4AF37" },
    { cx: 40, cy: 50, r: 3.5, isApex: false, color: "#D4AF37" },
    { cx: 60, cy: 50, r: 3.5, isApex: false, color: "#D4AF37" },
    { cx: 50, cy: 55, r: 3.0, isApex: false, color: "#D4AF37" },
    { cx: 50, cy: 78, r: 5.0, isApex: true, color: "#9E7A45" },
  ];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Crystalline Node "V" Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 will-change-transform"
      >
        {/* Radar Pulse for Apex Nodes - Pure CSS hidden on prefers-reduced-motion */}
        <g className="motion-reduce:hidden">
          {/* Top Left Apex Pulse */}
          <motion.circle
            cx={20}
            cy={25}
            r={4.5}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            animate={{
              r: [4.5, 11, 14],
              opacity: [0.7, 0.25, 0],
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
            stroke="#D4AF37"
            strokeWidth="1.5"
            animate={{
              r: [4.5, 11, 14],
              opacity: [0.7, 0.25, 0],
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
            stroke="#C59B5F"
            strokeWidth="1.8"
            animate={{
              r: [5, 13, 17],
              opacity: [0.8, 0.3, 0],
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
          <linearGradient id="logo-gold-struts" x1="20" y1="25" x2="80" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C59B5F" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9E7A45" />
          </linearGradient>
        </defs>

        {/* Network Struts: Stroke Draws In on Page Load */}
        <motion.path
          d={linePath}
          stroke="url(#logo-gold-struts)"
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
            stroke={inverted ? "#1C1A17" : "#FFFFFF"}
            strokeWidth="2"
            className="will-change-transform"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: [0.6, 1, 0.6],
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
          className={`font-bold tracking-tight text-base font-sans select-none ${
            inverted ? "text-white" : "text-[#1C1A17]"
          }`}
        >
          Verisett <span className="text-[#C59B5F] font-semibold">AI</span>
        </span>
      )}
    </div>
  );
}

export default VerisettLogo;

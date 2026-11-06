"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

export interface MemberCardUser {
  id?: string;
  name?: string;
  email?: string;
  planTier?: string;
  planAmount?: number;
  operatorId?: string;
}

interface EnterpriseMemberCardProps {
  user?: MemberCardUser | null;
  className?: string;
  forceUnlocked?: boolean;
}

export function isEnterpriseTier(user?: MemberCardUser | null): boolean {
  if (!user) return false;
  if (typeof user.planAmount === "number" && user.planAmount >= 30000) return true;
  const tier = (user.planTier || "").toLowerCase().trim();
  return (
    tier.includes("enterprise") ||
    tier.includes("sovereign") ||
    tier.includes("founder") ||
    tier.includes("tier_3") ||
    tier.includes("tier-3") ||
    tier === "tier3"
  );
}

export function EnterpriseMemberCard({
  user,
  className = "",
  forceUnlocked = false,
}: EnterpriseMemberCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [sandboxPreview, setSandboxPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const isEligible = forceUnlocked || isEnterpriseTier(user) || sandboxPreview;

  const displayName = user?.name?.trim() || (user?.email ? user.email.split("@")[0].toUpperCase() : "Manoj S. M.");
  const operatorId = user?.operatorId || "#0042";
  const displayEmail = user?.email || "operator@veri-sett.com";

  const handleCopyId = () => {
    navigator.clipboard?.writeText?.(operatorId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center font-sans ${className}`}>
      {!isEligible ? (
        /* ======================================================================
           LOCKED STATE PANEL (Tier 3 / $30,000 Enterprise Gate)
           ====================================================================== */
        <div className="relative w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-blue-500/20 text-center shadow-2xl shadow-blue-950/50 overflow-hidden">
          {/* Ambient Glass Glows */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-blue-600/15 blur-[90px] rounded-full" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/15 blur-[90px] rounded-full" />

          {/* Locked Badge & Icon */}
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>TIER 3 EXCLUSIVE ASSET</span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white font-sans">
              Titanium Operator Digital Card
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 mt-2.5 max-w-sm mx-auto leading-relaxed">
              The 3D Titanium &amp; Obsidian digital member asset unlocks exclusively on the{" "}
              <strong className="text-cyan-300 font-semibold">$30,000 Enterprise Tier</strong> with direct clearinghouse host authority and cryptographic execution proofs.
            </p>

            {/* Feature Perks of Tier 3 */}
            <div className="my-6 p-4 rounded-2xl bg-slate-950/60 border border-blue-500/15 text-left text-xs font-mono space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Host-Level Settlement Clearance (#0042)</span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Dedicated Multi-Sig Enclave Signature Token</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Uncapped 10M+ FastMCP Operations Velocity</span>
              </div>
            </div>

            {/* Actions: Upgrade CTA + Sandbox Preview */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/billing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Upgrade to Tier 3 ($30,000)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setSandboxPreview(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                title="Preview interactive card in sandbox mode"
              >
                Inspect 3D Preview
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================================
           INTERACTIVE 3D DIGITAL MEMBER CARD (TIER-3 ENTERPRISE ASSET)
           ====================================================================== */
        <div className="flex flex-col items-center space-y-5">
          {sandboxPreview && !isEnterpriseTier(user) && !forceUnlocked && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SANDBOX DEMO PREVIEW ACTIVE</span>
              <button
                onClick={() => setSandboxPreview(false)}
                className="text-xs ml-2 text-slate-400 hover:text-white underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          {/* Perspective 3D Container (Credit Card Standard: 460px x 270px) */}
          <div
            className="w-full max-w-[460px] h-[270px] cursor-pointer select-none"
            style={{ perspective: "1200px" }}
            onClick={() => setIsFlipped((prev) => !prev)}
            title="Click to flip card"
          >
            {/* The 3D Flipping Card Body */}
            <div
              className="relative w-full h-full rounded-2xl transition-transform duration-700 ease-out"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* ================================================================
                  FRONT FACE: Brushed Titanium, Obsidian & Cybernetic Circuit
                  ================================================================ */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_60px_-15px_rgba(6,182,212,0.35),0_0_30px_rgba(37,99,235,0.25)] border border-cyan-400/50 bg-[#090d19]"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* 1. Deep Obsidian Base & Ambient Radial Glow */}
                <div className="absolute inset-0 bg-[#090d19] -z-20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.35),transparent_65%)] pointer-events-none -z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.2),transparent_60%)] pointer-events-none -z-10" />

                {/* 2. Diagonal Brushed Titanium Plate Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none -z-10 opacity-70"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(148,163,184,0.18) 35%, rgba(71,85,105,0.06) 70%, transparent 100%)",
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px), linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(148,163,184,0.2) 40%, transparent 80%)",
                  }}
                />

                {/* 3. Cybernetic Vector Circuit Traces (Inline Glowing SVG) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible"
                  viewBox="0 0 460 270"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="neonGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="neonGlowBlue" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Circuit Path 1 (Primary Cyan Flow) */}
                  <path
                    d="M 50 160 L 120 160 L 155 125 L 230 125 L 265 90 L 370 90 L 410 50 L 460 50"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#neonGlowCyan)"
                    opacity="0.95"
                  />
                  {/* Circuit Path 2 (Cobalt Blue Parallel) */}
                  <path
                    d="M 65 175 L 125 175 L 160 140 L 235 140 L 270 105 L 375 105 L 415 65 L 460 65"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    filter="url(#neonGlowBlue)"
                    opacity="0.85"
                  />
                  {/* Circuit Path 3 (Subtle branching line) */}
                  <path
                    d="M 125 175 L 145 195 L 210 195 L 235 220 L 340 220"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  {/* Circuit Path 4 (Top Accent line) */}
                  <path
                    d="M 230 125 L 255 150 L 310 150 L 335 125 L 420 125"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    opacity="0.75"
                  />

                  {/* Circuit Solder Connection Pads */}
                  <circle cx="120" cy="160" r="3" fill="#22d3ee" />
                  <circle cx="230" cy="125" r="3.5" fill="#38bdf8" />
                  <circle cx="265" cy="90" r="3" fill="#22d3ee" />
                  <circle cx="370" cy="90" r="3.5" fill="#67e8f9" />
                  <circle cx="410" cy="50" r="3" fill="#22d3ee" />
                  <circle cx="210" cy="195" r="2.5" fill="#0284c7" />
                  <circle cx="310" cy="150" r="2.5" fill="#38bdf8" />
                </svg>

                {/* 4. Top Header: User Name + // AGENT */}
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 font-sans drop-shadow-sm flex items-center gap-2">
                      <span>{displayName}</span>
                      <span className="text-cyan-400 font-mono font-light text-base tracking-widest">
                        // AGENT
                      </span>
                    </h2>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-0.5 block">
                      Autonomous Clearinghouse Operator
                    </span>
                  </div>

                  {/* Corner Micro-Brackets Tech Graphic */}
                  <div className="text-[10px] font-mono text-cyan-400/80 tracking-widest hidden sm:block">
                    [T3.NITRO]
                  </div>
                </div>

                {/* 5. Center Section: Holographic Chip + Wireframe Icosahedron */}
                <div className="relative z-10 flex items-center gap-4 my-auto">
                  {/* EMV Holographic Microchip */}
                  <div
                    className="relative w-12 h-10 rounded-lg overflow-hidden border border-cyan-300/80 shadow-md shadow-cyan-500/20"
                    style={{
                      background:
                        "linear-gradient(135deg, #d4af37 0%, #fef08a 25%, #67e8f9 50%, #10b981 75%, #3b82f6 100%)",
                    }}
                  >
                    {/* Internal Chip Contact Trace Segments */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-[1px] p-[2px] bg-black/30">
                      <div className="bg-amber-100/70 rounded-xs" />
                      <div className="bg-amber-100/70 rounded-xs" />
                      <div className="bg-amber-100/70 rounded-xs" />
                      <div className="bg-amber-100/70 rounded-xs" />
                      <div className="bg-amber-100/70 rounded-xs" />
                      <div className="bg-amber-100/70 rounded-xs" />
                    </div>
                    {/* Chip Center Hologram Sparkle */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-80" />
                  </div>

                  {/* Wireframe Polyhedral Node Icon */}
                  <svg
                    className="w-8 h-8 text-cyan-300/80 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="2" y1="8.5" x2="22" y2="8.5" />
                    <line x1="2" y1="15.5" x2="22" y2="15.5" />
                    <line x1="12" y1="2" x2="2" y2="15.5" />
                    <line x1="12" y1="2" x2="22" y2="15.5" />
                    <line x1="12" y1="22" x2="2" y2="8.5" />
                    <line x1="12" y1="22" x2="22" y2="8.5" />
                  </svg>
                </div>

                {/* 6. Bottom Inset Information Panel */}
                <div className="relative z-10 rounded-xl bg-[#060c18]/85 border border-cyan-500/35 px-4 py-2.5 backdrop-blur-md flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <span>OPERATOR ID: {operatorId}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyId();
                        }}
                        className="text-cyan-400 hover:text-white"
                        title="Copy Operator ID"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-slate-300 tracking-wide flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      <span>STATUS: VERIFIED CLEARINGHOUSE</span>
                    </div>
                  </div>

                  {/* Miniature Security Hologram Seal */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400/40 via-blue-500/30 to-purple-500/40 border border-cyan-400/60 flex items-center justify-center text-[8px] font-mono text-white shadow-xs">
                    ★
                  </div>
                </div>

                {/* Bottom Edge Micro-Tick Marks */}
                <div
                  className="absolute bottom-1.5 left-6 right-6 h-1 opacity-40 pointer-events-none"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, #06b6d4 0px, #06b6d4 1px, transparent 1px, transparent 6px)",
                  }}
                />
              </div>

              {/* ================================================================
                  BACK FACE: Magnetic Stripe, Signature Strip & QR Code
                  ================================================================ */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_60px_-15px_rgba(6,182,212,0.35),0_0_30px_rgba(37,99,235,0.25)] border border-cyan-400/50 bg-[#070b16]"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {/* 1. Matte Black Magnetic Stripe Across Top */}
                <div className="absolute top-5 left-0 right-0 h-10 bg-black/95 border-y border-slate-800 shadow-inner flex items-center px-6">
                  <div
                    className="w-full h-2 opacity-20"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, #64748b 0px, #64748b 2px, transparent 2px, transparent 6px)",
                    }}
                  />
                </div>

                {/* Space for the magnetic stripe */}
                <div className="h-10" />

                {/* 2. Signature Panel & CVC Strip */}
                <div className="relative z-10 mt-1">
                  <div className="rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border border-slate-300 h-10 px-3.5 flex items-center justify-between shadow-inner">
                    {/* Handwritten Script User Signature */}
                    <span
                      className="text-base sm:text-lg text-slate-900 select-none italic font-serif font-bold tracking-wider"
                      style={{
                        fontFamily:
                          "'Brush Script MT', 'Dancing Script', 'Caveat', 'Segoe Script', cursive",
                      }}
                    >
                      {displayName}
                    </span>

                    {/* CVC Code Pill */}
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800 font-bold bg-white/95 px-2 py-0.5 rounded border border-slate-300">
                      <span className="text-[9px] text-slate-400">CVC:</span>
                      <span>042</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 block mt-1">
                    AUTHORIZED OPERATOR SIGNATURE // NOT TRANSFERABLE
                  </span>
                </div>

                {/* 3. Footer Area: Crisp QR Code + Metadata */}
                <div className="relative z-10 flex items-end justify-between gap-4 pt-1">
                  {/* Clean Vector QR Code Representation */}
                  <div className="w-16 h-16 rounded-lg bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 33 33" className="w-full h-full fill-black">
                      {/* Top-Left Finder */}
                      <rect x="0" y="0" width="9" height="9" />
                      <rect x="2" y="2" width="5" height="5" fill="white" />
                      <rect x="3.5" y="3.5" width="2" height="2" />

                      {/* Top-Right Finder */}
                      <rect x="24" y="0" width="9" height="9" />
                      <rect x="26" y="2" width="5" height="5" fill="white" />
                      <rect x="27.5" y="3.5" width="2" height="2" />

                      {/* Bottom-Left Finder */}
                      <rect x="0" y="24" width="9" height="9" />
                      <rect x="2" y="26" width="5" height="5" fill="white" />
                      <rect x="3.5" y="27.5" width="2" height="2" />

                      {/* Synthetic Data Grid Matrix */}
                      <rect x="12" y="2" width="2" height="2" />
                      <rect x="16" y="2" width="2" height="2" />
                      <rect x="20" y="4" width="2" height="2" />
                      <rect x="12" y="8" width="2" height="2" />
                      <rect x="14" y="10" width="2" height="2" />
                      <rect x="18" y="10" width="2" height="2" />
                      <rect x="2" y="12" width="2" height="2" />
                      <rect x="6" y="12" width="2" height="2" />
                      <rect x="10" y="14" width="2" height="2" />
                      <rect x="14" y="14" width="5" height="5" />
                      <rect x="22" y="14" width="2" height="2" />
                      <rect x="26" y="12" width="2" height="2" />
                      <rect x="30" y="14" width="2" height="2" />
                      <rect x="4" y="18" width="2" height="2" />
                      <rect x="10" y="20" width="2" height="2" />
                      <rect x="20" y="20" width="2" height="2" />
                      <rect x="24" y="18" width="2" height="2" />
                      <rect x="28" y="20" width="2" height="2" />
                      <rect x="12" y="24" width="2" height="2" />
                      <rect x="16" y="26" width="2" height="2" />
                      <rect x="20" y="28" width="2" height="2" />
                      <rect x="24" y="26" width="2" height="2" />
                      <rect x="28" y="24" width="2" height="2" />
                    </svg>
                  </div>

                  {/* Security Clearance Details */}
                  <div className="text-right space-y-0.5">
                    <div className="text-[11px] font-mono font-bold tracking-wider text-cyan-300">
                      VERISETT NETWORK | HOST LEVEL
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                      AUTHORIZED SIGNATURE REQUIRED
                    </div>
                    <div className="text-[9px] font-mono text-cyan-400 font-semibold tracking-wider">
                      HTTPS://VERI-SETT.COM
                    </div>
                    <div className="text-[8px] font-mono text-slate-500 pt-0.5">
                      NODE ENCLAVE ID: {user?.id ? user.id.slice(0, 18) : "ed25519:vrs_node_42"}
                    </div>
                  </div>
                </div>

                {/* Back Face Edge Circuit Accents */}
                <div className="absolute bottom-2 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Interactive 3D Flip Toggle Control Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFlipped((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all shadow-md hover:shadow-cyan-500/10 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isFlipped ? "Flip to Front" : "Flip Card (Magnetic & Signature)"}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Copy Operator ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{operatorId}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnterpriseMemberCard;

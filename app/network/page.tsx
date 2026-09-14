"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw, Sparkles, Layers, ShieldCheck, Download, Code, Maximize2 } from "lucide-react";
import { AutonomousVerificationNetwork } from "@/components/3d/AutonomousVerificationNetwork";
import { VerisettLogo } from "@/components/VerisettLogo";
import { GoldenBackgroundShapes } from "@/components/ui/GoldenBackgroundShapes";

export default function VerificationNetworkPage() {
  const [transparent, setTransparent] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [accentColor, setAccentColor] = useState<string>("#D4AF37");
  const [showCodeSnippet, setShowCodeSnippet] = useState<boolean>(false);

  const colors = [
    { label: "Radiant Gold", hex: "#D4AF37" },
    { label: "Satin Warm Gold", hex: "#C59B5F" },
    { label: "Antique Bronze", hex: "#9E7A45" },
    { label: "Consensus Emerald", hex: "#10B981" },
  ];

  return (
    <div className="relative min-h-screen bg-[#FDFCF9] text-[#1C1A17] flex flex-col justify-between font-sans selection:bg-[#C59B5F] selection:text-white overflow-hidden">
      {/* Background Half Shapes */}
      <GoldenBackgroundShapes variant="subtle" density="dense" />

      {/* Top Header Bar */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-[#EAE3D2] bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-[#8C8275] hover:text-[#1C1A17] transition-colors p-1.5 rounded-lg hover:bg-[#FAF8F5]"
          >
            <ArrowLeft className="w-4 h-4 text-[#9E7A45]" />
            <span>Return to Platform</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#EAE3D2]" />
          <div className="flex items-center gap-2">
            <VerisettLogo size={24} showText={false} />
            <span className="text-sm font-semibold text-[#1C1A17] tracking-tight">
              Autonomous Verification Network 3D
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#9E7A45] border border-[#EAE3D2] font-medium">
              WebGL Runtime
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCodeSnippet(!showCodeSnippet)}
            className="px-3 py-1.5 rounded-xl border border-[#EAE3D2] bg-white hover:bg-[#FAF8F5] text-xs font-mono text-[#1C1A17] hover:text-[#9E7A45] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-[#C59B5F]" />
            <span>Embed Code</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer ${
              autoRotate
                ? "border-[#C59B5F] bg-[#FAF6EE] text-[#9E7A45]"
                : "border-[#EAE3D2] bg-white text-[#8C8275]"
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }} />
            <span>Drift: {autoRotate ? "ON" : "OFF"}</span>
          </button>
        </div>
      </header>

      {/* Main 3D Stage Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div
          className={`relative w-full max-w-5xl h-[650px] rounded-3xl border transition-all duration-300 shadow-[0_20px_60px_rgba(197,155,95,0.12)] overflow-hidden ${
            transparent
              ? "border-dashed border-[#C59B5F]/40 bg-transparent"
              : "border-[#EAE3D2] bg-[#14120E]"
          }`}
        >
          {/* Subtle Grid Lines in background if transparent */}
          {transparent && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#c59b5f15_1px,transparent_1px),linear-gradient(to_bottom,#c59b5f15_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none -z-10" />
          )}

          {/* Three.js Interactive Component */}
          <AutonomousVerificationNetwork
            transparent={transparent}
            accentColor={accentColor}
            autoRotate={autoRotate}
            interactive={true}
            showOverlayStats={true}
          />

          {/* Floating Bottom Toolbar for Controls */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#EAE3D2] shadow-xl text-xs font-mono">
            {/* Color Switcher */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-[#EAE3D2]">
              <span className="text-[11px] text-[#8C8275] mr-1">Edge Hue:</span>
              {colors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setAccentColor(c.hex)}
                  title={c.label}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                    accentColor === c.hex ? "scale-125 ring-2 ring-[#1C1A17]" : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>

            {/* Background Mode Toggle */}
            <button
              onClick={() => setTransparent(!transparent)}
              className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                transparent
                  ? "bg-[#C59B5F] text-white font-bold"
                  : "bg-[#FAF8F5] text-[#1C1A17] border border-[#EAE3D2] hover:border-[#C59B5F]/40"
              }`}
            >
              {transparent ? "Mode: Transparent Canvas" : "Mode: Obsidian Jewel"}
            </button>
          </div>
        </div>

        {/* Embedded Code Drawer / Modal */}
        {showCodeSnippet && (
          <div className="w-full max-w-5xl mt-6 p-6 rounded-3xl bg-white border border-[#EAE3D2] shadow-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#C59B5F]" />
                <span className="text-xs font-mono font-semibold text-[#1C1A17]">
                  Embedding Code Snippet (Lightweight WebGL)
                </span>
              </div>
              <button
                onClick={() => setShowCodeSnippet(false)}
                className="text-xs text-[#8C8275] hover:text-[#1C1A17] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] text-xs font-mono text-[#9E7A45] overflow-x-auto leading-relaxed">
{`import { AutonomousVerificationNetwork } from "@/components/3d/AutonomousVerificationNetwork";

// Embed with transparent background in any container or landing hero:
<div className="w-full h-[500px]">
  <AutonomousVerificationNetwork
    transparent={${transparent}}
    accentColor="${accentColor}"
    interactive={true}
    autoRotate={true}
  />
</div>`}
            </pre>
          </div>
        )}
      </main>

      {/* Footer Info Strip */}
      <footer className="relative z-20 px-6 py-4 border-t border-[#EAE3D2] bg-white flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8C8275] gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#9E7A45]" />
          <span>Faceted Obsidian Crystalline Core • Dual-Wing Bifurcation • 60 FPS WebGL</span>
        </div>
        <div className="text-[#9E7A45]">
          Autonomous Consensus Apex • Pure Gold Shading (#D4AF37)
        </div>
      </footer>
    </div>
  );
}

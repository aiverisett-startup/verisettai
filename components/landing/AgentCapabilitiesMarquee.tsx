"use client";

import React from "react";
import {
  ShieldCheck,
  Cpu,
  Zap,
  Lock,
  Scale,
  RefreshCw,
  FileCheck,
  CheckCircle2,
  KeyRound,
  Activity,
  Layers,
  Network,
} from "lucide-react";

interface MarqueePill {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  iconBg: string;
  iconColor: string;
}

const row1Items: MarqueePill[] = [
  {
    label: "FastMCP Agent Escrow",
    icon: Lock,
    tag: "Native",
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Sub-Second Clearing",
    icon: Zap,
    tag: "<50ms",
    iconBg: "bg-cyan-50 dark:bg-cyan-950/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    label: "ZK State Verification",
    icon: ShieldCheck,
    tag: "Provable",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Multi-Agent Consensus",
    icon: Network,
    tag: "M2M",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "Real-Time Telemetry",
    icon: Activity,
    tag: "Live",
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

const row2Items: MarqueePill[] = [
  {
    label: "Deterministic Milestones",
    icon: FileCheck,
    tag: "Non-Custodial",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "1.5% Flat Fee Settlement",
    icon: Scale,
    tag: "Predictable",
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Autonomous Agent SLA",
    icon: CheckCircle2,
    tag: "Enforced",
    iconBg: "bg-teal-50 dark:bg-teal-950/50",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    label: "Encrypted Settlement Vault",
    icon: KeyRound,
    tag: "SGX Nitro",
    iconBg: "bg-sky-50 dark:bg-sky-950/50",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    label: "Automated Arbitration",
    icon: Cpu,
    tag: "Sub-Minute",
    iconBg: "bg-purple-50 dark:bg-purple-950/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

const row3Items: MarqueePill[] = [
  {
    label: "FastMCP Agent Escrow",
    icon: Layers,
    tag: "mTLS",
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    label: "Sub-Second Clearing",
    icon: RefreshCw,
    tag: "Instant",
    iconBg: "bg-cyan-50 dark:bg-cyan-950/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    label: "ZK State Verification",
    icon: ShieldCheck,
    tag: "Cryptographic",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Deterministic Milestones",
    icon: FileCheck,
    tag: "Atomic",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "Encrypted Settlement Vault",
    icon: Lock,
    tag: "Multi-Sig",
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

const spacers = ["◆", "✦", "●", "◇", "›"];

function PillCapsule({ item, spacerIndex }: { item: MarqueePill; spacerIndex: number }) {
  const Icon = item.icon;
  const spacer = spacers[spacerIndex % spacers.length];

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="group/pill flex items-center gap-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 px-4 py-2 backdrop-blur-sm shadow-xs hover:border-blue-500/40 hover:bg-white dark:hover:bg-zinc-850 hover:shadow-sm transition-all duration-200 cursor-default select-none">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200/60 dark:border-zinc-700/60 ${item.iconBg} ${item.iconColor} shadow-2xs group-hover/pill:scale-105 transition-transform`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight whitespace-nowrap">
          {item.label}
        </span>
        {item.tag && (
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
            {item.tag}
          </span>
        )}
      </div>

      <span className="text-[10px] text-zinc-300 dark:text-zinc-700 font-mono select-none px-1">
        {spacer}
      </span>
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
}: {
  items: MarqueePill[];
  direction: "left" | "right";
}) {
  // Multiply items to ensure seamless loop on large screens
  const duplicated = [...items, ...items, ...items, ...items];

  return (
    <div className="flex overflow-hidden py-1.5 select-none w-full">
      <div
        className={
          direction === "left"
            ? "animate-marquee-stream-left flex shrink-0 items-center gap-3"
            : "animate-marquee-stream-right flex shrink-0 items-center gap-3"
        }
      >
        {duplicated.map((item, idx) => (
          <PillCapsule key={idx} item={item} spacerIndex={idx} />
        ))}
      </div>
    </div>
  );
}

export function AgentCapabilitiesMarquee() {
  return (
    <section className="relative w-full py-12 md:py-16 overflow-hidden bg-[#FAFAFA] dark:bg-[#09090b] border-y border-zinc-200 dark:border-zinc-800/80 transition-colors">
      {/* Background Subtle Gradient Grid Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] dark:opacity-[0.12]" />

      {/* Top Protocol Subheader */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 font-sans">
          Built For Production-Grade Multi-Agent Workflows
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mt-1 font-sans">
          High-throughput programmatic settlement rails engineered for autonomous agent swarms and model-to-model transactions.
        </p>
      </div>

      {/* Marquee Container with Gradient Edge Masks & Pause on Hover */}
      <div className="marquee-pause-hover relative w-full flex flex-col gap-3 overflow-hidden">
        {/* Left & Right Smooth Edge Fade Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#FAFAFA] dark:from-[#09090b] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#FAFAFA] dark:from-[#09090b] to-transparent z-10" />

        {/* Row 1: Left to Right */}
        <MarqueeRow items={row1Items} direction="right" />

        {/* Row 2: Right to Left */}
        <MarqueeRow items={row2Items} direction="left" />

        {/* Row 3: Left to Right */}
        <MarqueeRow items={row3Items} direction="right" />
      </div>
    </section>
  );
}
export default AgentCapabilitiesMarquee;

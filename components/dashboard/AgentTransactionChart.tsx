"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  BarChart2,
  DollarSign,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Plus,
} from "lucide-react";
import { TransactionItem } from "@/lib/agentTransactionStorage";

interface AgentTransactionChartProps {
  isAgentConnected: boolean;
  transactions: TransactionItem[];
  onConnectAgent: () => void;
}

interface ChartDataPoint {
  index: number;
  tx: TransactionItem;
  scoreDelta: number; // +1 on success, -1 on failure
  cumulativeScore: number;
  x: number;
  y: number;
}

export function AgentTransactionChart({
  isAgentConnected,
  transactions,
  onConnectAgent,
}: AgentTransactionChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG Dimension Math
  const SVG_WIDTH = 840;
  const SVG_HEIGHT = 280;
  const PADDING = { top: 35, right: 35, bottom: 55, left: 45 };
  const CHART_W = SVG_WIDTH - PADDING.left - PADDING.right;
  const CHART_H = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  // Compute metrics for the last month
  const totalCount = transactions.length;
  const successCount = useMemo(
    () => transactions.filter((t) => t.status === "SUCCESSFUL").length,
    [transactions]
  );
  const failureCount = useMemo(
    () => transactions.filter((t) => t.status === "FAILED").length,
    [transactions]
  );
  const totalVolumeUSD = useMemo(
    () => transactions.reduce((acc, t) => acc + t.amountINR, 0),
    [transactions]
  );
  const totalCommissionUSD = Number((totalVolumeUSD * 0.015).toFixed(2));
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : "100.0";

  const formatUSD = (val: number) =>
    `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Compute trajectory data points across the chronological transaction stream
  // Chronological order: oldest to newest for the line graph
  const chronologicalList = useMemo(() => {
    return [...transactions].reverse();
  }, [transactions]);

  const { points, minScore, maxScore, maxAmount } = useMemo(() => {
    if (chronologicalList.length === 0) {
      return { points: [], minScore: 0, maxScore: 10, maxAmount: 10000 };
    }

    let runningScore = 5; // Starting neutral baseline
    let min = 5;
    let max = 5;
    let highestAmount = 1000;

    const calculated = chronologicalList.map((tx, idx) => {
      const delta = tx.status === "SUCCESSFUL" ? 1 : -1;
      runningScore = Math.max(0, runningScore + delta);
      if (runningScore < min) min = runningScore;
      if (runningScore > max) max = runningScore;
      if (tx.amountINR > highestAmount) highestAmount = tx.amountINR;

      return {
        index: idx,
        tx,
        scoreDelta: delta,
        cumulativeScore: runningScore,
        x: 0,
        y: 0,
      };
    });

    const scoreRange = Math.max(2, max - min);
    const n = calculated.length;

    calculated.forEach((pt, idx) => {
      const normX = n > 1 ? idx / (n - 1) : 0.5;
      const normY = (pt.cumulativeScore - min) / scoreRange;
      pt.x = PADDING.left + normX * CHART_W;
      pt.y = PADDING.top + (1 - normY) * CHART_H;
    });

    return { points: calculated, minScore: min, maxScore: max, maxAmount: highestAmount };
  }, [chronologicalList, CHART_W, CHART_H, PADDING.left, PADDING.top]);

  // Generate smooth cubic bezier SVG path
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y}`;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Area under the line for translucent cyan/blue glow
  const areaPath = useMemo(() => {
    if (!linePath || points.length === 0) return "";
    const bottomY = PADDING.top + CHART_H;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, points, PADDING.top, CHART_H]);

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  // 1. STATE: Agent Not Connected -> Render Disconnected State (NO FAKE/MOCK DATA)
  if (!isAgentConnected) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#09090B] p-6 sm:p-8 shadow-[0_4px_24px_rgba(37,99,235,0.06)] relative overflow-hidden font-sans text-slate-200">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(to right, #2563EB 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center py-10 px-4 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_4px_16px_rgba(37,99,235,0.1)]">
            <Cpu className="w-7 h-7 stroke-[1.8] animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-900/40 text-[11px] font-mono text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>AGENT GATEWAY DISCONNECTED</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Connect Your Agent to View Transaction Trajectory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              No active agent is connected to this vault. Connect your autonomous agent via FastMCP or REST Gateway to stream live settlement telemetry, view the last month’s transaction line graph, and inspect cryptographic clearing records.
            </p>
          </div>

          <button
            onClick={onConnectAgent}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs font-semibold text-white transition shadow-md shadow-blue-600/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Connect Agent Gateway</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. STATE: Agent Connected -> Render Real Last Month Line Graph
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#09090B] p-6 sm:p-8 shadow-[0_4px_24px_rgba(37,99,235,0.06)] space-y-6 font-sans relative text-slate-200">
      
      {/* Header & Date Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-[10px] font-mono text-emerald-400 mb-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AGENT ONLINE • MCP / FASTMCP NODE LINKED</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Last Month Transaction Trajectory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real settlement slope across the past 30 days: each successful milestone advances the line (<strong className="text-emerald-400">+1</strong>), and any failed milestone decrements the line (<strong className="text-rose-400">-1</strong>).
          </p>
        </div>

        {/* 30 Days Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Past 30 Days Range</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="block text-[11px] font-mono text-slate-400 uppercase">Total Transactions</span>
          <span className="text-lg sm:text-xl font-bold text-white font-mono mt-1 block">
            {totalCount}
          </span>
          <span className="text-[10px] font-mono text-slate-500">Last 30 Days</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="block text-[11px] font-mono text-slate-400 uppercase">Settlement Success</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
              {successCount}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">({successRate}%)</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-medium">+{successCount} Upward steps</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="block text-[11px] font-mono text-slate-400 uppercase">Settlements Failed</span>
          <span className="text-lg sm:text-xl font-bold text-rose-400 font-mono mt-1 block">
            {failureCount}
          </span>
          <span className="text-[10px] font-mono text-rose-400">-{failureCount} Downward steps</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="block text-[11px] font-mono text-slate-400 uppercase">1.5% Protocol Fee</span>
          <span className="text-lg sm:text-xl font-bold text-blue-400 font-mono mt-1 block">
            {formatUSD(totalCommissionUSD)}
          </span>
          <span className="text-[10px] font-mono text-slate-400">From {formatUSD(totalVolumeUSD)} vol</span>
        </div>
      </div>

      {/* 3. Empty State if Connected but 0 Transactions */}
      {totalCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-950/40 border border-blue-900/40 mx-auto flex items-center justify-center text-blue-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Transactions in the Past 30 Days</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Your agent is linked and in standby mode. When tasks are dispatched or milestone hashes settle via your API key or FastMCP, each transaction will dynamically plot on this line graph in real time.
            </p>
          </div>
        </div>
      ) : (
        /* 4. Real SVG Line Graph & Volume Histogram */
        <div className="space-y-4">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 overflow-hidden">
            
            {/* SVG Visual Canvas */}
            <div className="w-full overflow-x-auto no-scrollbar">
              <svg
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className="w-full h-auto min-w-[650px] select-none"
                style={{ overflow: "visible" }}
              >
                <defs>
                  {/* Glowing Area Fill Gradient */}
                  <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                    <stop offset="70%" stopColor="#2563EB" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
                  </linearGradient>

                  {/* Line Gradient */}
                  <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = PADDING.top + pct * CHART_H;
                  return (
                    <g key={i}>
                      <line
                        x1={PADDING.left}
                        y1={y}
                        x2={SVG_WIDTH - PADDING.right}
                        y2={y}
                        stroke="#1E293B"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}

                {/* Volume Histogram Bars at bottom */}
                {points.map((pt) => {
                  const barH = Math.max(8, (pt.tx.amountINR / maxAmount) * 35);
                  const barY = PADDING.top + CHART_H - barH;
                  const isSuccess = pt.tx.status === "SUCCESSFUL";
                  const isHovered = hoveredIndex === pt.index;

                  return (
                    <rect
                      key={`bar-${pt.index}`}
                      x={pt.x - 7}
                      y={barY}
                      width={14}
                      height={barH}
                      rx={3}
                      className="transition-all duration-150 cursor-pointer"
                      fill={
                        isHovered
                          ? isSuccess
                            ? "#10B981"
                            : "#EF4444"
                          : isSuccess
                          ? "rgba(16, 185, 129, 0.25)"
                          : "rgba(239, 68, 68, 0.25)"
                      }
                      stroke={isSuccess ? "#10B981" : "#EF4444"}
                      strokeWidth={isHovered ? 1.5 : 0.5}
                      onMouseEnter={() => setHoveredIndex(pt.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}

                {/* Area Gradient */}
                {areaPath && (
                  <path d={areaPath} fill="url(#lineAreaGrad)" className="transition-all duration-300" />
                )}

                {/* Main Trajectory Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#strokeGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300 drop-shadow-[0_2px_8px_rgba(37,99,235,0.4)]"
                  />
                )}

                {/* Interactive Points on Line */}
                {points.map((pt) => {
                  const isSuccess = pt.tx.status === "SUCCESSFUL";
                  const isHovered = hoveredIndex === pt.index;

                  return (
                    <g
                      key={`pt-${pt.index}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(pt.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Invisible hover target */}
                      <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />

                      {/* Pulse halo on hover */}
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={10}
                          fill={isSuccess ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}
                          className="animate-ping"
                        />
                      )}

                      {/* Visible node point */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4}
                        fill={isSuccess ? "#10B981" : "#EF4444"}
                        stroke="#09090B"
                        strokeWidth="2.5"
                        className="transition-all duration-150"
                      />

                      {/* Time Label on X-axis */}
                      <text
                        x={pt.x}
                        y={PADDING.top + CHART_H + 20}
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-slate-500 select-none"
                      >
                        {pt.tx.dateStr.slice(5)}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Scrub Crosshair */}
                {activePoint && (
                  <line
                    x1={activePoint.x}
                    y1={PADDING.top}
                    x2={activePoint.x}
                    y2={PADDING.top + CHART_H}
                    stroke="#3B82F6"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            </div>

            {/* Hover Tooltip Overlay */}
            {activePoint && (
              <div
                className="pointer-events-none absolute z-20 top-4 right-4 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md p-3 shadow-xl text-xs font-mono space-y-1 max-w-xs animate-in fade-in zoom-in-95 duration-150 text-slate-200"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-white">{activePoint.tx.id}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      activePoint.tx.status === "SUCCESSFUL"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/50"
                        : "bg-rose-950/40 text-rose-400 border border-rose-800/50"
                    }`}
                  >
                    {activePoint.tx.status === "SUCCESSFUL" ? "+1 STEP UP" : "-1 STEP DOWN"}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  {activePoint.tx.timestamp}
                </div>
                <div className="text-white font-semibold text-xs pt-0.5">
                  {formatUSD(activePoint.tx.amountINR)}{" "}
                  <span className="text-blue-400 font-normal font-mono text-[10px]">
                    (Fee: {formatUSD(Number((activePoint.tx.amountINR * 0.015).toFixed(2)))})
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {activePoint.tx.fromAgent.name} → {activePoint.tx.toAgent.name}
                </div>
              </div>
            )}
          </div>

          {/* Trajectory Guide Note */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Green nodes: Successful verification (+1 upward slope)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Red nodes: Constraint / hash rejection (-1 downward dip)</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

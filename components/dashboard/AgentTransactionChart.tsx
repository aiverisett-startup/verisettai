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
  onExecuteTestSettlement?: (isSuccess: boolean) => void;
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
  onExecuteTestSettlement,
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
  const totalVolumeINR = useMemo(
    () => transactions.reduce((acc, t) => acc + t.amountINR, 0),
    [transactions]
  );
  const totalCommissionINR = Math.round(totalVolumeINR * 0.015);
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : "100.0";

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

  // Area under the line for translucent gold/emerald glow
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
      <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] relative overflow-hidden font-sans">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#C59B5F 1px, transparent 1px), linear-gradient(to right, #C59B5F 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center py-10 px-4 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF6EE] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45] shadow-[0_4px_16px_rgba(197,155,95,0.1)]">
            <Cpu className="w-7 h-7 stroke-[1.8] animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[11px] font-mono text-[#9E7A45]">
            <span className="w-2 h-2 rounded-full bg-[#C59B5F] animate-ping" />
            <span>AGENT GATEWAY DISCONNECTED</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1C1A17] tracking-tight">
              Connect Your Agent to View Transaction Trajectory
            </h2>
            <p className="text-xs sm:text-sm text-[#8C8275] mt-2 leading-relaxed">
              No active agent is connected to this vault. Connect your autonomous agent via FastMCP or REST Gateway to stream live settlement telemetry, view the last month’s transaction line graph, and inspect PhonePe-style clearing records.
            </p>
          </div>

          <button
            onClick={onConnectAgent}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] px-6 py-3 text-xs font-semibold text-white transition shadow-md shadow-[#C59B5F]/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
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
    <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] space-y-6 font-sans relative">
      
      {/* Header & Date Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0E9DC]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800 mb-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AGENT ONLINE • FASTMCP NODE LINKED</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1A17] tracking-tight flex items-center gap-2">
            <span>Last Month Transaction Trajectory</span>
          </h2>
          <p className="text-xs text-[#8C8275] mt-0.5">
            Real settlement slope across the past 30 days: each successful milestone advances the line (<strong className="text-emerald-700">+1</strong>), and any failed milestone decrements the line (<strong className="text-rose-700">-1</strong>).
          </p>
        </div>

        {/* 30 Days Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EAE3D2] text-xs font-mono text-[#8C8275]">
            <Calendar className="w-3.5 h-3.5 text-[#9E7A45]" />
            <span>Past 30 Days Range</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
          <span className="block text-[11px] font-mono text-[#8C8275] uppercase">Total Transactions</span>
          <span className="text-lg sm:text-xl font-bold text-[#1C1A17] font-mono mt-1 block">
            {totalCount}
          </span>
          <span className="text-[10px] font-mono text-[#8C8275]">Last 30 Days</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
          <span className="block text-[11px] font-mono text-[#8C8275] uppercase">Settlement Success</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg sm:text-xl font-bold text-emerald-700 font-mono">
              {successCount}
            </span>
            <span className="text-xs font-mono text-emerald-600 font-semibold">({successRate}%)</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 font-medium">+{successCount} Upward steps</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
          <span className="block text-[11px] font-mono text-[#8C8275] uppercase">Settlements Failed</span>
          <span className="text-lg sm:text-xl font-bold text-rose-700 font-mono mt-1 block">
            {failureCount}
          </span>
          <span className="text-[10px] font-mono text-rose-600">-{failureCount} Downward steps</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
          <span className="block text-[11px] font-mono text-[#8C8275] uppercase">1.5% Protocol Fee</span>
          <span className="text-lg sm:text-xl font-bold text-[#9E7A45] font-mono mt-1 block">
            ₹{totalCommissionINR.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] font-mono text-[#8C8275]">From ₹{totalVolumeINR.toLocaleString("en-IN")} vol</span>
        </div>
      </div>

      {/* 3. Empty State if Connected but 0 Transactions */}
      {totalCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EAE3D2] bg-[#FAF8F5]/60 p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] mx-auto flex items-center justify-center text-[#9E7A45]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1C1A17]">No Transactions in the Past 30 Days</h3>
            <p className="text-xs text-[#8C8275] mt-1 max-w-md mx-auto leading-relaxed">
              Your agent is linked and in standby mode. When tasks are dispatched or milestone hashes settle, each transaction will dynamically plot on this line graph in real time.
            </p>
          </div>
          {onExecuteTestSettlement && (
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onExecuteTestSettlement(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C59B5F] hover:bg-[#B38A4F] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Execute Agent Test Settlement (₹25,000)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 4. Real SVG Line Graph & Volume Histogram */
        <div className="space-y-4">
          <div className="relative rounded-2xl border border-[#EAE3D2] bg-[#FDFCF9] p-4 sm:p-6 overflow-hidden">
            
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
                    <stop offset="0%" stopColor="#C59B5F" stopOpacity="0.25" />
                    <stop offset="70%" stopColor="#C59B5F" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#C59B5F" stopOpacity="0.00" />
                  </linearGradient>

                  {/* Line Gradient */}
                  <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="50%" stopColor="#C59B5F" />
                    <stop offset="100%" stopColor="#9E7A45" />
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
                        stroke="#EAE3D2"
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
                    className="transition-all duration-300 drop-shadow-[0_2px_8px_rgba(197,155,95,0.3)]"
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
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="transition-all duration-150"
                      />

                      {/* Time Label on X-axis */}
                      <text
                        x={pt.x}
                        y={PADDING.top + CHART_H + 20}
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-[#8C8275] select-none"
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
                    stroke="#9E7A45"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                )}
              </svg>
            </div>

            {/* Hover Tooltip Overlay */}
            {activePoint && (
              <div
                className="pointer-events-none absolute z-20 top-4 right-4 rounded-xl border border-[#EAE3D2] bg-white/95 backdrop-blur-md p-3 shadow-xl text-xs font-mono space-y-1 max-w-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#F0E9DC] pb-1.5">
                  <span className="font-bold text-[#1C1A17]">{activePoint.tx.id}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      activePoint.tx.status === "SUCCESSFUL"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {activePoint.tx.status === "SUCCESSFUL" ? "+1 STEP UP" : "-1 STEP DOWN"}
                  </span>
                </div>
                <div className="text-[#8C8275] text-[11px]">
                  {activePoint.tx.timestamp}
                </div>
                <div className="text-[#1C1A17] font-semibold text-xs pt-0.5">
                  ₹{activePoint.tx.amountINR.toLocaleString("en-IN")}{" "}
                  <span className="text-[#8C8275] font-normal font-mono text-[10px]">
                    (Fee: ₹{Math.round(activePoint.tx.amountINR * 0.015).toLocaleString("en-IN")})
                  </span>
                </div>
                <div className="text-[10px] text-[#6E675D] truncate">
                  {activePoint.tx.fromAgent.name} → {activePoint.tx.toAgent.name}
                </div>
              </div>
            )}
          </div>

          {/* Trajectory Guide Note */}
          <div className="flex items-center justify-between text-xs text-[#8C8275] font-mono px-1">
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

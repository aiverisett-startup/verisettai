"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BarChart2,
  DollarSign,
  ShieldCheck,
} from "lucide-react";

export type TimeRange = "1D" | "1W" | "1M" | "ALL";

export interface DataPoint {
  id: string;
  timeLabel: string;
  dateLabel: string;
  outcome: "SUCCESS" | "FAILED";
  amountINR: number;
  fromAgent: string;
  toAgent: string;
  txId: string;
  // Dynamic calculated coordinates
  scoreDelta: number; // +1 for success, -1 for failure
  cumulativeScore: number;
  cumulativeVolume: number;
}

interface AgentTransactionChartProps {
  onSelectTx?: (txId: string) => void;
}

// Initial realistic dataset across Day, Week, Month
const BASELINE_1D: Omit<DataPoint, "scoreDelta" | "cumulativeScore" | "cumulativeVolume">[] = [
  { id: "d1", timeLabel: "02:00 AM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 12000, fromAgent: "Nexus-Payer", toAgent: "DataScraper-Worker", txId: "TXN-VRS-1001" },
  { id: "d2", timeLabel: "05:30 AM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 18500, fromAgent: "Apex-FinBot", toAgent: "CodeReview-Worker", txId: "TXN-VRS-1002" },
  { id: "d3", timeLabel: "08:15 AM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 24000, fromAgent: "QuantAgent-4", toAgent: "MacroAudit-Worker", txId: "TXN-VRS-1003" },
  { id: "d4", timeLabel: "10:00 AM", dateLabel: "Today", outcome: "FAILED",  amountINR: 9500,  fromAgent: "DocuSign-Bot", toAgent: "OcrParser-Worker", txId: "TXN-VRS-1004" },
  { id: "d5", timeLabel: "11:45 AM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 32000, fromAgent: "Nexus-Payer", toAgent: "FastMCP-Compiler", txId: "TXN-VRS-1005" },
  { id: "d6", timeLabel: "01:20 PM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 28000, fromAgent: "Synthetix-AI", toAgent: "DataScraper-Worker", txId: "TXN-VRS-1006" },
  { id: "d7", timeLabel: "02:50 PM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 15000, fromAgent: "Apex-FinBot", toAgent: "CodeReview-Worker", txId: "TXN-VRS-1007" },
  { id: "d8", timeLabel: "04:10 PM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 41000, fromAgent: "Krypton-Treasury", toAgent: "ZeroKnowledge-Worker", txId: "TXN-VRS-1008" },
  { id: "d9", timeLabel: "05:45 PM", dateLabel: "Today", outcome: "FAILED",  amountINR: 14000, fromAgent: "DocuSign-Bot", toAgent: "OcrParser-Worker", txId: "TXN-VRS-1009" },
  { id: "d10", timeLabel: "07:30 PM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 35000, fromAgent: "Nexus-Payer", toAgent: "FastMCP-Compiler", txId: "TXN-VRS-1010" },
  { id: "d11", timeLabel: "09:15 PM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 22500, fromAgent: "Apex-FinBot", toAgent: "MacroAudit-Worker", txId: "TXN-VRS-1011" },
  { id: "d12", timeLabel: "11:00 PM", dateLabel: "Today", outcome: "SUCCESS", amountINR: 19000, fromAgent: "QuantAgent-4", toAgent: "CodeReview-Worker", txId: "TXN-VRS-1012" },
];

const BASELINE_1W: Omit<DataPoint, "scoreDelta" | "cumulativeScore" | "cumulativeVolume">[] = [
  { id: "w1", timeLabel: "Mon", dateLabel: "Sep 14", outcome: "SUCCESS", amountINR: 45000, fromAgent: "Nexus-Payer", toAgent: "DataScraper-Worker", txId: "TXN-VRS-2001" },
  { id: "w2", timeLabel: "Tue", dateLabel: "Sep 15", outcome: "SUCCESS", amountINR: 62000, fromAgent: "Apex-FinBot", toAgent: "CodeReview-Worker", txId: "TXN-VRS-2002" },
  { id: "w3", timeLabel: "Wed", dateLabel: "Sep 16", outcome: "FAILED",  amountINR: 18000, fromAgent: "DocuSign-Bot", toAgent: "OcrParser-Worker", txId: "TXN-VRS-2003" },
  { id: "w4", timeLabel: "Thu", dateLabel: "Sep 17", outcome: "SUCCESS", amountINR: 78000, fromAgent: "Krypton-Treasury", toAgent: "ZeroKnowledge-Worker", txId: "TXN-VRS-2004" },
  { id: "w5", timeLabel: "Fri", dateLabel: "Sep 18", outcome: "SUCCESS", amountINR: 91000, fromAgent: "Synthetix-AI", toAgent: "FastMCP-Compiler", txId: "TXN-VRS-2005" },
  { id: "w6", timeLabel: "Sat", dateLabel: "Sep 19", outcome: "SUCCESS", amountINR: 54000, fromAgent: "QuantAgent-4", toAgent: "MacroAudit-Worker", txId: "TXN-VRS-2006" },
  { id: "w7", timeLabel: "Sun", dateLabel: "Sep 20", outcome: "SUCCESS", amountINR: 88500, fromAgent: "Nexus-Payer", toAgent: "CodeReview-Worker", txId: "TXN-VRS-2007" },
];

const BASELINE_1M: Omit<DataPoint, "scoreDelta" | "cumulativeScore" | "cumulativeVolume">[] = [
  { id: "m1", timeLabel: "Week 1", dateLabel: "Sep 01 - 07", outcome: "SUCCESS", amountINR: 180000, fromAgent: "Nexus-Payer", toAgent: "DataScraper-Worker", txId: "TXN-VRS-3001" },
  { id: "m2", timeLabel: "Week 2", dateLabel: "Sep 08 - 14", outcome: "SUCCESS", amountINR: 245000, fromAgent: "Apex-FinBot", toAgent: "CodeReview-Worker", txId: "TXN-VRS-3002" },
  { id: "m3", timeLabel: "Week 3", dateLabel: "Sep 15 - 21", outcome: "FAILED",  amountINR: 42000,  fromAgent: "DocuSign-Bot", toAgent: "OcrParser-Worker", txId: "TXN-VRS-3003" },
  { id: "m4", timeLabel: "Week 4", dateLabel: "Sep 22 - 28", outcome: "SUCCESS", amountINR: 310000, fromAgent: "Krypton-Treasury", toAgent: "FastMCP-Compiler", txId: "TXN-VRS-3004" },
];

// Helper to compute cumulative scores for trajectory
function computeCumulative(rawPoints: Omit<DataPoint, "scoreDelta" | "cumulativeScore" | "cumulativeVolume">[]): DataPoint[] {
  let score = 10; // start baseline
  let volume = 0;

  return rawPoints.map((pt) => {
    const delta = pt.outcome === "SUCCESS" ? 1 : -1;
    score = Math.max(1, score + delta);
    volume += pt.amountINR;

    return {
      ...pt,
      scoreDelta: delta,
      cumulativeScore: score,
      cumulativeVolume: volume,
    };
  });
}

export function AgentTransactionChart({ onSelectTx }: AgentTransactionChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1D");
  const [livePoints, setLivePoints] = useState<{ [K in TimeRange]?: Omit<DataPoint, "scoreDelta" | "cumulativeScore" | "cumulativeVolume">[] }>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Active dataset
  const activeRawList = useMemo(() => {
    if (livePoints[timeRange]) return livePoints[timeRange]!;
    if (timeRange === "1D") return BASELINE_1D;
    if (timeRange === "1W") return BASELINE_1W;
    if (timeRange === "1M") return BASELINE_1M;
    return [...BASELINE_1W, ...BASELINE_1D];
  }, [timeRange, livePoints]);

  const chartData = useMemo(() => computeCumulative(activeRawList), [activeRawList]);

  // Aggregate Metrics
  const totalVolumeINR = useMemo(() => chartData.reduce((acc, p) => acc + p.amountINR, 0), [chartData]);
  const successCount = useMemo(() => chartData.filter((p) => p.outcome === "SUCCESS").length, [chartData]);
  const failureCount = useMemo(() => chartData.filter((p) => p.outcome === "FAILED").length, [chartData]);
  const totalCount = chartData.length;
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : "100.0";
  const commissionINR = Math.round(totalVolumeINR * 0.015); // 1.5% flat take rate

  // SVG Dimension Math
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 260;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 60; // Space for volume bars
  const PADDING_LEFT = 35;
  const PADDING_RIGHT = 35;

  const GRAPH_WIDTH = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const GRAPH_HEIGHT = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const maxScore = useMemo(() => Math.max(...chartData.map((d) => d.cumulativeScore), 12), [chartData]);
  const minScore = useMemo(() => Math.min(...chartData.map((d) => d.cumulativeScore), 0), [chartData]);
  const scoreRange = Math.max(maxScore - minScore, 1);

  const maxVolume = useMemo(() => Math.max(...chartData.map((d) => d.amountINR), 1000), [chartData]);

  // Point coordinates
  const points = useMemo(() => {
    return chartData.map((d, i) => {
      const x = PADDING_LEFT + (i / Math.max(chartData.length - 1, 1)) * GRAPH_WIDTH;
      const normalizedScore = (d.cumulativeScore - minScore) / scoreRange;
      const y = PADDING_TOP + GRAPH_HEIGHT - normalizedScore * GRAPH_HEIGHT;
      
      // Volume bar height (max 45px at bottom)
      const barHeight = Math.max(6, (d.amountINR / maxVolume) * 45);
      const barY = SVG_HEIGHT - barHeight - 10;

      return { ...d, x, y, barHeight, barY };
    });
  }, [chartData, minScore, scoreRange, GRAPH_WIDTH, GRAPH_HEIGHT, SVG_HEIGHT, maxVolume]);

  // Smooth SVG Path String (Bezier cubic smoothing)
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) * 0.5;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) * 0.5;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [points]);

  // Filled gradient area path
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${PADDING_TOP + GRAPH_HEIGHT} L ${first.x} ${PADDING_TOP + GRAPH_HEIGHT} Z`;
  }, [linePath, points, GRAPH_HEIGHT]);

  // Live Simulator: User clicks "Simulate Success" or "Simulate Failure"
  const handleSimulateTransaction = (outcome: "SUCCESS" | "FAILED") => {
    const randomAmount = Math.floor(Math.random() * 25000) + 10000;
    const dateNow = new Date();
    const timeStr = dateNow.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newId = `live_${Date.now()}`;
    const newTx: Omit<DataPoint, "scoreDelta" | "cumulativeScore" | "cumulativeVolume"> = {
      id: newId,
      timeLabel: timeStr,
      dateLabel: "Just now",
      outcome,
      amountINR: randomAmount,
      fromAgent: "Apex-FinBot",
      toAgent: outcome === "SUCCESS" ? "FastMCP-Compiler" : "Untrusted-Worker",
      txId: `TXN-VRS-${Math.floor(Math.random() * 9000) + 1000}`,
    };

    setLivePoints((prev) => {
      const currentList = prev[timeRange] || activeRawList;
      return {
        ...prev,
        [timeRange]: [...currentList, newTx],
      };
    });
  };

  const handleReset = () => {
    setLivePoints((prev) => ({ ...prev, [timeRange]: undefined }));
    setHoveredIndex(null);
  };

  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="rounded-3xl border border-[#EAE3D2] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(197,155,95,0.06)] space-y-6 overflow-hidden font-sans">
      
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0E9DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE] border border-[#EAE3D2] text-[10px] font-mono text-[#9E7A45] mb-1">
            <Sparkles className="w-3 h-3 text-[#C59B5F]" />
            <span>Agent Transaction Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1A17] tracking-tight flex items-center gap-2">
            <span>Autonomous Clearing Velocity</span>
            <span className="text-xs font-normal font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Trajectory
            </span>
          </h2>
          <p className="text-xs text-[#8C8275] mt-0.5">
            Real-time stock-market-style trendline. Successful payouts tick the trajectory <strong className="text-emerald-700">UP (+1)</strong>; rejected deliveries dip <strong className="text-rose-700">DOWN (-1)</strong>.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FAF8F5] border border-[#EAE3D2] self-start md:self-center text-xs font-mono">
          {(["1D", "1W", "1M", "ALL"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => {
                setTimeRange(range);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer font-medium ${
                timeRange === range
                  ? "bg-[#C59B5F] text-white shadow-xs font-bold"
                  : "text-[#8C8275] hover:text-[#1C1A17]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross Volume */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
          <span className="text-[10px] uppercase font-mono font-medium text-[#8C8275] block">Settled Volume</span>
          <div className="text-lg sm:text-2xl font-bold font-mono text-[#1C1A17] mt-1">
            ₹{totalVolumeINR.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] font-mono text-[#9E7A45] mt-0.5 block">
            Fee: ₹{commissionINR.toLocaleString("en-IN")} (1.5%)
          </span>
        </div>

        {/* Success Rate */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
          <span className="text-[10px] uppercase font-mono font-medium text-[#8C8275] block">Success Ratio</span>
          <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-700 mt-1 flex items-center gap-1">
            <span>{successRate}%</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] font-mono text-[#8C8275] mt-0.5 block">
            {successCount} / {totalCount} passing
          </span>
        </div>

        {/* Up-ticks vs Down-dips */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2]">
          <span className="text-[10px] uppercase font-mono font-medium text-[#8C8275] block">Trajectory Delta</span>
          <div className="text-lg sm:text-2xl font-bold font-mono text-[#1C1A17] mt-1 flex items-center gap-2">
            <span className="text-emerald-700">+{successCount}</span>
            <span className="text-[#8C8275] text-sm font-normal">/</span>
            <span className="text-rose-600">-{failureCount}</span>
          </div>
          <span className="text-[10px] font-mono text-[#8C8275] mt-0.5 block">
            Net: +{successCount - failureCount} Ticks
          </span>
        </div>

        {/* Real-time Hover Readout */}
        <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/50 shadow-xs">
          <span className="text-[10px] uppercase font-mono font-medium text-[#9E7A45] block">
            Point Details ({hoveredPoint?.timeLabel})
          </span>
          <div className="text-sm sm:text-base font-bold text-[#1C1A17] font-mono mt-1 truncate">
            {hoveredPoint?.outcome === "SUCCESS" ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> +1 UP TICK (₹{hoveredPoint.amountINR.toLocaleString("en-IN")})
              </span>
            ) : (
              <span className="text-rose-700 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> -1 DOWN DIP (Refunded)
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#8C8275] truncate block mt-0.5">
            {hoveredPoint?.fromAgent} → {hoveredPoint?.toAgent}
          </span>
        </div>
      </div>

      {/* SVG Interactive Stock Line & Volume Chart */}
      <div className="relative w-full bg-[#FAF8F5]/80 rounded-2xl border border-[#EAE3D2] p-2 sm:p-4 overflow-hidden select-none">
        
        {/* Background Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(to right, #EAE3D2 1px, transparent 1px), linear-gradient(to bottom, #EAE3D2 1px, transparent 1px)", backgroundSize: "60px 45px" }} />
        </div>

        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto overflow-visible cursor-crosshair relative z-10"
        >
          <defs>
            {/* Smooth Golden Gradient Area Fill */}
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#C59B5F" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Golden Stroke Gradient */}
            <linearGradient id="chartStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C59B5F" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Filter for glowing drop shadow */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#C59B5F" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#chartAreaGrad)" />

          {/* Baseline Reference Line */}
          <line
            x1={PADDING_LEFT}
            y1={PADDING_TOP + GRAPH_HEIGHT}
            x2={SVG_WIDTH - PADDING_RIGHT}
            y2={PADDING_TOP + GRAPH_HEIGHT}
            stroke="#EAE3D2"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Volume Bar Graph at Bottom (Stock Volume Histogram) */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            const barColor = pt.outcome === "SUCCESS" ? "#C59B5F" : "#EF4444";

            return (
              <g key={`bar_${pt.id}`}>
                <rect
                  x={pt.x - 7}
                  y={pt.barY}
                  width="14"
                  height={pt.barHeight}
                  rx="3"
                  fill={barColor}
                  opacity={isHovered ? 0.95 : 0.45}
                  className="transition-all duration-150 hover:opacity-100"
                  onMouseEnter={() => setHoveredIndex(i)}
                />
              </g>
            );
          })}

          {/* Main Trajectory Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#chartStrokeGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#goldGlow)"
          />

          {/* Interactive Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            const isUp = pt.outcome === "SUCCESS";
            const pointFill = isUp ? "#10B981" : "#EF4444";

            return (
              <g
                key={pt.id}
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-pointer group"
                onClick={() => onSelectTx && onSelectTx(pt.txId)}
              >
                {/* Outer Ring on Hover */}
                {isHovered && (
                  <>
                    {/* Vertical Crosshair Line */}
                    <line
                      x1={pt.x}
                      y1={PADDING_TOP}
                      x2={pt.x}
                      y2={SVG_HEIGHT - 10}
                      stroke="#9E7A45"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      strokeOpacity="0.7"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="9"
                      fill={isUp ? "#10B981" : "#EF4444"}
                      opacity="0.25"
                      className="animate-ping"
                    />
                  </>
                )}

                {/* Main Node Point */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill="white"
                  stroke={pointFill}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150 group-hover:scale-125"
                />

                {/* X-Axis Label */}
                {(i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1 || isHovered) && (
                  <text
                    x={pt.x}
                    y={SVG_HEIGHT - 1}
                    textAnchor="middle"
                    fill="#8C8275"
                    fontSize="10"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {pt.timeLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Volume Histogram Label */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8275] pt-2 px-3 border-t border-[#EAE3D2]/60">
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-3 h-3 text-[#9E7A45]" />
            <span>Dual-State Volume Histogram (₹ INR Gross)</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#C59B5F]" />
              <span>Verified Settlement</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-rose-500" />
              <span>Failed / Auto-Refund</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Action Controls */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D2] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-[#1C1A17] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#C59B5F]" />
            <span>Interactive Simulator</span>
          </span>
          <p className="text-[11px] text-[#8C8275]">
            Trigger mock transactions to test the trajectory reaction in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* + Simulate Success */}
          <button
            onClick={() => handleSimulateTransaction("SUCCESS")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Simulate a passing milestone (+1 Up Tick)"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+ Simulate Success (+1 UP)</span>
          </button>

          {/* - Simulate Failure */}
          <button
            onClick={() => handleSimulateTransaction("FAILED")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Simulate a rejected milestone (-1 Down Dip)"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>- Simulate Failure (-1 DIP)</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl border border-[#EAE3D2] bg-white hover:bg-[#FAF6EE] text-[#8C8275] hover:text-[#1C1A17] transition-colors cursor-pointer"
            title="Reset to default baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

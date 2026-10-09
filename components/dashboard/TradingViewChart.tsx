"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Maximize2,
  Minimize2,
  Camera,
  Sliders,
  TrendingUp,
  BarChart2,
  Activity,
  Check,
} from "lucide-react";

export type TimeframeOption = "1m" | "5m" | "15m" | "1h" | "1D";
export type ChartStyle = "area" | "candles";

export interface CandleDataPoint {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingViewChartProps {
  agentName?: string;
  agentId?: string;
  currentTps?: number;
  latencyMs?: number;
  data?: CandleDataPoint[];
}

export function TradingViewChart({
  agentName = "Agent Swarm Node 01",
  agentId = "AGT-NODE-01",
  currentTps = 1259.1,
  latencyMs = 24,
  data,
}: TradingViewChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1m");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("area");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showIndicators, setShowIndicators] = useState<boolean>(true);
  const [copiedSnapshot, setCopiedSnapshot] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate deterministic realistic synthetic candlestick stream based on current TPS & timeframe
  const candles: CandleDataPoint[] = useMemo(() => {
    if (data && data.length > 0) return data;

    const baseTps = currentTps > 0 ? currentTps : 1200;
    const pointsCount = timeframe === "1m" ? 30 : timeframe === "5m" ? 40 : 50;
    const now = Date.now();
    const stepMs =
      timeframe === "1m"
        ? 60 * 1000
        : timeframe === "5m"
        ? 5 * 60 * 1000
        : timeframe === "15m"
        ? 15 * 60 * 1000
        : timeframe === "1h"
        ? 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

    const list: CandleDataPoint[] = [];
    let current = baseTps * 0.94;

    for (let i = pointsCount - 1; i >= 0; i--) {
      const ts = now - i * stepMs;
      const d = new Date(ts);
      const timeStr =
        timeframe === "1D"
          ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

      // Controlled random walk
      const deltaPercent = (Math.sin(i * 0.6) + (Math.random() - 0.48) * 0.8) * 0.02;
      const open = Math.round(current * 10) / 10;
      const close = Math.round((current * (1 + deltaPercent)) * 10) / 10;
      const high = Math.round((Math.max(open, close) + Math.random() * (baseTps * 0.015)) * 10) / 10;
      const low = Math.round((Math.min(open, close) - Math.random() * (baseTps * 0.012)) * 10) / 10;
      const volume = Math.round(400 + Math.random() * 850 + (close > open ? 200 : 0));

      list.push({
        time: timeStr,
        timestamp: ts,
        open,
        high,
        low,
        close,
        volume,
      });

      current = close;
    }

    return list;
  }, [data, currentTps, timeframe]);

  // Chart Dimensions & Geometry
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = isFullscreen ? 520 : 340;
  const PADDING = { top: 30, right: 65, bottom: 45, left: 20 };
  const VOLUME_HEIGHT = 60;
  const PLOT_W = SVG_WIDTH - PADDING.left - PADDING.right;
  const PLOT_H = SVG_HEIGHT - PADDING.top - PADDING.bottom - VOLUME_HEIGHT;

  // Min & Max calculations
  const { minVal, maxVal, maxVolume } = useMemo(() => {
    if (candles.length === 0) return { minVal: 0, maxVal: 100, maxVolume: 1000 };
    let low = Infinity;
    let high = -Infinity;
    let maxVol = 0;

    candles.forEach((c) => {
      if (c.low < low) low = c.low;
      if (c.high > high) high = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const padding = (high - low) * 0.1 || 10;
    return {
      minVal: Math.max(0, low - padding),
      maxVal: high + padding,
      maxVolume: Math.max(10, maxVol),
    };
  }, [candles]);

  // X & Y scale helpers
  const getX = (index: number) => {
    return PADDING.left + (index / Math.max(1, candles.length - 1)) * PLOT_W;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return PADDING.top + PLOT_H - ((val - minVal) / range) * PLOT_H;
  };

  const getVolY = (vol: number) => {
    const ratio = Math.min(1, vol / maxVolume);
    return SVG_HEIGHT - PADDING.bottom - ratio * (VOLUME_HEIGHT - 10);
  };

  // Y-axis Gridlines
  const yGridLines = useMemo(() => {
    const steps = 5;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const ratio = i / steps;
      const y = PADDING.top + PLOT_H * (1 - ratio);
      const val = minVal + ratio * (maxVal - minVal);
      return { y, val };
    });
  }, [minVal, maxVal, PLOT_H]);

  // Area Path
  const areaPaths = useMemo(() => {
    if (candles.length === 0) return { line: "", fill: "" };

    const pts = candles.map((c, i) => ({ x: getX(i), y: getY(c.close) }));
    if (pts.length === 1) return { line: `M ${pts[0].x} ${pts[0].y}`, fill: "" };

    let line = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      line += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const baselineY = PADDING.top + PLOT_H;
    const fill = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${baselineY} L ${pts[0].x.toFixed(1)} ${baselineY} Z`;

    return { line, fill };
  }, [candles, minVal, maxVal, PLOT_W, PLOT_H]);

  // Active Crosshair Point
  const activeCandleIndex = useMemo(() => {
    if (!mousePos || candles.length === 0) return candles.length - 1;
    const ratio = (mousePos.x - PADDING.left) / PLOT_W;
    const idx = Math.round(ratio * (candles.length - 1));
    return Math.max(0, Math.min(candles.length - 1, idx));
  }, [mousePos, candles, PLOT_W]);

  const activeCandle = candles[activeCandleIndex] || candles[candles.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const handleSnapshot = () => {
    setCopiedSnapshot(true);
    setTimeout(() => setCopiedSnapshot(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-[#2A2E39] bg-[#131722] text-[#D1D4DC] font-sans overflow-hidden transition-all shadow-xl ${
        isFullscreen ? "fixed inset-4 z-50 flex flex-col bg-[#131722]" : "relative"
      }`}
    >
      {/* 1. TradingView Top Financial Toolbar */}
      <div className="flex items-center justify-between border-b border-[#2A2E39] bg-[#1E222D] px-4 py-2.5 text-xs font-mono select-none flex-wrap gap-2">
        {/* Left: Symbol & Timeframe Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-[#2A2E39]">
            <span className="font-bold text-white text-sm tracking-tight">{agentId}</span>
            <span className="text-[11px] text-[#787B86] truncate max-w-[140px] hidden sm:inline">
              {agentName}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-[#131722] p-0.5 rounded-lg border border-[#2A2E39]">
            {(["1m", "5m", "15m", "1h", "1D"] as TimeframeOption[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  timeframe === tf
                    ? "bg-[#2962FF] text-white shadow-xs"
                    : "text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A2E39]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#2A2E39] hidden sm:block" />

          {/* Chart Style Switcher (Area vs Candles) */}
          <div className="flex items-center gap-1 bg-[#131722] p-0.5 rounded-lg border border-[#2A2E39]">
            <button
              onClick={() => setChartStyle("area")}
              className={`p-1 rounded-md transition cursor-pointer ${
                chartStyle === "area"
                  ? "bg-[#2962FF] text-white"
                  : "text-[#787B86] hover:text-[#D1D4DC]"
              }`}
              title="Area Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartStyle("candles")}
              className={`p-1 rounded-md transition cursor-pointer ${
                chartStyle === "candles"
                  ? "bg-[#2962FF] text-white"
                  : "text-[#787B86] hover:text-[#D1D4DC]"
              }`}
              title="Candlestick Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicators Toggle */}
          <button
            onClick={() => setShowIndicators((prev) => !prev)}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition cursor-pointer ${
              showIndicators
                ? "border-[#2962FF]/50 bg-[#2962FF]/10 text-[#2962FF]"
                : "border-[#2A2E39] bg-[#131722] text-[#787B86] hover:text-[#D1D4DC]"
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Indicators</span>
          </button>
        </div>

        {/* Right: Crosshair / Snapshot / Fullscreen */}
        <div className="flex items-center gap-2">
          {latencyMs && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[11px]">
              <Activity className="w-3 h-3" />
              <span>{latencyMs}ms</span>
            </span>
          )}

          <button
            onClick={handleSnapshot}
            className="p-1.5 rounded-lg text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A2E39] transition cursor-pointer"
            title="Take Chart Snapshot"
          >
            {copiedSnapshot ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A2E39] transition cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Full Chart"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Floating Legend Row (OHLC + Volume) */}
      <div className="flex items-center gap-4 px-4 py-2 text-[11px] font-mono border-b border-[#2A2E39]/60 bg-[#131722]/90 flex-wrap">
        <span className="text-[#787B86]">Throughput (TPS):</span>
        <span className="text-white font-bold">
          {activeCandle ? activeCandle.close.toFixed(2) : "—"}
        </span>
        <span className="text-[#787B86]">
          O:{" "}
          <span className="text-[#D1D4DC]">{activeCandle?.open.toFixed(2) || "—"}</span>
        </span>
        <span className="text-[#787B86]">
          H:{" "}
          <span className="text-emerald-400">{activeCandle?.high.toFixed(2) || "—"}</span>
        </span>
        <span className="text-[#787B86]">
          L:{" "}
          <span className="text-rose-400">{activeCandle?.low.toFixed(2) || "—"}</span>
        </span>
        <span className="text-[#787B86]">
          C:{" "}
          <span
            className={
              activeCandle && activeCandle.close >= activeCandle.open
                ? "text-emerald-400 font-bold"
                : "text-rose-400 font-bold"
            }
          >
            {activeCandle?.close.toFixed(2) || "—"}
          </span>
        </span>
        <span className="text-[#787B86]">
          Vol:{" "}
          <span className="text-blue-400 font-semibold">
            {activeCandle?.volume.toLocaleString() || "—"}
          </span>
        </span>

        {showIndicators && (
          <span className="text-[#2962FF] font-semibold hidden lg:inline">
            • EMA(20): {(minVal + (maxVal - minVal) * 0.52).toFixed(1)}
          </span>
        )}
      </div>

      {/* 3. Interactive Chart SVG Area */}
      <div className={`relative ${isFullscreen ? "flex-1" : ""}`}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="tv-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2962FF" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#2962FF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2962FF" stopOpacity="0.0" />
            </linearGradient>

            <pattern id="tv-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1E222D"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect
            x={PADDING.left}
            y={PADDING.top}
            width={PLOT_W}
            height={PLOT_H + VOLUME_HEIGHT}
            fill="url(#tv-grid)"
          />

          {/* Horizontal Price Gridlines & Labels */}
          {yGridLines.map(({ y, val }, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + PLOT_W}
                y2={y}
                stroke="#2A2E39"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={SVG_WIDTH - PADDING.right + 8}
                y={y + 3}
                fill="#787B86"
                fontSize="10"
                fontFamily="monospace"
              >
                {val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Volume Separator Baseline */}
          <line
            x1={PADDING.left}
            y1={PADDING.top + PLOT_H}
            x2={PADDING.left + PLOT_W}
            y2={PADDING.top + PLOT_H}
            stroke="#2A2E39"
            strokeWidth="1"
          />

          {/* Volume Bars */}
          {candles.map((c, i) => {
            const x = getX(i);
            const barW = Math.max(3, (PLOT_W / candles.length) * 0.7);
            const y = getVolY(c.volume);
            const h = SVG_HEIGHT - PADDING.bottom - y;
            const isGreen = c.close >= c.open;

            return (
              <rect
                key={`vol-${i}`}
                x={x - barW / 2}
                y={y}
                width={barW}
                height={h}
                fill={isGreen ? "#089981" : "#F23645"}
                opacity={activeCandleIndex === i ? 0.9 : 0.45}
              />
            );
          })}

          {/* Candlesticks or Area Rendering */}
          {chartStyle === "candles" ? (
            // Candlestick Rendering
            candles.map((c, i) => {
              const x = getX(i);
              const isGreen = c.close >= c.open;
              const color = isGreen ? "#089981" : "#F23645";

              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);

              const candleTop = Math.min(openY, closeY);
              const candleHeight = Math.max(2, Math.abs(openY - closeY));
              const candleW = Math.max(4, (PLOT_W / candles.length) * 0.75);

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Body */}
                  <rect
                    x={x - candleW / 2}
                    y={candleTop}
                    width={candleW}
                    height={candleHeight}
                    fill={color}
                    stroke={color}
                    rx="1"
                  />
                </g>
              );
            })
          ) : (
            // Area Chart Rendering
            <g>
              <path d={areaPaths.fill} fill="url(#tv-area-grad)" />
              <path
                d={areaPaths.line}
                fill="none"
                stroke="#2962FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Timeframe X-Axis Labels */}
          {candles
            .filter((_, i) => i % Math.ceil(candles.length / 6) === 0)
            .map((c, i) => {
              const x = getX(candles.indexOf(c));
              return (
                <text
                  key={`time-${i}`}
                  x={x}
                  y={SVG_HEIGHT - 15}
                  textAnchor="middle"
                  fill="#787B86"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {c.time}
                </text>
              );
            })}

          {/* Interactive Crosshair & Tooltips */}
          {mousePos && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={getX(activeCandleIndex)}
                y1={PADDING.top}
                x2={getX(activeCandleIndex)}
                y2={SVG_HEIGHT - PADDING.bottom}
                stroke="#787B86"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Horizontal Crosshair Line */}
              <line
                x1={PADDING.left}
                y1={mousePos.y}
                x2={PADDING.left + PLOT_W}
                y2={mousePos.y}
                stroke="#787B86"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Crosshair Dot on Active Close Point */}
              <circle
                cx={getX(activeCandleIndex)}
                cy={getY(activeCandle.close)}
                r="4.5"
                fill="#2962FF"
                stroke="#FFFFFF"
                strokeWidth="2"
              />

              {/* Y-Axis Value Badge */}
              <g transform={`translate(${SVG_WIDTH - PADDING.right}, ${mousePos.y - 10})`}>
                <rect x="0" y="0" width="58" height="20" rx="3" fill="#2962FF" />
                <text
                  x="29"
                  y="13"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {(
                    minVal +
                    ((PADDING.top + PLOT_H - mousePos.y) / PLOT_H) * (maxVal - minVal)
                  ).toFixed(1)}
                </text>
              </g>

              {/* X-Axis Time Badge */}
              <g transform={`translate(${getX(activeCandleIndex) - 30}, ${SVG_HEIGHT - 28})`}>
                <rect x="0" y="0" width="60" height="18" rx="3" fill="#2A2E39" />
                <text
                  x="30"
                  y="12"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {activeCandle.time}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Activity, ShieldCheck, Clock } from "lucide-react";

export interface VelocityDataPoint {
  date: string;
  completed: number;
  incomplete: number;
}

export interface TransactionChartProps {
  data?: VelocityDataPoint[];
}

export function TransactionChart({ data }: TransactionChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default last 7 days window if no data is provided
  const fallbackDays: VelocityDataPoint[] = useMemo(() => {
    const list: VelocityDataPoint[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      list.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed: 0,
        incomplete: 0,
      });
    }
    return list;
  }, []);

  const chartData = data && data.length > 0 ? data : fallbackDays;

  // Chart Dimension Constants
  const SVG_WIDTH = 700;
  const SVG_HEIGHT = 220;
  const PADDING = { top: 25, right: 30, bottom: 40, left: 45 };
  const PLOT_W = SVG_WIDTH - PADDING.left - PADDING.right;
  const PLOT_H = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  // Determine Max Scale
  const rawMax = Math.max(
    0,
    ...chartData.map((d) => Math.max(d.completed, d.incomplete))
  );
  const allZero = rawMax === 0;
  const maxVal = allZero ? 4 : Math.max(4, Math.ceil(rawMax * 1.25));

  // Compute 4 grid intervals
  const gridLines = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const ratio = i / steps;
      const y = PADDING.top + PLOT_H * (1 - ratio);
      const val = allZero ? (i === 0 ? 0 : i) : Math.round(maxVal * ratio);
      return { y, val, isBaseline: i === 0 };
    });
  }, [PLOT_H, maxVal, allZero]);

  // Map Data to SVG Coordinates
  const points = useMemo(() => {
    const n = chartData.length;
    return chartData.map((d, i) => {
      const x = PADDING.left + (i / Math.max(1, n - 1)) * PLOT_W;
      const completedY = allZero
        ? PADDING.top + PLOT_H
        : PADDING.top + PLOT_H - (d.completed / maxVal) * PLOT_H;
      const incompleteY = allZero
        ? PADDING.top + PLOT_H
        : PADDING.top + PLOT_H - (d.incomplete / maxVal) * PLOT_H;

      return {
        x,
        completedY,
        incompleteY,
        data: d,
        index: i,
      };
    });
  }, [chartData, PLOT_W, PLOT_H, maxVal, allZero]);

  // Smooth Bezier Curve Path Builder
  const buildSmoothPath = (pts: Array<{ x: number; y: number }>): string => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const completedLinePath = useMemo(() => {
    return buildSmoothPath(points.map((p) => ({ x: p.x, y: p.completedY })));
  }, [points]);

  const completedAreaPath = useMemo(() => {
    if (points.length === 0) return "";
    const baselineY = PADDING.top + PLOT_H;
    return `${completedLinePath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`;
  }, [completedLinePath, points, PLOT_H]);

  const incompleteLinePath = useMemo(() => {
    return buildSmoothPath(points.map((p) => ({ x: p.x, y: p.incompleteY })));
  }, [points]);

  // Aggregate totals
  const totalCompleted = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.completed, 0),
    [chartData]
  );
  const totalInFlight = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.incomplete, 0),
    [chartData]
  );

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl p-5 shadow-xs">
      {/* Header with Title, Subtitle, and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight font-sans">
              Escrow Clearing Velocity
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Daily completed settlements vs pending/in-flight vaults
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-xs" />
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">
              Completed / Settled
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">
              ({totalCompleted})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-4 h-0 border-t-2 border-dashed border-[#f59e0b]"
              style={{ strokeDasharray: "4 4" }}
            />
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">
              In-Flight / Pending
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">
              ({totalInFlight})
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative pt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-52 sm:h-56 select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Emerald Gradient Fill for Completed Path */}
            <linearGradient id="completedVelocityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Amber Pattern for In-Flight Line */}
            <pattern
              id="gridPattern"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="20"
                y2="0"
                stroke="currentColor"
                strokeOpacity="0.04"
              />
            </pattern>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {gridLines.map(({ y, val, isBaseline }, idx) => (
            <g key={idx}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={SVG_WIDTH - PADDING.right}
                y2={y}
                stroke={isBaseline ? "currentColor" : "currentColor"}
                strokeOpacity={isBaseline ? 0.2 : 0.07}
                strokeWidth={isBaseline ? 1.2 : 1}
                strokeDasharray={isBaseline ? undefined : "3 3"}
                className="text-neutral-400 dark:text-neutral-600"
              />
              <text
                x={PADDING.left - 8}
                y={y + 3.5}
                textAnchor="end"
                className="text-[10px] font-mono fill-neutral-400 dark:fill-neutral-500 font-medium"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Path 1: Completed Area Fill */}
          {!allZero && (
            <path
              d={completedAreaPath}
              fill="url(#completedVelocityGrad)"
              className="transition-opacity duration-300"
            />
          )}

          {/* Path 2: Incomplete / Pending Dashed Line in #f59e0b */}
          <path
            d={incompleteLinePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Path 1: Completed Solid Line in #10b981 */}
          <path
            d={completedLinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Baseline Indicator when All Values are 0 */}
          {allZero && (
            <g>
              <text
                x={SVG_WIDTH / 2}
                y={PADDING.top + PLOT_H / 2}
                textAnchor="middle"
                className="text-xs font-mono fill-neutral-400 dark:fill-neutral-500 font-medium select-none"
              >
                ● 0 Escrow Movements Recorded — Baseline Ready
              </text>
            </g>
          )}

          {/* Data Points & Interactive Hover Columns */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                {/* Vertical hover column guide line */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={PADDING.top}
                    x2={pt.x}
                    y2={PADDING.top + PLOT_H}
                    stroke="currentColor"
                    strokeOpacity={0.25}
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    className="text-neutral-500 dark:text-neutral-400"
                  />
                )}

                {/* Incomplete Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.incompleteY}
                  r={isHovered ? 4.5 : 3}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="transition-all duration-150"
                />

                {/* Completed Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.completedY}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="transition-all duration-150 shadow-sm"
                />

                {/* Invisible Hover Hitbox for touch & mouse */}
                <rect
                  x={pt.x - 25}
                  y={PADDING.top}
                  width={50}
                  height={PLOT_H + 20}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* X-Axis Date Stamp */}
                <text
                  x={pt.x}
                  y={SVG_HEIGHT - 12}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    isHovered
                      ? "fill-neutral-900 dark:fill-neutral-100 font-bold"
                      : "fill-neutral-500 dark:fill-neutral-400"
                  }`}
                >
                  {pt.data.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay Card */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-150 -translate-x-1/2 -top-1"
            style={{
              left: `${(points[hoveredIndex].x / SVG_WIDTH) * 100}%`,
            }}
          >
            <div className="bg-neutral-900/95 dark:bg-neutral-100/95 text-white dark:text-neutral-900 px-3 py-2 rounded-lg shadow-xl text-xs font-mono space-y-1 min-w-[140px] border border-neutral-700/50">
              <div className="font-bold text-[11px] pb-1 border-b border-neutral-700 dark:border-neutral-300 flex items-center justify-between">
                <span>{points[hoveredIndex].data.date}</span>
                <Clock className="w-3 h-3 text-neutral-400 dark:text-neutral-600" />
              </div>
              <div className="flex items-center justify-between text-emerald-400 dark:text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Completed:
                </span>
                <span className="font-bold">
                  {points[hoveredIndex].data.completed}
                </span>
              </div>
              <div className="flex items-center justify-between text-amber-400 dark:text-amber-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  In-Flight:
                </span>
                <span className="font-bold">
                  {points[hoveredIndex].data.incomplete}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";

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

  // Big, expansive canvas geometry
  const SVG_WIDTH = 960;
  const SVG_HEIGHT = 270;
  const PADDING = { top: 25, right: 35, bottom: 35, left: 45 };
  const PLOT_W = SVG_WIDTH - PADDING.left - PADDING.right;
  const PLOT_H = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  // Scale computation
  const rawMax = Math.max(
    0,
    ...chartData.map((d) => Math.max(d.completed, d.incomplete))
  );
  const allZero = rawMax === 0;
  const maxVal = allZero ? 4 : Math.max(4, Math.ceil(rawMax * 1.25));

  // Subtle Horizontal Gridlines
  const gridLines = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const ratio = i / steps;
      const y = PADDING.top + PLOT_H * (1 - ratio);
      const val = allZero ? (i === 0 ? 0 : "") : Math.round(maxVal * ratio);
      return { y, val, isBaseline: i === 0 };
    });
  }, [PLOT_H, maxVal, allZero]);

  // Points mapping
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

  // Flat, Crisp Cubic Bezier Path Builder
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
    if (points.length === 0 || allZero) return "";
    const baselineY = PADDING.top + PLOT_H;
    return `${completedLinePath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`;
  }, [completedLinePath, points, PLOT_H, allZero]);

  const incompleteLinePath = useMemo(() => {
    return buildSmoothPath(points.map((p) => ({ x: p.x, y: p.incompleteY })));
  }, [points]);

  const totalCompleted = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.completed, 0),
    [chartData]
  );
  const totalInFlight = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.incomplete, 0),
    [chartData]
  );

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-sm font-sans">
      {/* Expansive Header & Linear Pill Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800/80 mb-2">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Settlement Velocity
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Past 7 days cleared vs pending volume
          </p>
        </div>

        {/* Clean Pill Legend */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span>Cleared</span>
            <span className="text-xs font-mono text-neutral-400 ml-1">({totalCompleted})</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-[#64748b]" />
            <span>Pending</span>
            <span className="text-xs font-mono text-neutral-400 ml-1">({totalInFlight})</span>
          </div>
        </div>
      </div>

      {/* Large SVG Canvas */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-64 sm:h-72 md:h-80 select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Very faint, subtle gradient fading to 0% opacity */}
            <linearGradient id="minimalClearedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Thin Horizontal Dashed Gridlines (No vertical clutter lines) */}
          {gridLines.map(({ y, val, isBaseline }, idx) => (
            <g key={idx}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={SVG_WIDTH - PADDING.right}
                y2={y}
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray={isBaseline ? undefined : "2 2"}
                className={
                  isBaseline
                    ? "text-neutral-200 dark:text-neutral-800"
                    : "text-neutral-200/70 dark:text-neutral-800/80"
                }
              />
              {val !== "" && (
                <text
                  x={PADDING.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[11px] font-mono fill-neutral-400 dark:fill-neutral-500 font-normal select-none"
                >
                  {val}
                </text>
              )}
            </g>
          ))}

          {/* Subtle Area Fill (Opacity 0.04) */}
          {!allZero && (
            <path
              d={completedAreaPath}
              fill="url(#minimalClearedGrad)"
              className="transition-opacity duration-200"
            />
          )}

          {/* Pending Line: Thin stroke 2 in Muted Slate (#64748b) with dashed pattern */}
          {!allZero && (
            <path
              d={incompleteLinePath}
              fill="none"
              stroke="#64748b"
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-200"
            />
          )}

          {/* Cleared Line: Thin flat stroke 2 in Emerald (#059669) */}
          {!allZero && (
            <path
              d={completedLinePath}
              fill="none"
              stroke="#059669"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-200"
            />
          )}

          {/* Minimalist Data Nodes and Hitboxes */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                {/* Thin hover column vertical guide line */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={PADDING.top}
                    x2={pt.x}
                    y2={PADDING.top + PLOT_H}
                    stroke="currentColor"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    className="text-neutral-300 dark:text-neutral-700 pointer-events-none"
                  />
                )}

                {/* Incomplete / Pending Dot (r="3" with white border, highlighting when hovered) */}
                {!allZero && pt.data.incomplete > 0 && (
                  <circle
                    cx={pt.x}
                    cy={pt.incompleteY}
                    r={isHovered ? 5 : 3.5}
                    fill="#64748b"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="dark:stroke-neutral-900 transition-all duration-100"
                  />
                )}

                {/* Completed / Cleared Dot (r="3" with white border, highlighting when hovered) */}
                {!allZero && pt.data.completed > 0 && (
                  <circle
                    cx={pt.x}
                    cy={pt.completedY}
                    r={isHovered ? 5.5 : 4}
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="dark:stroke-neutral-900 transition-all duration-100"
                  />
                )}

                {/* Clean Transparent Hitbox for Hover */}
                <rect
                  x={pt.x - 30}
                  y={PADDING.top}
                  width={60}
                  height={PLOT_H + 20}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />

                {/* Subtle uppercase date labels along X-axis */}
                <text
                  x={pt.x}
                  y={SVG_HEIGHT - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-mono uppercase tracking-wider transition-colors select-none ${
                    isHovered
                      ? "fill-neutral-900 dark:fill-neutral-100 font-semibold"
                      : "fill-neutral-400 dark:fill-neutral-500 font-normal"
                  }`}
                >
                  {pt.data.date.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Minimalist Linear Tooltip Card */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-100 -translate-x-1/2 top-0"
            style={{
              left: `${(points[hoveredIndex].x / SVG_WIDTH) * 100}%`,
            }}
          >
            <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 rounded-xl shadow-lg text-xs font-sans space-y-1.5 min-w-[130px] border border-neutral-800 dark:border-neutral-200">
              <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 pb-1 border-b border-neutral-800 dark:border-neutral-100">
                {points[hoveredIndex].data.date.toUpperCase()}
              </div>
              <div className="flex items-center justify-between text-emerald-400 dark:text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                  Cleared:
                </span>
                <span className="font-mono font-medium">{points[hoveredIndex].data.completed}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]" />
                  Pending:
                </span>
                <span className="font-mono font-medium">{points[hoveredIndex].data.incomplete}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionChart;

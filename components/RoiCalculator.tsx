"use client";

import React, { useState } from "react";
import {
  Calculator,
  Clock,
  Zap,
  ArrowRight,
} from "lucide-react";

interface RoiCalculatorProps {
  onDeployNode: () => void;
}

export default function RoiCalculator({ onDeployNode }: RoiCalculatorProps) {
  const [monthlyOps, setMonthlyOps] = useState<number>(120000);
  const [humanFtes, setHumanFtes] = useState<number>(8);
  const [humanHourlyRate, setHumanHourlyRate] = useState<number>(25);

  const PLATFORM_LICENSE_ANNUAL = 50000;
  const VELLIXY_PER_OP_FEE = 0.40;
  const WORK_HOURS_PER_FTE_ANNUAL = 2080;

  const annualOps = monthlyOps * 12;
  const annualHumanCost = humanFtes * WORK_HOURS_PER_FTE_ANNUAL * humanHourlyRate;
  const annualVellixyOpsCost = annualOps * VELLIXY_PER_OP_FEE;
  const totalAnnualVellixyCost = PLATFORM_LICENSE_ANNUAL + annualVellixyOpsCost;

  const rawSavings = annualHumanCost - totalAnnualVellixyCost;
  const annualSavings = Math.max(0, rawSavings);
  const savingsPercent = Math.min(
    95,
    Math.round((annualSavings / (annualHumanCost || 1)) * 100)
  );

  const paybackMonths =
    annualSavings > 0
      ? ((PLATFORM_LICENSE_ANNUAL / annualSavings) * 12).toFixed(1)
      : "Immediate";

  const hoursReclaimed = humanFtes * WORK_HOURS_PER_FTE_ANNUAL;

  return (
    <section id="economics" className="py-24 border-t border-[#e5e7eb] bg-[#faf9f6] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5e7eb] font-mono text-xs font-medium text-[#2563eb] mb-4">
            <Calculator className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>FINANCIAL MODEL // UNIT ECONOMICS &amp; ROI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight">
            Predictable Pricing. Compounding Margins.
          </h2>
          <p className="mt-3 text-base text-[#6b7280] leading-relaxed">
            Compare $25.00/hour manual spreadsheet reconciliation against deterministic $0.40
            autonomous work-units inside certified hardware enclaves with Vellixy.
          </p>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 minimal-card p-6 sm:p-8 bg-white border border-[#e5e7eb]">
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#e5e7eb]">
              <span className="font-mono text-[11px] text-[#6b7280]">
                01 / SIMULATION PARAMETERS
              </span>
              <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#faf9f6] text-[#2563eb] border border-[#e5e7eb]">
                INTERACTIVE
              </span>
            </div>

            {/* Slider 1: Monthly Operations */}
            <div className="space-y-3 mb-7">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#111827] font-medium uppercase">
                  Monthly Reconciliations (Ops)
                </span>
                <span className="font-semibold text-[#2563eb] text-sm">
                  {monthlyOps.toLocaleString()} ops/mo
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={500000}
                step={5000}
                value={monthlyOps}
                onChange={(e) => setMonthlyOps(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f4f6] rounded-lg appearance-none cursor-pointer accent-[#111827]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#6b7280]">
                <span>10k ops (Mid-Market)</span>
                <span>250k ops (Enterprise)</span>
                <span>500k ops (Global Core)</span>
              </div>
            </div>

            {/* Slider 2: Operations Staff */}
            <div className="space-y-3 mb-7">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#111827] font-medium uppercase">
                  Finance &amp; Operations Headcount
                </span>
                <span className="font-semibold text-[#059669] text-sm">
                  {humanFtes} Full-Time Analysts
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={humanFtes}
                onChange={(e) => setHumanFtes(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f4f6] rounded-lg appearance-none cursor-pointer accent-[#059669]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#6b7280]">
                <span>1 Analyst</span>
                <span>15 Analysts</span>
                <span>30 Analysts</span>
              </div>
            </div>

            {/* Slider 3: Fully Burdened Hourly Cost */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#111827] font-medium uppercase">
                  Fully Burdened Hourly Labor Rate
                </span>
                <span className="font-semibold text-[#111827] text-sm">
                  ${humanHourlyRate}.00 / hr
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={150}
                step={1}
                value={humanHourlyRate}
                onChange={(e) => setHumanHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-[#f4f4f6] rounded-lg appearance-none cursor-pointer accent-[#111827]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#6b7280]">
                <span>$18/hr (Offshore)</span>
                <span>$75/hr (Senior Analyst)</span>
                <span>$150/hr (Specialized Accounting)</span>
              </div>
            </div>

            {/* Pricing Model Specs Box */}
            <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e5e7eb] space-y-2 font-mono text-xs">
              <div className="text-[#2563eb] font-semibold tracking-wider">
                [ CONTRACT SPECIFICATIONS ]
              </div>
              <div className="flex justify-between text-[#6b7280]">
                <span>Platform Cluster License:</span>
                <span className="font-semibold text-[#111827]">$50,000 / year</span>
              </div>
              <div className="flex justify-between text-[#6b7280]">
                <span>Autonomous Work-Unit Metering:</span>
                <span className="font-semibold text-[#059669]">$0.40 / verified op</span>
              </div>
              <div className="flex justify-between text-[#6b7280]">
                <span>Deterministic Invariant SLA:</span>
                <span className="font-semibold text-[#111827]">99.999% Zero-Loss</span>
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-5 minimal-card p-6 sm:p-8 bg-white border border-[#e5e7eb] flex flex-col justify-between">
            <div>
              {/* Top Metadata */}
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#e5e7eb]">
                <span className="font-mono text-[11px] font-medium text-[#059669]">
                  02 / AUDITED SAVINGS
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] font-mono text-xs font-semibold border border-emerald-200">
                  +{savingsPercent}% MARGIN EXPANSION
                </span>
              </div>

              <div className="font-mono text-4xl sm:text-5xl font-bold text-[#111827] tracking-tight">
                ${annualSavings.toLocaleString()}
                <span className="text-xs font-normal text-[#6b7280] block mt-1.5 font-sans">
                  Net annual OpEx capital recovered
                </span>
              </div>

              {/* Visual Comparison Bars */}
              <div className="mt-8 space-y-5 pt-6 border-t border-[#e5e7eb]">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#6b7280]">Manual Labor Cost:</span>
                    <span className="text-rose-600 font-semibold">
                      ${annualHumanCost.toLocaleString()} / yr
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f4f4f6] overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#6b7280]">Vellixy Autonomous Cost:</span>
                    <span className="text-[#2563eb] font-semibold">
                      ${totalAnnualVellixyCost.toLocaleString()} / yr
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f4f4f6] overflow-hidden">
                    <div
                      className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(10, Math.round((totalAnnualVellixyCost / (annualHumanCost || 1)) * 100))
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e5e7eb]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6b7280] mb-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#2563eb]" />
                    <span>Payback</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-[#111827]">
                    {paybackMonths} Mo
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e5e7eb]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6b7280] mb-1 font-mono">
                    <Zap className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Reclaimed</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-[#111827]">
                    {hoursReclaimed.toLocaleString()} hrs
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onDeployNode}
              className="btn-primary mt-8 w-full py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Lock Enterprise Allocation</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

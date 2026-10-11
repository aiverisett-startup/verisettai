"use client";

import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, ArrowRight, Play, CheckCircle2, Lock, Sparkles, RefreshCw } from "lucide-react";
import { ContractRecord } from "./types";

export interface WorkerConfig {
  name: string;
  amountDollars: number;
  schema?: Record<string, unknown>;
  samplePayload?: Record<string, unknown>;
}

interface DeveloperPlaygroundProps {
  onSimulateSettlement: (newContract: ContractRecord, isSuccess: boolean) => void;
  availableBalanceCents: number;
  activeWorkerConfig?: WorkerConfig | null;
}

interface Scenario {
  id: string;
  name: string;
  category: string;
  amountUSD: number;
  contractor: string;
  criteria: string[];
  testMetric: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "sc_web_mvp",
    name: "Autonomous Agent Swarm Orchestration",
    category: "M2M Agent Swarms",
    amountUSD: 250,
    contractor: "Agent_Theta_Worker",
    criteria: [
      "Unit & integration test pass rate > 98%",
      "Zero critical security vulnerabilities",
      "API response latency under 100ms",
    ],
    testMetric: "99.4% Automated Test Suite Passed",
  },
  {
    id: "sc_ai_agent",
    name: "Enterprise FastMCP Model & Pipeline Swarm",
    category: "AI & Autonomous Inference",
    amountUSD: 1000,
    contractor: "Agent_Gamma_Inference",
    criteria: [
      "Structured output schema validation passed",
      "Model inference benchmark < 850ms",
      "Deterministic SHA-256 result match",
    ],
    testMetric: "100% Schema & Benchmark Verified",
  },
  {
    id: "sc_security",
    name: "Deterministic ZK Proof & State Verification",
    category: "Cryptographic Consensus",
    amountUSD: 2500,
    contractor: "Agent_Sigma_Auditor",
    criteria: [
      "Formal verification mathematical proofs passed",
      "Zero high/medium static analysis alerts",
      "SHA-256 state root assertion cleared",
    ],
    testMetric: "Zero Security Vulnerabilities Detected",
  },
];

export const DeveloperPlayground: React.FC<DeveloperPlaygroundProps> = ({
  onSimulateSettlement,
  availableBalanceCents: _availableBalanceCents,
  activeWorkerConfig,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [simulationState, setSimulationState] = useState<"idle" | "evaluating" | "settled">("idle");
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const scenario = SCENARIOS[selectedScenarioIndex];

  useEffect(() => {
    if (activeWorkerConfig) {
      const matchedIdx = SCENARIOS.findIndex((s) =>
        s.name.toLowerCase().includes(activeWorkerConfig.name.toLowerCase().split(" ")[0])
      );
      if (matchedIdx !== -1) {
        setSelectedScenarioIndex(matchedIdx);
      }
    }
  }, [activeWorkerConfig]);

  const handleSimulate = () => {
    setSimulationState("evaluating");
    setProgressPercent(20);

    const t1 = setTimeout(() => {
      setProgressPercent(65);
    }, 450);

    const t2 = setTimeout(() => {
      setProgressPercent(100);
      setSimulationState("settled");

      const now = new Date().toISOString();
      const amountCents = scenario.amountUSD * 100;
      const feeCents = Math.round(amountCents * 0.015);

      const newRecord: ContractRecord = {
        id: `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        payer_id: "acct_payer_buyer",
        payer_name: "Agent_Alpha_Buyer",
        worker_id: "acct_worker_theta",
        worker_name: scenario.contractor,
        amount_cents: amountCents,
        fee_cents: feeCents,
        status: "SETTLED",
        assertion_type: "JSON_SCHEMA",
        created_at: now,
        expires_at: now,
        settled_at: now,
        timeout_seconds: 604800,
        assertion_payload: { deliverable: scenario.name, criteria: scenario.criteria },
        result_payload: { verified: true, metrics: scenario.testMetric },
        audit_trail: [
          {
            id: `led_${Date.now()}_1`,
            contract_id: "TX-ACTIVE",
            entry_type: "ESCROW_LOCK",
            from_account: "Agent_Alpha_Buyer (Vault)",
            to_account: "Neutral Vault Custody",
            amount_cents: amountCents,
            created_at: now,
          },
          {
            id: `led_${Date.now()}_2`,
            contract_id: "TX-ACTIVE",
            entry_type: "SETTLEMENT_PAYMENT",
            from_account: "Neutral Vault Custody",
            to_account: `${scenario.contractor} (Available)`,
            amount_cents: amountCents - feeCents,
            created_at: now,
          },
        ],
      };

      onSimulateSettlement(newRecord, true);
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  const handleReset = () => {
    setSimulationState("idle");
    setProgressPercent(0);
  };

  return (
    <div
      id="sandbox"
      className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_4px_24px_rgba(37,99,235,0.06)] overflow-hidden font-sans"
    >
      {/* 1. Header & Scenario Switcher */}
      <div className="p-6 sm:p-7 border-b border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {/* Clean Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-semibold mb-2 font-sans">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
              </span>
              <span>Interactive Escrow Sandbox</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
              Visual Milestone Verification Simulator
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-sans">
              Test how Verisett secures funds in neutral vault custody and executes instant auto-release upon deliverable acceptance.
            </p>
          </div>

          {/* Reset Button */}
          {simulationState === "settled" && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer shadow-2xs font-sans"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Simulation</span>
            </button>
          )}
        </div>

        {/* Horizontal Segmented Control / Modern Tab Group */}
        <div className="mt-5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0 font-sans">
            Select Scenario:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 gap-1 overflow-x-auto no-scrollbar max-w-full">
            {SCENARIOS.map((sc, i) => {
              const isActive = selectedScenarioIndex === i;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioIndex(i);
                    handleReset();
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer font-sans ${
                    isActive
                      ? "bg-blue-600 text-white font-medium shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 font-normal"
                  }`}
                >
                  <span>{sc.name.split("&")[0].trim()}</span>{" "}
                  <span
                    className={
                      isActive
                        ? "text-blue-100 font-mono font-medium"
                        : "text-zinc-400 dark:text-zinc-500 font-mono"
                    }
                  >
                    (${sc.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Balanced 2-Column Execution Grid */}
      <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white dark:bg-zinc-950">
        
        {/* Left Column (Step 1: Milestone Escrow Terms) */}
        <div className="space-y-4">
          {/* Step Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-semibold shadow-xs font-sans">
                1
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
                Milestone Escrow Terms
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Funds Pre-Locked
            </span>
          </div>

          {/* Escrow Value Card */}
          <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 p-4 flex items-center justify-between shadow-2xs">
            <div className="space-y-1">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium font-sans">
                Milestone Escrow Value
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-950 dark:text-zinc-50 tracking-tight">
                ${scenario.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                <span className="text-sm font-semibold text-blue-600">USD</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5 pt-0.5">
                <span>Agent_Alpha_Buyer</span>
                <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{scenario.contractor}</span>
              </div>
            </div>

            <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {/* Acceptance Criteria Checklist */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-sans">
              Pre-Agreed Acceptance Criteria:
            </div>
            <div className="space-y-2">
              {scenario.criteria.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-3.5 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs font-sans"
                >
                  <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                  <span className="leading-snug">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Summary: Locked Funds & Protocol Fee */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs shadow-2xs font-sans">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                Total Locked in Custody:{" "}
                <span className="font-mono font-semibold">
                  ${scenario.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                </span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-medium">
              1.5% Protocol Escrow Fee
            </span>
          </div>
        </div>

        {/* Right Column (Step 2: Automated Verification Gate) */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Step Header & CTA Button */}
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-semibold shadow-xs font-sans">
                  2
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
                  Automated Verification Gate
                </span>
              </div>

              {/* Simulate Milestone Release CTA */}
              <button
                onClick={handleSimulate}
                disabled={simulationState === "evaluating"}
                className={`h-10 px-5 text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 font-sans ${
                  simulationState === "settled"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.98]"
                }`}
              >
                {simulationState === "evaluating" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Deliverables...</span>
                  </>
                ) : simulationState === "settled" ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Milestone Cleared ✓</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Simulate Milestone Release</span>
                  </>
                )}
              </button>
            </div>

            {/* Artifact & Metric Box */}
            <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-zinc-500 dark:text-zinc-400">Delivered Artifact:</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                  Production Ready Build
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1.5 shadow-2xs font-sans">
                <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                  <span>Deliverable:</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-[240px]">
                    {scenario.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                  <span>Evaluation Metric:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                    {scenario.testMetric}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-zinc-500 dark:text-zinc-400">Verification Progress:</span>
                  <span
                    className={`font-mono font-bold ${
                      simulationState === "settled" ? "text-emerald-600" : "text-blue-600"
                    }`}
                  >
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-200/60 dark:border-zinc-700/60">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic State Badges */}
            <div className="space-y-2">
              {simulationState === "settled" ? (
                <>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 font-sans">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold">Condition Verified: Milestone Deliverable Accepted</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">PASSED</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-sans">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-semibold">Auto-Release Complete: 100%</span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${scenario.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD Disbursed
                    </span>
                  </div>
                </>
              ) : simulationState === "evaluating" ? (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-300 font-sans animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-600" />
                  <span>Checking Acceptance Invariants &amp; Automated Test Results...</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-sans">
                  <span>Status: Ready to Verify Milestone</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    Click simulate to test execution gate
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Banner: Full-width status strip */}
          <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>
                Execution Guarantee:{" "}
                <strong className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  38ms Sub-Second Release
                </strong>
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 font-medium">FastMCP Native</span>
          </div>

        </div>

      </div>
    </div>
  );
};

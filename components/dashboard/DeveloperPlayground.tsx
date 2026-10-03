"use client";

import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, ArrowRight, Play, CheckCircle2, Lock, Sparkles, Building2, RefreshCw } from "lucide-react";
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
    <div id="sandbox" className="rounded-2xl bg-white border border-slate-200 shadow-[0_4px_24px_rgba(37,99,235,0.06)] overflow-hidden">
      
      {/* Sandbox Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-7 border-b border-slate-200 bg-slate-50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 font-semibold">
              Interactive Escrow Sandbox
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#09090B] tracking-tight">
            Visual Milestone Verification Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Test how Verisett secures funds in neutral vault custody and executes instant auto-release upon deliverable acceptance.
          </p>
        </div>

        {/* Reset Button */}
        {simulationState === "settled" && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-blue-600 text-xs font-mono transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Test</span>
          </button>
        )}
      </div>

      {/* Scenario Selector Pills */}
      <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-mono text-slate-500 shrink-0 mr-1">Select Scenario:</span>
        {SCENARIOS.map((sc, i) => (
          <button
            key={sc.id}
            onClick={() => {
              setSelectedScenarioIndex(i);
              handleReset();
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedScenarioIndex === i
                ? "bg-blue-600 text-white border border-blue-500 shadow-xs font-semibold"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:text-[#09090B] hover:bg-blue-50"
            }`}
          >
            {sc.name.split("&")[0]} (${sc.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })})
          </button>
        ))}
      </div>

      {/* Dual Visual Card Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white">
        
        {/* Left Pane: Milestone Terms & Vault Security */}
        <div className="lg:col-span-6 p-6 sm:p-7 space-y-5 bg-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#09090B] uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-mono">
                1
              </span>
              Milestone Escrow Terms
            </span>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              FUNDS PRE-LOCKED
            </span>
          </div>

          {/* Value Card */}
          <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-xs text-slate-500 font-medium">Milestone Escrow Value</div>
              <div className="text-2xl font-bold font-mono text-[#09090B] mt-0.5">
                ${scenario.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Buyer: Agent_Alpha_Buyer ➔ Worker: {scenario.contractor}
              </div>
            </div>

            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          {/* Deliverable Acceptance Criteria Checklist */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#09090B]">
              Pre-Agreed Acceptance Criteria:
            </div>
            {scenario.criteria.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-[#09090B] shadow-xs"
              >
                <div className="h-4 w-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
                <span>{c}</span>
              </div>
            ))}
          </div>

          {/* Status Badge */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[#09090B] font-medium">Funds Locked in Escrow: ${scenario.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">1.5% Fee</span>
          </div>
        </div>

        {/* Right Pane: Live Deliverable Verification & Payout Release */}
        <div className="lg:col-span-6 p-6 sm:p-7 space-y-5 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-semibold text-[#09090B] uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-mono">
                  2
                </span>
                Automated Verification Gate
              </span>

              {/* Action Button */}
              <button
                onClick={handleSimulate}
                disabled={simulationState === "evaluating"}
                className={`minimal-btn-primary flex items-center gap-2 text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                  simulationState === "settled" ? "bg-emerald-700 hover:bg-emerald-800 border-emerald-700 text-white" : ""
                }`}
              >
                {simulationState === "evaluating" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Deliverables...</span>
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

            {/* Deliverable Submission Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Delivered Artifact:</span>
                <span className="font-mono text-[#09090B] font-semibold">Production Ready Build</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono space-y-1 shadow-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Deliverable:</span>
                  <span className="text-[#09090B] font-medium">{scenario.name}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Evaluation Metric:</span>
                  <span className="text-emerald-700 font-medium">{scenario.testMetric}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Verification Progress:</span>
                  <span className={`font-bold ${simulationState === "settled" ? "text-emerald-700" : "text-blue-600"}`}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="space-y-2 mt-4">
              {simulationState === "settled" ? (
                <>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">Condition Verified: Milestone Deliverable Accepted</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">PASSED</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-700">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold">Auto-Release Complete: 100%</span>
                    </div>
                    <span className="font-mono font-bold text-[#09090B]">${scenario.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD Disbursed</span>
                  </div>
                </>
              ) : simulationState === "evaluating" ? (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-700 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-600" />
                  <span>Checking Acceptance Invariants & Automated Test Results...</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>Status: Ready to Verify Milestone</span>
                  <span className="font-mono text-blue-600 font-semibold">Click button to test</span>
                </div>
              )}
            </div>
          </div>

          {/* Programmatic Guarantee Receipt */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Instant Auto-Release Settlement Speed:</span>
            <span className="font-mono text-emerald-700 font-semibold">38ms Guaranteed</span>
          </div>

        </div>

      </div>

    </div>
  );
};

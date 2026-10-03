"use client";

import React from "react";
import {
  ShieldCheck,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export interface SettlementWorkspaceProps {
  balanceVRS?: number | string;
  vaultCount: number;
  isAgentConnected: boolean;
  connectedAgentName?: string | null;
  onConnectAgent: () => void;
  onDisconnectAgent: () => void;
  onResetVault: () => void;
}

export function SettlementWorkspace({
  balanceVRS = "169,000",
  vaultCount,
  isAgentConnected,
  connectedAgentName,
  onConnectAgent,
  onDisconnectAgent,
  onResetVault,
}: SettlementWorkspaceProps) {
  const formattedBalance = typeof balanceVRS === "number" ? balanceVRS.toLocaleString() : balanceVRS;

  return (
    <div className="space-y-6">
      {/* Executive Overview Banner with Half-shape Accents */}
      <div className="relative rounded-3xl border border-[#EAE3D2] bg-white/90 backdrop-blur-md p-6 md:p-8 shadow-[0_8px_32px_rgba(37,99,235,0.06)] overflow-hidden">
        {/* Decorative Corner Half-Shape with subtle slate/blue strokes */}
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-40">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <path
              d="M100 0 C 100 55.2, 55.2 100, 0 100 L 100 100 Z"
              fill="url(#workspaceBlueGrad)"
            />
            <circle
              cx="100"
              cy="0"
              r="80"
              stroke="currentColor"
              className="stroke-blue-500/10"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx="100"
              cy="0"
              r="50"
              stroke="currentColor"
              className="stroke-zinc-200/80"
              strokeWidth="1.5"
            />
            <defs>
              <linearGradient
                id="workspaceBlueGrad"
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#3B82F6" stopOpacity="0.08" />
                <stop stopColor="#2563EB" stopOpacity="0.02" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[10px] font-mono text-blue-700">
              <Sparkles className="w-3 h-3 text-blue-600" /> Developer Sandbox • Testnet Simulation
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1C1A17] tracking-tight">
              Settlement Workspace
            </h1>
            <p className="text-sm text-[#8C8275] leading-relaxed">
              Verisett coordinates programmatic verification and software-defined escrow for autonomous AI workflows.
              Lock transaction value, set deterministic release rules, and disburse upon passing verification in this simulated testnet environment.
            </p>
          </div>
          <button
            type="button"
            onClick={onConnectAgent}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-500 transition cursor-pointer self-start md:self-auto px-4 py-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 shadow-2xs"
          >
            Configure Protocol Gateways <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sandbox & Zero Fiat Liability Disclosure */}
        <div className="mt-4 pt-3 border-t border-[#EAE3D2]/60 flex items-center gap-2 text-[11px] font-mono text-[#8C8275]">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>
            <strong>Sandbox Simulation Disclosure:</strong> All metrics, vault balances (VRS), and transaction flows represent testnet agent simulation with zero monetary fiat liability.
          </span>
        </div>
      </div>

      {/* Status Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Vault Testnet Balance */}
        <div className="group relative rounded-2xl border border-[#EAE3D2] bg-white p-6 shadow-[0_4px_20px_rgba(37,99,235,0.04)] hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8C8275] uppercase tracking-wider font-mono">
              Vault Testnet Balance
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <p className="font-sans font-semibold tracking-tight text-2xl sm:text-3xl text-[#1C1A17] tabular-nums">
              {formattedBalance} VRS
            </p>
            <button
              type="button"
              onClick={onResetVault}
              title="Reset vault balance to 169,000 VRS"
              className="text-xs text-blue-600 hover:text-blue-500 font-medium underline-offset-4 hover:underline cursor-pointer"
            >
              Reset Balance
            </button>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Deterministic Escrow Active
          </div>
        </div>

        {/* 2. Pending Settlements with Correct Pluralization */}
        <div className="group relative rounded-2xl border border-[#EAE3D2] bg-white p-6 shadow-[0_4px_20px_rgba(37,99,235,0.04)] hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8C8275] uppercase tracking-wider font-mono">
              Pending Settlements
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans font-semibold tracking-tight text-2xl sm:text-3xl text-[#1C1A17] mt-3 tabular-nums">
            {vaultCount} {vaultCount === 1 ? "Vault" : "Vaults"}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#8C8275]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Zero active disputes
          </div>
        </div>

        {/* 3. Agent Handshake Status */}
        <div className="group relative rounded-2xl border border-[#EAE3D2] bg-white p-6 shadow-[0_4px_20px_rgba(37,99,235,0.04)] hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8C8275] uppercase tracking-wider font-mono">
              Agent Handshake Status
            </span>
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                isAgentConnected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-blue-50 border-blue-200/80 text-blue-600"
              }`}
            >
              {isAgentConnected ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p
                className={`font-sans font-semibold tracking-tight text-2xl sm:text-3xl ${
                  isAgentConnected ? "text-emerald-700" : "text-zinc-400"
                }`}
              >
                {isAgentConnected ? "Connected" : "Standby"}
              </p>
              {isAgentConnected && (
                <p
                  className="text-xs font-semibold text-[#1C1A17] mt-0.5 font-mono truncate max-w-[210px]"
                  title={connectedAgentName || undefined}
                >
                  {connectedAgentName}
                </p>
              )}
            </div>
            {isAgentConnected ? (
              <button
                type="button"
                onClick={onDisconnectAgent}
                className="text-xs text-zinc-500 hover:text-rose-600 font-medium underline-offset-4 hover:underline cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                onClick={onConnectAgent}
                className="text-xs text-blue-600 hover:text-blue-500 font-medium underline-offset-4 hover:underline cursor-pointer"
              >
                Connect Agent
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-[#8C8275]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAgentConnected ? "bg-emerald-500" : "bg-blue-500"
              }`}
            />
            {isAgentConnected ? "FastMCP Active" : "Waiting for gateway handshake"}
          </div>
        </div>
      </div>
    </div>
  );
}

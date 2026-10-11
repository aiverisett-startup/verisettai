"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  FileDiff,
  Database,
  ShieldCheck,
} from "lucide-react";
import { ContractRecord } from "./types";

interface ContractDrawerProps {
  contract: ContractRecord | null;
  onClose: () => void;
}

export const ContractDrawer: React.FC<ContractDrawerProps> = ({
  contract,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"spec" | "audit">("spec");
  const [copiedId, setCopiedId] = useState(false);

  if (!contract) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(contract.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const amountUSD = (contract.amount_cents / 100).toFixed(2);
  const feeUSD = (contract.fee_cents / 100).toFixed(2);
  const workerNetUSD = ((contract.amount_cents - contract.fee_cents) / 100).toFixed(2);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto flex flex-col shadow-[0_20px_50px_rgba(37,99,235,0.12)] animate-in slide-in-from-right duration-200 custom-dark-scrollbar font-sans">
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {contract.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                  title="Copy contract ID"
                >
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border font-sans ${
                    contract.status === "SETTLED"
                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                      : contract.status === "CLAIMED" || contract.status === "FUNDED"
                      ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                      : "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {contract.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-sans">
                Escrow Value: <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">${amountUSD} USD</span> · 1.5% Fee: <span className="font-mono font-semibold">${feeUSD} USD</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 px-6 font-sans">
          <button
            onClick={() => setActiveTab("spec")}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-medium transition-colors cursor-pointer font-sans ${
              activeTab === "spec"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <FileDiff className="h-4 w-4" />
            Milestone Details &amp; Deliverable
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-medium transition-colors cursor-pointer font-sans ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Database className="h-4 w-4" />
            Double-Entry Financial Trail
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 p-6 space-y-6 font-sans">
          {/* Parties Meta Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-sans">
                Payer Agent
              </span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm mt-1">{contract.payer_name}</p>
              <p className="font-mono text-[11px] text-zinc-500 truncate">{contract.payer_id}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-sans">
                Worker Agent
              </span>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm mt-1">
                {contract.worker_name || "Awaiting Assignment..."}
              </p>
              <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate">
                {contract.worker_id || "Unassigned"}
              </p>
            </div>
          </div>

          {/* Tab 1: Spec & Deliverable */}
          {activeTab === "spec" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50 font-sans">Milestone Acceptance Spec</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold">{contract.assertion_type}</span>
                </div>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
                    <span className="text-zinc-500 dark:text-zinc-400">Escrow Value:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">${amountUSD} USD</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
                    <span className="text-zinc-500 dark:text-zinc-400">Release Latency:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">38ms Instant</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
                    <span className="text-zinc-500 dark:text-zinc-400">Vault Custody Status:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {contract.status === "SETTLED" ? "Disbursed to Worker Agent" : "Protected in Vault"}
                    </span>
                  </div>
                </div>
              </div>

              {contract.result_payload && (
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-2.5 shadow-2xs font-sans">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 block font-sans">
                    Verified Deliverable Evidence:
                  </span>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-mono text-zinc-900 dark:text-zinc-100 overflow-x-auto">
                    {JSON.stringify(contract.result_payload, null, 2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Audit Trail */}
          {activeTab === "audit" && (
            <div className="space-y-4 font-sans">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 text-xs shadow-2xs font-sans">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block font-sans">
                  Financial Invariant Verification:
                </span>
                <div className="space-y-2 font-sans">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
                    <span className="text-zinc-500 dark:text-zinc-400 font-sans">Escrow Vault Deposit:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">${amountUSD} USD</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
                    <span className="text-zinc-500 dark:text-zinc-400 font-sans">Worker Agent Net Payout (98.5%):</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+${workerNetUSD} USD</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
                    <span className="text-zinc-500 dark:text-zinc-400 font-sans">Protocol Fee (1.5%):</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">+${feeUSD} USD</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

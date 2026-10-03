"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  Code2,
  FileDiff,
  Database,
  ShieldCheck,
  Lock,
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
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-[0_20px_50px_rgba(37,99,235,0.12)] animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-[#09090B]">
                  {contract.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-slate-500 hover:text-[#09090B] p-1 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                  title="Copy contract ID"
                >
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-blue-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${
                    contract.status === "SETTLED"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : contract.status === "CLAIMED" || contract.status === "FUNDED"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {contract.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Escrow Value: ${amountUSD} USD · 1.5% Protocol Fee: ${feeUSD} USD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-[#09090B] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab("spec")}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-medium font-mono transition-colors cursor-pointer ${
              activeTab === "spec"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-[#09090B]"
            }`}
          >
            <FileDiff className="h-4 w-4" />
            Milestone Details & Deliverable
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-medium font-mono transition-colors cursor-pointer ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-slate-500 hover:text-[#09090B]"
            }`}
          >
            <Database className="h-4 w-4" />
            Double-Entry Financial Trail
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Parties Meta Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Payer Agent
              </span>
              <p className="font-semibold text-[#09090B] text-sm mt-1">{contract.payer_name}</p>
              <p className="font-mono text-[11px] text-slate-500 truncate">{contract.payer_id}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Worker Agent
              </span>
              <p className="font-semibold text-[#09090B] text-sm mt-1">
                {contract.worker_name || "Awaiting Assignment..."}
              </p>
              <p className="font-mono text-[11px] text-blue-600 truncate">
                {contract.worker_id || "Unassigned"}
              </p>
            </div>
          </div>

          {/* Tab 1: Spec & Deliverable */}
          {activeTab === "spec" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#09090B]">Milestone Acceptance Spec</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">{contract.assertion_type}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Escrow Value:</span>
                    <span className="font-semibold text-[#09090B]">${amountUSD} USD</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Release Latency:</span>
                    <span className="font-semibold text-blue-600">38ms Instant</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Vault Custody Status:</span>
                    <span className="font-semibold text-[#09090B]">
                      {contract.status === "SETTLED" ? "Disbursed to Worker Agent" : "Protected in Vault"}
                    </span>
                  </div>
                </div>
              </div>

              {contract.result_payload && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-sm">
                  <span className="text-xs font-medium text-[#09090B] block">
                    Verified Deliverable Evidence:
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-[#09090B] overflow-x-auto">
                    {JSON.stringify(contract.result_payload, null, 2)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Audit Trail */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 font-mono text-xs shadow-sm">
                <span className="text-slate-500 uppercase tracking-wider block font-medium">
                  Financial Invariant Verification:
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Escrow Vault Deposit:</span>
                    <span className="font-medium text-[#09090B]">${amountUSD} USD</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Worker Agent Net Payout (98.5%):</span>
                    <span className="font-medium text-blue-600">+${workerNetUSD} USD</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Protocol Fee (1.5%):</span>
                    <span className="font-medium text-[#09090B]">+${feeUSD} USD</span>
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
